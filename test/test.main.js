'use strict';

process.env.NODE_ENV = 'test';

var should = require('should');
var child = require('child_process');
var fs = require('fs');
var Cloudnull = require('../main');

var c = new Cloudnull({
  fileDir: './test/files',
  dbPath: './test/db',
  ttl: 500
});

describe('cloudnull', function () {
  after(function () {
    child.exec('rm -rf ./test/db/*');
  });

  describe('.save', function () {
    it('should add a new file', function (done) {
      c.save('jen', 'hello cloud', 'hello.txt', function (err, status) {
        should.exist(status);
        done();
      });
    });

    it('should not add a new file because extension is invalid', function (done) {
      c.save('jen', 'hello cloud', 'xt', function (err, status) {
        should.exist(err);
        done();
      });
    });

    it('should not add a new file because group is invalid', function (done) {
      c.save('', 'hello cloud', 'hello.txt', function (err, status) {
        should.exist(err);
        done();
      });
    });

    it('should delete a file after 1 second', function (done) {
      c.save('jen', 'hello cloud2', 'hello2.txt', function (err, filename) {
        setTimeout(function () {
          fs.readFile(c.fileDir + '/' + filename, function (err) {
            should.exist(err);
            done();
          });
        }, 1000);
      });
    });
  });

  describe('.getAll', function () {
    it('should get all files from a group', function (done) {
      c.save('notjen', 'hello cloud', 'hello.txt', function (err, status) {
        c.getAll('notjen', function (err, files) {
          files.files.length.should.equal(1);
          done();
        });
      });
    });
  });
});
