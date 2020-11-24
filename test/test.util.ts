import * as assert from 'power-assert'
import { Context } from 'egg'

import { Jwt } from '../src'
import { initialJwtOptions } from '../src/lib/config'

import { payload1, testRedirectURL } from './test.config'


export function createContext(props?: object): Context {
  const ctx = {
    throw: (status: number, message: string) => {
      throw new Error(`${status}:${message}`)
    },
    state: {},
    app: {
      jwt: new Jwt(initialJwtOptions),
    },
    ...props,
  } as Context

  ctx.redirect = (url: string) => {
    assert(url && url.includes(testRedirectURL))
  }

  return ctx
}

export function createNextCb(
  ctx: Context,
  expectExceptionMsg?: string,
): () => Promise<void> {

  return () => {
    return new Promise((done) => {
      if (ctx.state.jwtOriginalError) {
        assert(ctx.state.jwtOriginalError instanceof Error)
        const msg: string = ctx.state.jwtOriginalError.message
        assert(expectExceptionMsg, 'Should pass expectExceptionMsg')
        assert(msg && msg.includes(expectExceptionMsg as string))
      }
      else {
        assert.deepStrictEqual(ctx.jwtState && ctx.jwtState.user, payload1)
      }

      done()
    })
  }
}
