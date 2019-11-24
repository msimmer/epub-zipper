/* eslint-disable no-console */
const path = require('path')
const { spawn } = require('child_process')

const EPUBCHECK_VERSION = '4.0.2'

class Epub {
  constructor() {
    this.options = {
      input: null,
      output: null,
      modified: null,
      bookName: null,
      fileName: null,
      bookPath: null,
      clean: true,
      title: null,
      flags: ['-e'],
    }
  }

  set(key, val) {
    this.options[key] = val
    return this[key]
  }

  get(key) {
    return this.options[key]
  }

  remove() {
    return [
      `epubs=\`ls -1 ${this.get('output')}/*.epub 2>/dev/null | wc -l\`;`,
      `if [ $epubs != 0 ]; then rm ${this.get('output')}/*.epub; fi`,
    ].join(' ')
  }

  compile() {
    return [
      `zip -X0 ${this.get('bookPath')} ./mimetype`,
      `zip -X9Dr ${this.get('bookPath')} ./META-INF -x *.DS_Store`,
      `zip -X9Dr ${this.get('bookPath')} ./OPS -x *.DS_Store`,
    ].join(' && ')
  }

  validate() {
    return [
      `java -jar ${path.resolve('vendor/epubcheck.jar')}`,
      this.get('flags').join(' '),
      this.get('bookName'),
    ].join(' ')
  }

  run(cmd, cwd) {
    return new Promise((resolve, reject) => {
      const proc = spawn(this[cmd](), { cwd, shell: true })

      let internalError = 0

      proc.stdout.on('data', data => process.stdout.write(data.toString()))
      proc.stderr.on('data', data => {
        internalError = 1
        process.stderr.write(data.toString())
      })

      proc.on('close', code => {
        if (code === 1) return reject(new Error('Process exited with code 1'))
        if (internalError === 1) {
          return reject(new Error('There was an error creating the epub'))
        }
        return resolve()
      })
    })
  }

  create(args) {
    this.options = { ...this.options, ...args }
    const required = ['input', 'output']

    required.forEach(req => {
      if (!this.options[req] || !{}.hasOwnProperty.call(this.options, req)) {
        throw new Error('Missing required argument: `%s`', req)
      }
    })

    const now = new Date().toISOString().replace(/:/g, '-')
    this.set('modified', now)

    const bookName = `${this.get('fileName') || this.get('modified')}.epub`
    this.set('bookName', bookName)

    const bookPath = `"${path.resolve(
      this.get('output'),
      this.get('bookName')
    )}"`

    this.set('bookPath', bookPath)

    const chain = this.get('clean')
      ? this.run('remove', this.get('output'))
      : Promise.resolve()

    return new Promise((resolve, reject) =>
      chain
        .then(() => this.run('compile', this.get('input')))
        .then(() => {
          console.log('Validating against EPUBCheck %s', EPUBCHECK_VERSION)
          return this.run('validate', this.get('output'))
        })
        .then(resolve)
        .catch(reject)
    )
  }
}

const epub = new Epub()
module.exports = epub
