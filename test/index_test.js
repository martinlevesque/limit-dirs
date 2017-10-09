const expect = require('expect.js');
const fs = require("fs");
const LimitDirs = require("../index");
const proc = require('child_process');

describe('LimitDirs', function() {

  this.timeout(120000);

  describe('with 5 KB limit without auto discover', function() {

    beforeEach(function() {
      try {
        fs.unlinkSync("./repos-test/basic/.test");
      } catch(err) {

      }
    });

    it("should not erase with smaller file", function(done) {

      const dirLimiter = new LimitDirs(
        {
          //"rootDir": "/home/martin/dummy/",
          //"level": 2,
          "forceDirs": [{
            "dir": "./test/repos-test/basic/",
            "limitMB": 5 / 1000
          }],
          "autoDiscoverNewSubDirs": false,
          //"intervalAutoScan": 3,
          "defaultLimitMB": 5 / 1000,
          "verbose": true
        });

      dirLimiter.launch();

      setTimeout(() => {
        const fExists = fs.existsSync("./repos-test/basic/small-file.txt");
        expect(fExists).to.not.equal(true);
        done();
      }, 10000);
    });

    afterEach(function() {
      try {
        fs.unlinkSync("./repos-test/basic.test");
      } catch(err) {

      }
    });
  });





});
