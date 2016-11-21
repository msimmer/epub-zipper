
# epub-zipper

Zips a directory as an epub.  Includes a wrapper around [EpubCheck 4.0.1](https://github.com/IDPF/epubcheck/releases/tag/v4.0.1).  Returns a promise object.

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
