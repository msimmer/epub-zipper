const { execSync } = require('child_process')

if (execSync(`git diff --quiet || echo 'dirty'`).toString()) {
  throw new Error('Repository must be clean')
}
