
# epub-zipper

[![NPM version](https://badge.fury.io/js/epub-zipper.svg)](https://badge.fury.io/js/epub-zipper)
[![Code Climate](https://codeclimate.com/github/msimmer/epub-zipper/badges/gpa.svg)](https://codeclimate.com/github/msimmer/epub-zipper)
[![CircleCI](https://circleci.com/gh/msimmer/epub-zipper.svg?style=svg)](https://circleci.com/gh/msimmer/epub-zipper)

Zips a directory as an epub.  Includes a wrapper around [EpubCheck](https://github.com/IDPF/epubcheck/).  Returns a promise object.

## Install

```
$ npm i -S epub-zipper
```

## Use

```js
const path = require('path')
const zipper = require('epub-zipper')

const options = {
  input: path.join(__dirname, 'book-dir'),
  output: __dirname,
  clean: true // Removes existing .epubs from the output dir
}

zipper.create(options).catch(console.error)
```
