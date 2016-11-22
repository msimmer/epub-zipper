
import test from 'ava'
import epub from './index'
import path from 'path'

test('It conditionally executes a promise callback', t => {
  t.plan(2)

  const callback = Promise.resolve(1)
  const conditional = c => {
    return new Promise((resolve, reject) => {
      if (c) {
        return callback.then(resolve)
      } else {
        resolve(0)
      }
    })
  }

  const truthy = true
  const falsey = false

  return conditional(truthy)
  .then(async result => t.is(await result, 1))
  .then(() => conditional(falsey))
  .then(async result => t.is(await result, 0))
})
