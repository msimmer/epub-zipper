const path = require('path')
const fs = require('fs')
const { execSync } = require('child_process')

const epubcheckPath = path.resolve(
  path.dirname(__dirname),
  'vendor/epubcheck.jar'
)
const versionPath = path.resolve(
  path.dirname(__dirname),
  'epubcheck-version.js'
)

const version = execSync(
  `java -jar ${epubcheckPath} --version | grep -Eo 'v\\d+\\.\\d+\\.\\d+'`
)
  .toString()
  .trim()

fs.writeFileSync(
  versionPath,
  `// Do not update this file manually\n// See package.json scripts for details\n\nmodule.exports = '${version}'\n`
)
