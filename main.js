'use strict';

var spawn = require('child_process').spawn;
var uuid = require('uuid');
var fs = require('fs');
var level = require('level');
var Sublevel = require('level-sublevel');
var concat = require('concat-stream');

var Cloudnull = function (options) {
  this.fileDir = options.fileDir || './files';
  this.dbPath = options.dbPath || './db';
  this.ttl = parseInt(options.ttl, 10) || 10000;

  var db = Sublevel(level(this.dbPath, {
    createIfMissing: true,
    valueEncoding: 'json'
  }));

  this.origins = {};

  var self = this;

  var escape = function (filename) {
    return filename.replace(/[^-\w^&'@{}[\],$=!#().%+~ ]/g, '');
  };

  var getOrSetOrigin = function (origin) {
    if (!self.origins[origin]) {
      self.origins[origin] = db.sublevel(origin);
    }

    return self.origins[origin];
  };

  var scheduleDelete = function (systemFilename) {
    setTimeout(function () {
      fs.unlink(self.fileDir + '/' + systemFilename);
      console.log('File deleted: ', systemFilename);
    }, self.ttl);
  };

  var writeFile = function (origin, systemFilename, fileData, filename, next) {
    fs.writeFile(self.fileDir + '/' + systemFilename, fileData, function (err) {
      if (err) {
        next(err);
        return;
      }

      origin.put(systemFilename, {
        filename: filename,
        path: self.dir + '/' + systemFilename,
        created: Date.now()
      }, { ttl: self.ttl }, function (err) {
        if (err) {
          next(err);
          return;
        }

        scheduleDelete(systemFilename);

        next(null, systemFilename);
      });
    });
  };

  this.save = function (group, fileData, filename, next) {
    if (group.length < 1) {
      next(new Error('Invalid group name'));
      return;
    }

    filename = escape(filename.toString().trim());

    if (filename.length < 3) {
      next(new Error('Invalid filename'));
      return;
    }

    var filenameArr = filename.split('.');

    var origin = getOrSetOrigin(group);
    var systemFilename = uuid.v4() + '.' + filenameArr[filenameArr.length - 1];

    writeFile(origin, systemFilename, fileData, filename, next);
  };

  this.getAll = function (group, next) {
    var origin = getOrSetOrigin(group);

    var rs = origin.createReadStream();

    rs.pipe(concat(function (files) {
      next(null, {
        files: files
      });
    }));

    rs.on('error', function (err) {
      next(err);
    });
  };
};

module.exports = Cloudnull;
