import {selectAll} from 'hast-util-select'
import {createStarryNight, all} from '@wooorm/starry-night'

export default function rehypeStarryNight(options = {}) {
  let factory = null
  let highlighter = null

  const {grammars = all, ...rest} = options

  return async function (tree) {
    if (!factory) {
      factory = createStarryNight(grammars, rest)
    }

    if (!highlighter) {
      highlighter = await factory
    }

    const nodes = selectAll('code', tree)

    for (const node of nodes) {
      const {className = []} = node.properties ?? {}

      const lang = className.find((cx) => cx?.startsWith('language-')) ?? ''
      const scope = highlighter.flagToScope(lang.replace('language-', ''))

      if (!scope) continue

      const [child] = node.children ?? []
      const {children = []} = highlighter.highlight(child.value, scope) ?? {}

      if (children.length > 0) node.children = children
    }
  }
}
