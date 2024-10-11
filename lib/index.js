/**
 * @import {ElementContent, Root} from 'hast'
 * @import {VFile} from 'vfile'
 * @import {DistanceTuple, Options} from './types.js'
 */

import {createStarryNight, common} from '@wooorm/starry-night'
import {toString} from 'hast-util-to-string'
import {levenshteinEditDistance} from 'levenshtein-edit-distance'
import {SKIP, visitParents} from 'unist-util-visit-parents'

const listFormatDisjunction = new Intl.ListFormat('en', {type: 'disjunction'})
const listFormatUnit = new Intl.ListFormat('en', {type: 'unit'})

/** @type {Readonly<Options>} */
const emptyOptions = {}
/** @type {ReadonlyArray<never>} */
const emptyPlainText = []

const prefix = 'language-'

const relativeThreshold = 0.33
const max = 4

/**
 * Plugin to highlight code with `starry-night`.
 *
 * @param {Readonly<Options> | null | undefined} [options]
 *   Configuration (optional).
 * @returns
 *   Transform.
 */
export default function rehypeStarryNight(options) {
  const settings = options || emptyOptions
  const grammars = settings.grammars || common
  const plainText = settings.plainText || emptyPlainText
  const starryNightPromise = createStarryNight(grammars, settings)
  const names = grammars.flatMap(function (d) {
    return d.names
  })
  let checked = false

  /**
   * Transform.
   *
   * @param {Root} tree
   *   Tree.
   * @param {VFile} file
   *   File.
   * @returns {Promise<Root>}
   *   Nothing.
   */
  // To do: `unified` should support `undefined` instead of `Root`.
  return async function (tree, file) {
    const starryNight = await starryNightPromise

    if (!settings.allowMissingScopes && !checked) {
      const missingScopes = starryNight.missingScopes()

      if (missingScopes.length > 0) {
        file.message(
          'Unexpected missing scope' +
            (missingScopes.length === 1 ? '' : 's') +
            ' likely needed for highlighting to work: ' +
            listFormatUnit.format(
              missingScopes.map(function (d) {
                return '`' + d + '`'
              })
            ),
          {
            ancestors: [tree],
            place: tree.position,
            ruleId: 'missing-scopes',
            source: 'rehype-starry-night'
          }
        )
      }

      checked = true
    }

    visitParents(tree, 'element', function (node, parents) {
      if (node.tagName !== 'code') return

      const classes = node.properties.className

      if (Array.isArray(classes)) {
        // Cast as we check if it’s a string in `find`.
        const languageClass = /** @type {string | undefined} */ (
          classes.find(function (d) {
            return typeof d === 'string' && d.startsWith(prefix)
          })
        )

        if (languageClass) {
          const language = languageClass.slice(prefix.length)
          const scope = starryNight.flagToScope(language)

          if (plainText.includes(language)) {
            // Empty.
          } else if (scope) {
            const fragment = starryNight.highlight(toString(node), scope)
            node.children = /** @type {Array<ElementContent>} */ (
              fragment.children
            )
          } else {
            let reason =
              'Unexpected unknown language `' +
              language +
              '` defined with `language-` class, expected a known name'

            const similar = propose(language, names)

            if (similar.length > 0) {
              reason +=
                '; did you mean ' +
                listFormatDisjunction.format(
                  similar.map(function (d) {
                    return '`' + d + '`'
                  })
                )
            }

            file.message(reason, {
              ancestors: [...parents, node],
              place: node.position,
              ruleId: 'missing-language',
              source: 'rehype-starry-night'
            })
          }
        }
      }

      return SKIP
    })

    return tree
  }
}

/**
 * @param {string} value
 * @param {ReadonlyArray<string>} ideas
 * @returns {Array<string>}
 */
function propose(value, ideas) {
  return ideas
    .map(function (d) {
      return score(value, d)
    })
    .sort(sort)
    .filter(function (d) {
      return filter(d)
    })
    .map(function (d) {
      return pick(d)
    })
    .slice(0, max)
}

/**
 * @param {string} value
 * @param {string} d
 * @returns {DistanceTuple}
 */
function score(value, d) {
  return [d, levenshteinEditDistance(value, d) / value.length]
}

/**
 * @param {DistanceTuple} a
 * @param {DistanceTuple} b
 * @returns {number}
 */
function sort(a, b) {
  return a[1] - b[1]
}

/**
 * @param {DistanceTuple} d
 * @returns {boolean}
 */
function filter(d) {
  return d[1] < relativeThreshold
}

/**
 * @param {DistanceTuple} d
 * @returns {string}
 */
function pick(d) {
  return d[0]
}
