'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _child_process = require('child_process');

var _logger = require('./logger');

var _logger2 = _interopRequireDefault(_logger);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var timestamp = String(Date.now());
var bookname = '"' + timestamp + '.epub"';
var bookpath = _path2.default.join(__dirname, '../', bookname);

var commands = {
  remove: 'epubs=`ls -1 *.epub 2>/dev/null | wc -l`; if [ $epubs != 0 ]; then rm *.epub; fi',
  compile: ['zip -X0 ' + bookpath + ' ./mimetype', 'zip -X9Dr ' + bookpath + ' ./META-INF -x *.DS_Store', 'zip -X9Dr ' + bookpath + ' ./OPS -x *.DS_Store'].join(' && '),
  // TODO: assumes that epubcheck is symlinked to ./epubcheck
  validate: 'java -jar epubcheck -e ' + bookname // -e: only show fatal errors
};

var report = function report(err, stdout, stderr, reject) {
  if (err) {
    reject(err);
  }
  if (stderr !== '') {
    reject(new Error(stderr));
  }
  if (stdout !== '') {
    _logger2.default.info(stdout);
  }
};

var run = function run(cmd, dir) {
  return new _promise2.default(function (resolve, reject) {
    return (0, _child_process.exec)(commands[cmd], { cwd: dir }, function (err, stdout, stderr) {
      report(err, stdout, stderr, reject);
      resolve();
    });
  });
};

var epub = function epub() {
  return new _promise2.default(function (resolve /* , reject */) {
    return run('remove', './').then(function () {
      return run('compile', _config2.default.dist);
    }).then(function () {
      return run('validate', './');
    }).catch(function (err) {
      return _logger2.default.error(err);
    }).then(resolve);
  });
};

exports.default = epub;
