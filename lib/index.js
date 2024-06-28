/**
 * @import {ElementContent, Root} from 'hast'
 * @import {Options} from './types.js'
 */

import {createStarryNight, common} from '@wooorm/starry-night'
import {toString} from 'hast-util-to-string'
import {SKIP, visitParents} from 'unist-util-visit-parents'

/** @type {Readonly<Options>} */
const emptyOptions = {}

const prefix = 'language-'

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
  const {grammars, ...rest} = settings
  const starryNightPromise = createStarryNight(grammars || common, rest)

  /**
   * Transform.
   *
   * @param {Root} tree
   *   Tree.
   * @returns {Promise<Root>}
   *   Nothing.
   */
  // To do: `unified` should support `undefined` instead of `Root`.
  return async function (tree) {
    const starryNight = await starryNightPromise

    visitParents(tree, 'element', function (node) {
      if (node.tagName !== 'code') return

      const classes = node.properties.className

      if (Array.isArray(classes)) {
        // Cast as we check if it’s a string in `find`.
        const language = /** @type {string | undefined} */ (
          classes.find(function (d) {
            return typeof d === 'string' && d.startsWith(prefix)
          })
        )

        if (language) {
          const scope = starryNight.flagToScope(language.slice(prefix.length))

          if (scope) {
            const fragment = starryNight.highlight(toString(node), scope)
            node.children = /** @type {Array<ElementContent>} */ (
              fragment.children
            )
          }
        }
      }

      return SKIP
    })

    return tree
  }
}
