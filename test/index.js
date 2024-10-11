import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import process from 'node:process'
import test from 'node:test'
import {common} from '@wooorm/starry-night'
import textXmlSvg from '@wooorm/starry-night/text.xml.svg'
import sourceObjc from '@wooorm/starry-night/source.objc'
import sourceTsx from '@wooorm/starry-night/source.tsx'
import rehypeParse from 'rehype-parse'
import rehypeStarryNight from 'rehype-starry-night'
import rehypeStringify from 'rehype-stringify'
import {read, write} from 'to-vfile'
import {unified} from 'unified'
import {VFile} from 'vfile'

test('rehypeStarryNight', async function (t) {
  await t.test('should expose the public api', async function () {
    assert.deepEqual(Object.keys(await import('rehype-starry-night')).sort(), [
      'default'
    ])
  })

  await t.test('should work', async function () {
    const file = await unified()
      .use(rehypeParse, {fragment: true})
      .use(rehypeStarryNight)
      .use(rehypeStringify)
      .process(
        `
<pre><code class="language-ts">const hi = 'Hello'
alert(hi)
</code></pre>
`
      )

    assert.equal(
      String(file),
      `
<pre><code class="language-ts"><span class="pl-k">const</span> <span class="pl-c1">hi</span> <span class="pl-k">=</span> <span class="pl-s"><span class="pl-pds">'</span>Hello<span class="pl-pds">'</span></span>
<span class="pl-en">alert</span>(<span class="pl-smi">hi</span>)
</code></pre>
`
    )
    assert.deepEqual(file.messages.map(String), [])
  })

  await t.test('should warn for unregistered languages', async function () {
    const file = await unified()
      .use(rehypeParse, {fragment: true})
      .use(rehypeStarryNight)
      .use(rehypeStringify)
      .process('<pre><code class="language-hypescript"></code></pre>')

    assert.equal(
      String(file),
      '<pre><code class="language-hypescript"></code></pre>'
    )
    assert.deepEqual(file.messages.map(String), [
      '1:6-1:47: Unexpected unknown language `hypescript` defined with `language-` class, expected a known name; did you mean `typescript` or `cakescript`'
    ])
  })

  await t.test('should ignore languages in `plainText`', async function () {
    const file = await unified()
      .use(rehypeParse, {fragment: true})
      .use(rehypeStarryNight, {plainText: ['hypescript', 'javascript']})
      .use(rehypeStringify)
      .process(
        '<pre><code class="language-javascript">"hi"</code></pre>\n<pre><code class="language-hypescript"></code></pre>'
      )

    assert.equal(
      String(file),
      '<pre><code class="language-javascript">"hi"</code></pre>\n<pre><code class="language-hypescript"></code></pre>'
    )
    assert.deepEqual(file.messages.map(String), [])
  })

  await t.test('should warn for missing scopes (1)', async function () {
    const file = await unified()
      .use(rehypeParse, {fragment: true})
      .use(rehypeStarryNight, {grammars: [textXmlSvg]})
      .use(rehypeStringify)
      .process(
        '<pre><code class="language-svg">&lt;svg>&lt;rect/>&lt;/svg></pre>'
      )

    assert.equal(
      String(file),
      '<pre><code class="language-svg">&#x3C;<span class="pl-ent">svg</span>>&#x3C;<span class="pl-ent">rect</span>/>&#x3C;/<span class="pl-ent">svg</span>></code></pre>'
    )
    assert.deepEqual(file.messages.map(String), [
      '1:1-1:66: Unexpected missing scope likely needed for highlighting to work: `text.xml`'
    ])
  })

  await t.test('should warn for missing scopes (2)', async function () {
    const file = await unified()
      .use(rehypeParse, {fragment: true})
      .use(rehypeStarryNight, {grammars: [sourceObjc]})
      .use(rehypeStringify)
      .process(
        '<pre><code class="language-objc">- (int)method:(int)i {\n  return [self square_root:i];\n}</pre>'
      )

    assert.equal(
      String(file),
      '<pre><code class="language-objc">- (int)method:(int)i {\n  return [<span class="pl-c1">self</span> <span class="pl-c1">square_root:</span>i];\n}</code></pre>'
    )
    assert.deepEqual(file.messages.map(String), [
      '1:1-3:8: Unexpected missing scopes likely needed for highlighting to work: `source.c`, `source.c.platform`, `source.objc.platform`'
    ])
  })

  await t.test(
    'should not warn for missing scopes w/ `allowMissingScopes`',
    async function () {
      const file = await unified()
        .use(rehypeParse, {fragment: true})
        .use(rehypeStarryNight, {
          allowMissingScopes: true,
          grammars: [textXmlSvg, sourceObjc]
        })
        .use(rehypeStringify)
        .process('')

      assert.deepEqual(file.messages.map(String), [])
    }
  )
})

test('fixtures', async function (t) {
  const base = new URL('fixtures/', import.meta.url)
  const folders = await fs.readdir(base)

  for (const folder of folders) {
    if (folder.charAt(0) === '.') continue

    await t.test(folder, async function () {
      const folderUrl = new URL(folder + '/', base)
      const outputUrl = new URL('output.html', folderUrl)
      const input = await read(new URL('input.html', folderUrl))
      const processor = await unified()
        .use(rehypeParse, {fragment: true})
        .use(rehypeStarryNight, {grammars: [...common, sourceTsx]})
        .use(rehypeStringify)

      await processor.process(input)

      /** @type {VFile} */
      let output

      try {
        if ('UPDATE' in process.env) {
          throw new Error('Updating…')
        }

        output = await read(outputUrl)
        output.value = String(output)
      } catch {
        output = new VFile({
          path: outputUrl,
          value: String(input)
        })
        await write(output)
      }

      assert.equal(String(input), String(output))

      // This has warnings, and that is expected.
      if (folder === 'empty') {
        return
      }

      assert.deepEqual(input.messages.map(String), [])
    })
  }
})
