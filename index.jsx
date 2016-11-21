
import path from 'path'
import { exec } from 'child_process'

class Epub {
  constructor() {
    this.options = {
      input: null,
      output: null,
      bookname: null,
      clean: true,
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

  static remove() {
    return 'epubs=`ls -1 *.epub 2>/dev/null | wc -l`; if [ $epubs != 0 ]; then rm *.epub; fi'
  }

  static report(err, stdout, stderr, reject) {
    if (err) { reject(err) }
    if (stderr !== '') { reject(new Error(stderr)) }
    if (stdout !== '') { console.log(stdout) } // eslint-disable-line no-console
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

  conditionally(test, { cmd, dir }) {
    return new Promise((resolve/* , reject */) => {
      if (test) {
        this.run(cmd, dir).then(resolve)
      } else {
        resolve()
      }
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
    this._set('modified', new Date().toISOString())
    this._set('bookname', `${this._get('modified')}.epub`)
    this._set('bookpath', `"${path.resolve(this._get('output'), this._get('bookname'))}"`)
    return new Promise(resolve/* , reject */ =>
      this.conditionally(this._get('clean'), { cmd: 'remove', output: this._get('output') })
      .then(() => this.run('compile', { output: this._get('input') }))
      .then(() => this.run('validate', { output: this._get('output') }))
      .catch(err => console.error(err)) // eslint-disable-line no-console
      .then(resolve)
    )
  }
}

const epub = new Epub()
export default epub
