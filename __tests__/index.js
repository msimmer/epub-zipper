const path = require('path')
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const fs = require('fs')
const zipper = require('../index')

chai.should()
chai.use(chaiAsPromised)

const inputSuccess = path.resolve(__dirname, 'book-success')
const inputError = path.resolve(__dirname, 'book-error')
const output = path.resolve(__dirname)

describe('epub-zipper', () => {
  const origStdout = process.stdout.write
  const origStderr = process.stderr.write

  before(() => {
    process.stdout.write = () => {}
    process.stderr.write = () => {}
  })

  after(() => {
    process.stdout.write = origStdout
    process.stderr.write = origStderr
  })

  it('creates an epub', () => {
    return zipper
      .create({ input: inputSuccess, output, clean: true })
      .then(() => {
        const epubs = fs
          .readdirSync(output)
          .filter(f => path.extname(f) === '.epub')

        epubs.should.have.lengthOf(1)
        epubs[0].should.match(/\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.\d{3}Z/)
      })
  })

  it('rejects errors', () => {
    return chai
      .expect(zipper.create({ input: inputError, output, clean: true }))
      .to.eventually.be.rejectedWith(Error)
  })
})
