/* eslint-disable no-console */
const path = require('path')
const { exec } = require('child_process')

const EPUBCHECK_VERSION = '4.0.2'

function reporter(err, stdout, stderr, reject) {
  if (err) reject(err)
  if (stderr !== '') reject(new Error(stderr))
  if (stdout !== '') console.log(stdout)
}

function report(err, stdout, stderr, reject) {
  return reporter(err, stdout, stderr, reject)
}

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
      `java -jar ${path.resolve(__dirname, 'vendor/epubcheck.jar')}`,
      this.get('flags').join(' '),
      this.get('bookName'),
    ].join(' ')
  }

  run(cmd, dir) {
    return new Promise((resolve, reject) => {
      exec(this[cmd](), { cwd: dir }, (err, stdout, stderr) => {
        report(err, stdout, stderr, reject)
        resolve()
      })
    })
  }

  create(args) {
    Object.assign(this.options, args)
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

    return chain
      .then(() => this.run('compile', this.get('input')))
      .then(() => {
        console.log('Validating against EpubCheck %s', EPUBCHECK_VERSION)
        return this.run('validate', this.get('output'))
      })
      .catch(console.error)
  }
}

const epub = new Epub()
module.exports = epub
