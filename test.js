
import test from 'ava'
import epub from './index'
import path from 'path'
import { exec } from 'child_process'

test('It conditionally executes a promise callback', t => {
  t.plan(2)

  const callback = Promise.resolve(1)
  const conditional = c => {
    return new Promise((resolve/* , reject */) =>
      c ? callback.then(resolve) : resolve(0)
    )
  }

  const truthy = true
  const falsey = false

  return conditional(truthy)
  .then(async result => t.is(await result, 1))
  .then(() => conditional(falsey))
  .then(async result => t.is(await result, 0))
})

test('It makes a book', (t) => {
  t.plan(1)

  const verify = () =>
    new Promise((resolve, reject) =>
      exec('ls *.epub;', { cwd: __dirname }, (err, stdout, stderr) => {
        resolve(t.regex(stdout, /epub\s*$/))
      })
    )

  return epub.create({
    input: path.join(__dirname, 'book'),
    output: __dirname,
    clean: true
  })
  .then(() => verify())
})
