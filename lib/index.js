/* eslint-disable unicorn/no-array-for-each, logical-assignment-operators */
/**
 * @import {ElementContent, Root} from 'hast'
 * @import {Options} from './types.js'
 */

import {ok as assert} from 'devlop'
import {selectAll} from 'hast-util-select'
import {common, createStarryNight} from '@wooorm/starry-night'

/** @type {Readonly<Options>} */
const emptyOptions = {}

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
  /** @type {ReturnType<typeof createStarryNight> | null} */
  let factory = null
  /** @type {Awaited<ReturnType<typeof createStarryNight>> | null} */
  let highlighter = null

  /**
   * @param {Root} tree
   * @returns {Promise<void>}
   */
  return async function (tree) {
    if (!factory) {
      factory = createStarryNight(grammars, options)
    }

    if (!highlighter) {
      highlighter = await factory
    }

    selectAll('code', tree).forEach((node) => {
      const properties = node.properties ?? {}
      const className = properties.className ?? []
      if (!Array.isArray(className)) return
      const lang =
        /** @type {string} */
        (className.find((cx) => String(cx).startsWith('language-')) ?? '')
      assert(highlighter)
      const scope = highlighter.flagToScope(lang.replace('language-', ''))

      if (!scope) return

      const [child] = node.children ?? []
      assert(child)
      assert(child.type === 'text')
      const result = highlighter.highlight(child.value, scope) ?? {}

      if (result.children.length > 0) {
        node.children = /** @type {Array<ElementContent>} */ (result.children)
      }
    })
  }
}
