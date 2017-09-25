
# epub-zipper

[![Build Status](https://img.shields.io/travis/msimmer/epub-zipper/master.svg?style=flat)](https://travis-ci.org/msimmer/epub-zipper)
[![NPM version](https://badge.fury.io/js/epub-zipper.svg)](https://badge.fury.io/js/epub-zipper)
[![Code Climate](https://codeclimate.com/github/msimmer/epub-zipper/badges/gpa.svg)](https://codeclimate.com/github/msimmer/epub-zipper)

Zips a directory as an epub.  Includes a wrapper around [EpubCheck 4.0.2](https://github.com/IDPF/epubcheck/releases/tag/v4.0.1).  Returns a promise object.

## Install

```
$ npm i -S epub-zipper
```

## Usage

```js
import path from 'path'
import zipper from 'epub-zipper'

const options = {
  input: path.join(__dirname, './book-dir'),
  output: __dirname,
  clean: true // Removes existing .epubs in the output dir
}

zipper.create(options).catch(err => console.error(err))
```
