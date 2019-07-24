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

  _set(key, val) {
    this.options[key] = val
    return this[key]
  }

  _get(key) {
    return this.options[key]
  }

  remove() {
    return [
      `epubs=\`ls -1 ${this._get('output')}/*.epub 2>/dev/null | wc -l\`;`,
      `if [ $epubs != 0 ]; then rm ${this._get('output')}/*.epub; fi`,
    ].join(' ')
  }

  compile() {
    return [
      `zip -X0 ${this._get('bookPath')} ./mimetype`,
      `zip -X9Dr ${this._get('bookPath')} ./META-INF -x *.DS_Store`,
      `zip -X9Dr ${this._get('bookPath')} ./OPS -x *.DS_Store`,
    ].join(' && ')
  }

  validate() {
    return [
      `java -jar ${path.resolve(__dirname, 'vendor/epubcheck.jar')}`,
      this._get('flags').join(' '),
      this._get('bookName'),
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
        throw new Error(`Missing required argument: \`${req}\``)
      }
    })

    const now = new Date().toISOString().replace(/:/g, '-')
    this._set('modified', now)

    const bookName = `${this._get('fileName') || this._get('modified')}.epub`
    this._set('bookName', bookName)

    const bookPath = `"${path.resolve(
      this._get('output'),
      this._get('bookName')
    )}"`
    this._set('bookPath', bookPath)

    const chain = this._get('clean')
      ? this.run('remove', this._get('output'))
      : Promise.resolve()

    return chain
      .then(() => this.run('compile', this._get('input')))
      .then(() => {
        console.log(`Validating against EpubCheck ${EPUBCHECK_VERSION}`)
        return this.run('validate', this._get('output'))
      })
      .catch(console.error)
  }
}

const epub = new Epub()
module.exports = epub
