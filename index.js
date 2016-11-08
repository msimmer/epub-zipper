'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _objectWithoutProperties2 = require('babel-runtime/helpers/objectWithoutProperties');

var _objectWithoutProperties3 = _interopRequireDefault(_objectWithoutProperties2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _child_process = require('child_process');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Epub = function Epub() {
  (0, _classCallCheck3.default)(this, Epub);


  this.input = null;
  this.output = null;
  this.clean = null;
  this.modified = null;
  this.bookname = null;
  this.bookpath = null;

  this._set = function _set(key, val) {
    this[key] = val;
    return this[key];
  };

  this._get = function _get(key) {
    return this[key];
  };

  this.remove = function remove() {
    return 'epubs=`ls -1 *.epub 2>/dev/null | wc -l`; if [ $epubs != 0 ]; then rm *.epub; fi';
  };

  this.compile = function compile() {
    return ['zip -X0 ' + this._get('bookpath') + ' ./mimetype', 'zip -X9Dr ' + this._get('bookpath') + ' ./META-INF -x *.DS_Store', 'zip -X9Dr ' + this._get('bookpath') + ' ./OPS -x *.DS_Store'].join(' && ');
  };

  this.validate = function validate() {
    return 'java -jar ' + _path2.default.resolve(__dirname, './vendor/epubcheck.jar') + ' -e ' + this._get('bookname'); // -e: only show fatal errors
  };

  this.report = function report(err, stdout, stderr, reject) {
    if (err) {
      reject(err);
    }
    if (stderr !== '') {
      reject(new Error(stderr));
    }
    if (stdout !== '') {
      console.log(stdout);
    }
    // if (stdout !== '') { logger.info(stdout) }
  };

  this.run = function (cmd, dir) {
    var _this = this;

    return new _promise2.default(function (resolve, reject) {
      (0, _child_process.exec)(_this[cmd](), { cwd: dir }, function (err, stdout, stderr) {
        _this.report(err, stdout, stderr, reject);
        resolve();
      });
    });
  };

  this.conditional = function conditional(test, _ref) {
    var _this2 = this;

    var cmd = _ref.cmd,
        dir = _ref.dir;

    return new _promise2.default(function (resolve /* , reject */) {
      if (test) {
        _this2.run(cmd, dir).then(resolve);
      } else {
        resolve();
      }
    });
  };

  this.create = function create(_ref2) {
    var _this3 = this;

    var args = (0, _objectWithoutProperties3.default)(_ref2, []);
    var input = args.input,
        output = args.output,
        clean = args.clean;

    this._set('input', input);
    this._set('output', output);
    this._set('clean', clean);
    this._set('modified', new Date().toISOString());
    this._set('bookname', this._get('modified') + '.epub');
    this._set('bookpath', '"' + _path2.default.resolve(__dirname, this._get('input'), '../', this._get('bookname')) + '"');
    return new _promise2.default(function (resolve /* , reject */) {
      return _this3.conditional(clean, { cmd: 'remove', output: output }).then(function () {
        return _this3.run('compile', input);
      }).then(function () {
        return _this3.run('validate', output);
      }).catch(function (err) {
        return console.error(err);
      }).then(resolve);
    });
  };
};

var epub = new Epub();
exports.default = epub;
