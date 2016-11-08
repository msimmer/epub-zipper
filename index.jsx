
import path from 'path'
import { exec } from 'child_process'

class Epub {
  constructor() {

    this.input = null
    this.output = null
    this.clean = null
    this.modified = null
    this.bookname = null
    this.bookpath = null

    this._set = function _set(key, val) {
      this[key] = val
      return this[key]
    }

    this._get = function _get(key) {
      return this[key]
    }

    this.remove = function remove() {
      return 'epubs=`ls -1 *.epub 2>/dev/null | wc -l`; if [ $epubs != 0 ]; then rm *.epub; fi'
    }

    this.compile = function compile() {
      return [
        `zip -X0 ${this._get('bookpath')} ./mimetype`,
        `zip -X9Dr ${this._get('bookpath')} ./META-INF -x *.DS_Store`,
        `zip -X9Dr ${this._get('bookpath')} ./OPS -x *.DS_Store`
      ].join(' && ')
    }

    this.validate = function validate() {
      return `java -jar ${path.resolve(__dirname, './vendor/epubcheck.jar')} -e ${this._get('bookname')}` // -e: only show fatal errors
    }

    this.report = function report(err, stdout, stderr, reject) {
      if (err) { reject(err) }
      if (stderr !== '') { reject(new Error(stderr)) }
      if (stdout !== '') { console.log(stdout) }
    }

    this.run = function(cmd, dir) {
      return new Promise((resolve, reject) => {
        exec(this[cmd](), { cwd: dir }, (err, stdout, stderr) => {
          this.report(err, stdout, stderr, reject)
          resolve()
        })
      })
    }

    this.conditionally = function conditionally(test, { cmd, dir }) {
      return new Promise((resolve /* , reject */) => {
        if (test) {
          this.run(cmd, dir).then(resolve)
        } else {
          resolve()
        }
      })
    }

    this.create = function create({ ...args }) {
      const { input, output, clean } = args
      this._set('input', input)
      this._set('output', output)
      this._set('clean', clean)
      this._set('modified', new Date().toISOString())
      this._set('bookname', `${this._get('modified')}.epub`)
      this._set('bookpath', `"${path.resolve(__dirname, this._get('input'), '../', this._get('bookname'))}"`)
      return new Promise(resolve/* , reject */ =>
        this.conditionally(clean, { cmd: 'remove', output })
        .then(() => this.run('compile', input))
        .then(() => this.run('validate', output))
        .catch(err => console.error(err))
        .then(resolve)
      )
    }

  }
}

const epub = new Epub()
export default epub
