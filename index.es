/* eslint-disable no-console */
import path from 'path'
import { exec } from 'child_process'

const EPUBCHECK_VERSION = '4.0.2'

class Epub {
  static reporter(err, stdout, stderr, reject) {
    if (err) { reject(err) }
    if (stderr !== '') { reject(new Error(stderr)) }
    if (stdout !== '') { console.log(stdout) }
  }

  static conditional(test, callback) {
    return new Promise(async resolve/* , reject */ =>  // eslint-disable-line no-confusing-arrow
      test ? await callback().then(resolve) : resolve()
    )
  }

  report(err, stdout, stderr, reject) {
    return this.constructor.reporter(err, stdout, stderr, reject)
  }

  iff(test, callback) {
    return this.constructor.conditional(test, callback)
  }

  constructor() {
    this.options = {
      input: null,
      output: null,
      modified: null,
      bookname: null,
      bookpath: null,
      clean: true,
      title: null,
      flags: ['-e']
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
      `if [ $epubs != 0 ]; then rm ${this._get('output')}/*.epub; fi`
    ].join(' ')
  }

  compile() {
    return [
      `zip -X0 ${this._get('bookpath')} ./mimetype`,
      `zip -X9Dr ${this._get('bookpath')} ./META-INF -x *.DS_Store`,
      `zip -X9Dr ${this._get('bookpath')} ./OPS -x *.DS_Store`
    ].join(' && ')
  }

  validate() {
    return [
      `java -jar ${path.resolve(__dirname, 'vendor/epubcheck.jar')}`,
      this._get('flags').join(' '),
      this._get('bookname')
    ].join(' ')
  }

  run(cmd, dir) {
    return new Promise((resolve, reject) => {
      exec(this[cmd](), { cwd: dir }, (err, stdout, stderr) => {
        this.report(err, stdout, stderr, reject)
        resolve()
      })
    })
  }

  create({ ...args }) {
    Object.assign(this.options, args)
    const required = ['input', 'output']
    required.forEach((_) => {
      if (!this.options[_] || !{}.hasOwnProperty.call(this.options, _)) {
        throw new Error(`Missing required argument: \`${_}\``)
      }
    })
    this._set('modified', new Date().toISOString().replace(/:/g, '-'))
    this._set('bookname', `${this._get('modified')}.epub`)
    this._set('bookpath', `"${path.resolve(this._get('output'), this._get('bookname'))}"`)
    return new Promise(resolve/* , reject */ =>
      this.iff(this._get('clean'), () => this.run('remove', this._get('output')))
      .then(() => this.run('compile', this._get('input')))
      .then(() => {
        console.log(`Validating against EpubCheck ${EPUBCHECK_VERSION}`)
        return this.run('validate', this._get('output'))
      })
      .catch(err => console.error(err.message))
      .then(resolve)
    )
  }
}


const epub = new Epub()
export default epub
