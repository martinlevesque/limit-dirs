const expect = require('expect.js');
const fs = require("fs");
const LimitDirs = require("../index");
const proc = require('child_process');

function genAndWriteFile(bytes, pathTo) {
  let s = "";

  for (let i = 0; i < bytes; ++i) {
    s += "a";
  }

  try {
    fs.writeFileSync(pathTo, s, 'utf8');
  } catch(err) {
    console.log(err);
  }
}

function clearTest() {
  const folders2Check = [
    "./test/repos-test/basic/",
    "./test/repos-test/basic-limited/",
    "./test/repos-test/big-file-added-after-init/",
    "./test/repos-test/small-file-added-after-init/",
  ]

  for (let folder of folders2Check) {
    try {
      fs.unlinkSync(folder + "test.txt");
    } catch(err) {

    }
  }
}

describe('LimitDirs', function() {

  this.timeout(120000);

  describe('with 5 KB limit without auto discover', function() {

    beforeEach(function() {
      clearTest();
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
        const fExists = fs.existsSync("./test/repos-test/basic/small-file.txt");
        expect(fExists).to.equal(true);
        dirLimiter.stop();
        done();
      }, 2000);
    });

    it("should erase on start with bigger file", function(done) {

      const dirLimiter = new LimitDirs(
        {
          //"rootDir": "/home/martin/dummy/",
          //"level": 2,
          "forceDirs": [{
            "dir": "./test/repos-test/basic-limited/",
            "limitMB": 5 / 1000
          }],
          "autoDiscoverNewSubDirs": false,
          //"intervalAutoScan": 3,
          "defaultLimitMB": 1,
          "verbose": true
        });

      genAndWriteFile(10000, "./test/repos-test/basic-limited/test.txt");

      dirLimiter.launch();

      setTimeout(() => {
        const fExists = fs.existsSync("./test/repos-test/basic-limited/test.txt");
        expect(fExists).to.equal(false);
        dirLimiter.stop();
        done();
      }, 2000);
    });

    it("should not erase with small file added", function(done) {

      const dirLimiter = new LimitDirs(
        {
          //"rootDir": "/home/martin/dummy/",
          //"level": 2,
          "forceDirs": [{
            "dir": "./test/repos-test/small-file-added-after-init/",
            "limitMB": 5 / 1000
          }],
          "autoDiscoverNewSubDirs": false,
          //"intervalAutoScan": 3,
          "defaultLimitMB": 1,
          "verbose": true
        });

      setTimeout(() => {
        genAndWriteFile(10, "./test/repos-test/small-file-added-after-init/test.txt");
      }, 3000);

      dirLimiter.launch();

      setTimeout(() => {
        const fExists = fs.existsSync("./test/repos-test/small-file-added-after-init/test.txt");
        expect(fExists).to.equal(true);
        dirLimiter.stop();
        done();
      }, 10000);
    });

    it("should erase with big file added", function(done) {

      const dirLimiter = new LimitDirs(
        {
          //"rootDir": "/home/martin/dummy/",
          //"level": 2,
          "forceDirs": [{
            "dir": "./test/repos-test/big-file-added-after-init/",
            "limitMB": 5 / 1000
          }],
          "autoDiscoverNewSubDirs": false,
          //"intervalAutoScan": 3,
          "defaultLimitMB": 1,
          "verbose": true
        });

      setTimeout(() => {
        genAndWriteFile(10000, "./test/repos-test/big-file-added-after-init/test.txt");
      }, 3000);

      dirLimiter.launch();

      setTimeout(() => {
        const fExists = fs.existsSync("./test/repos-test/big-file-added-after-init/test.txt");
        expect(fExists).to.equal(false);
        dirLimiter.stop();
        done();
      }, 10000);
    });

    afterEach(function() {
      clearTest();
    });
  });





});
