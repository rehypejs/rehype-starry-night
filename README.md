# rehype-starry-night

## What is it?

It's a [rehype](https://github.com/rehypejs/rehype) plugin to transform `<code>` blocks with language attribute with @wooorm's [starry-night](https://github.com/wooorm/starry-night) code syntax highlighter.

You may want to try this if you were unhappy with results from [prism](https://github.com/PrismJS/prism/) or [shiki](https://github.com/shikijs/shiki).

## How to use?

1. Install the plugin with npm (`npm install rehype-starry-night`)
2. Use in a unified pipeline like this:

```js
import fs from 'node:fs/promises'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import rehypeStarryNight from 'rehype-starry-night'

const file = await unified()
  .use(remarkParse)
  .use(remarkRehype)
  .use(rehypeStarryNight)
  .use(rehypeStringify)
  .process(await fs.readFile('example.md'))

console.log(String(file))
```

## Configure?

The options you can pass are the same as the original project, which you can find [here](https://github.com/wooorm/starry-night#createstarrynightgrammars-options).

Since _most of the time_ this plugin will be used in a larger context which involves pre-processing of markdown, i took the freedom to default `grammars` to `all` which means all languages should be supported out of the box. There's no extra cost at install since this `all` is brought by starry night, and should not impact performance as long as you don't run this in the browser.
