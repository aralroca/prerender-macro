import { describe, expect, it } from 'bun:test'
import { join } from 'node:path'
import { prerender } from './prerender'

describe('prerender', () => {
  it('should works with Brisa', async () => {
     const result = await prerender({
      componentPath: join(import.meta.dir, '__fixtures__', 'test-component.tsx'),
      componentModuleName: 'default',
      componentProps: { name: 'Brisa' },
      renderToStringPath: "brisa/server",
      renderToStringModuleName: "renderToString",
      injectStringIntoJSXPath: "brisa",
      injectStringIntoJSXModuleName: "dangerHTML",
     })

    expect(result).toStrictEqual({
      type: "HTML",
      props: {
        html: "<div>Hello, Brisa!</div>",
      },
    })
  })
});