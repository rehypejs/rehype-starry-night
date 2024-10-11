# rehype-starry-night

[![Build][badge-build-image]][badge-build-url]
[![Coverage][badge-coverage-image]][badge-coverage-url]
[![Downloads][badge-downloads-image]][badge-downloads-url]
[![Size][badge-size-image]][badge-size-url]
[![Sponsors][badge-sponsors-image]][badge-collective-url]
[![Backers][badge-backers-image]][badge-collective-url]
[![Chat][badge-chat-image]][badge-chat-url]

**[rehype][github-rehype]** plugin to apply syntax highlighting to code with
[`starry-night`][github-starry-night].

## Contents

* [What is this?](#what-is-this)
* [When should I use this?](#when-should-i-use-this)
* [Install](#install)
* [Use](#use)
* [API](#api)
  * [`Options`](#options)
  * [`rehypeStarryNight(options) (default)`](#rehypestarrynightoptions-default)
* [HTML](#html)
* [CSS](#css)
* [Compatibility](#compatibility)
* [Security](#security)
* [Related](#related)
* [Contribute](#contribute)
* [License](#license)

## What is this?

This package is a [unified][github-unified] ([rehype][github-rehype]) plugin to
perform syntax highlighting.
It uses [`starry-night`][github-starry-night],
which is a high quality highlighter that can support tons of grammars and
approaches how GitHub renders code.

## When should I use this?

This plugin is useful when you want to perform syntax highlighting in rehype.
If you are not using rehype,
you can instead use [`starry-night`][github-starry-night] directly.

You can combine this package with [`rehype-twoslash`][github-rehype-twoslash].
That processes JavaScript and TypeScript code with [`twoslash`][twoslash] and
also uses `starry-night` just for that code.

`starry-night` has a WASM dependency,
and rather big grammars,
which means that this plugin might be too heavy particularly in browsers,
in which case [`rehype-highlight`][github-rehype-highlight] might be more
suitable.

## Install

This package is [ESM only][github-gist-esm].
In Node.js (version 16+), install with [npm][npm-install]:

```sh
npm install rehype-starry-night
```

In Deno with [`esm.sh`][esmsh]:

```js
import rehypeStarryNight from 'https://esm.sh/rehype-starry-night@2'
```

In browsers with [`esm.sh`][esmsh]:

```html
<script type="module">
  import rehypeStarryNight from 'https://esm.sh/rehype-starry-night@2?bundle'
</script>
```

## Use

Say we have the following file `example.md`:

````markdown
# Neptune

```rs
fn main() {
    println!("Hello, Neptune!");
}
```
````

…and our module `example.js` contains:

```js
import rehypeStarryNight from 'rehype-starry-night'
import rehypeStringify from 'rehype-stringify'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import {read} from 'to-vfile'
import {unified} from 'unified'

const file = await read('example.md')

await unified()
  .use(remarkParse)
  .use(remarkRehype)
  .use(rehypeStarryNight)
  .use(rehypeStringify)
  .process(file)

console.log(String(file))
```

…then running `node example.js` yields:

```html
<h1>Neptune</h1>
<pre><code class="language-rs"><span class="pl-k">fn</span> <span class="pl-en">main</span>() {
    <span class="pl-en">println!</span>(<span class="pl-s"><span class="pl-pds">"</span>Hello, Neptune!<span class="pl-pds">"</span></span>);
}
</code></pre>
```

## API

### `Options`

Configuration for `rehype-starry-night`.

###### Extends

* `StarryNightOptions`

###### Fields

* `allowMissingScopes?` (`boolean | null | undefined`)
  — do not warn for missing scopes (default: `false`)
* `grammars?` (`ReadonlyArray<Grammar> | null | undefined`)
  — grammars to support (default: `common`)
* `plainText?` (`ReadonlyArray<string> | null | undefined`)
  — list of language names to not highlight (default: `[]`)

### `rehypeStarryNight(options) (default)`

Plugin to highlight code with `starry-night`.

###### Parameters

* `options?` (`Readonly<Options> | null | undefined`)
  — configuration (optional)

###### Returns

Transform (`(tree: Root, file: VFile) => Promise<Root>`).

## HTML

On the input side,
this plugin looks for code blocks with a `language-*` class.

On the output side,
this plugin generates `span` elements with classes that can be enhanced with
CSS.

## CSS

See [“CSS” in `starry-night`][github-starry-night-css] for more info.

## Compatibility

Projects maintained by the unified collective are compatible with maintained
versions of Node.js.

When we cut a new major release, we drop support for unmaintained versions of
Node.
This means we try to keep the current release line, `rehype-starry-night@2`,
compatible with Node.js 16.

## Security

This package is safe.

## Related

* [`rehype-highlight`][github-rehype-highlight]
  — highlight code blocks with `lowlight`
* [`rehype-twoslash`][github-rehype-twoslash]
  — process JavaScript/TypeScript code with `twoslash` and `starry-night` too

## Contribute

See [`contributing.md`][health-contributing] in [`rehypejs/.github`][health]
for ways to get started.
See [`support.md`][health-support] for ways to get help.

This project has a [code of conduct][health-coc].
By interacting with this repository, organization, or community you agree to
abide by its terms.

## License

[MIT][file-license] © [Julien Barbay][github-y-nk]

<!-- Definitions -->

[badge-backers-image]: https://opencollective.com/unified/backers/badge.svg

[badge-build-image]: https://github.com/rehypejs/rehype-starry-night/actions/workflows/main.yml/badge.svg

[badge-build-url]: https://github.com/rehypejs/rehype-starry-night/actions

[badge-collective-url]: https://opencollective.com/unified

[badge-coverage-image]: https://img.shields.io/codecov/c/github/rehypejs/rehype-starry-night.svg

[badge-coverage-url]: https://codecov.io/github/rehypejs/rehype-starry-night

[badge-downloads-image]: https://img.shields.io/npm/dm/rehype-starry-night.svg

[badge-downloads-url]: https://www.npmjs.com/package/rehype-starry-night

[badge-size-image]: https://img.shields.io/bundlejs/size/rehype-starry-night

[badge-size-url]: https://bundlejs.com/?q=rehype-starry-night

[badge-sponsors-image]: https://opencollective.com/unified/sponsors/badge.svg

[badge-chat-image]: https://img.shields.io/badge/chat-discussions-success.svg

[badge-chat-url]: https://github.com/rehypejs/rehype/discussions

[esmsh]: https://esm.sh

[file-license]: license

[github-gist-esm]: https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c

[github-rehype]: https://github.com/rehypejs/rehype

[github-rehype-highlight]: https://github.com/rehypejs/rehype-highlight

[github-rehype-twoslash]: https://github.com/rehypejs/rehype-twoslash

[github-starry-night]: https://github.com/wooorm/starry-night

[github-starry-night-css]: https://github.com/wooorm/starry-night#css

[github-unified]: https://github.com/unifiedjs/unified

[github-y-nk]: https://github.com/y-nk

[health-coc]: https://github.com/rehypejs/.github/blob/main/code-of-conduct.md

[health-contributing]: https://github.com/rehypejs/.github/blob/main/contributing.md

[health-support]: https://github.com/rehypejs/.github/blob/main/support.md

[health]: https://github.com/rehypejs/.github

[npm-install]: https://docs.npmjs.com/cli/install

[twoslash]: https://twoslash.netlify.app
