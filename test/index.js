import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import process from 'node:process'
import test from 'node:test'
import rehypeParse from 'rehype-parse'
import rehypeStringify from 'rehype-stringify'
import {read, write} from 'to-vfile'
import {unified} from 'unified'
import {VFile} from 'vfile'
import rehypeStarryNight from '../index.js'

// To do: export map and import self.

test('rehypeStarryNight', async function (t) {
  await t.test('should expose the public api', async function () {
    assert.deepEqual(Object.keys(await import('../index.js')).sort(), [
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
        .use(rehypeStarryNight)
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
      assert.deepEqual(input.messages.map(String), [])
    })
  }
})
