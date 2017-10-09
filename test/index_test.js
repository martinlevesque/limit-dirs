const expect = require('expect.js');
const fs = require("fs");
const LimitDirs = require("../index");
const proc = require('child_process');
const path = require('path');
const rmDir = require("rimraf");

function genAndWriteFile(bytes, pathTo) {
  let s = "";

  for (let i = 0; i < bytes; ++i) {
    s += "a";
  }

  try {
    fs.writeFileSync(pathTo, s, 'utf8');
  } catch(err) {
    console.log("err writing " + pathTo);
    console.log(err);
  }
}

function genDirFor(pathTo) {
  try {
    let dir = path.dirname(pathTo) + "/";
    fs.mkdirSync(dir);
  } catch(err) {
  }
}

function removeFolder(folder) {
  return new Promise((resolve, reject) => {
    try {
      //fs.unlinkSync(folder + "test.txt");
      rmDir(folder, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    } catch(err) {
      reject(err);
    }
  });
}

async function clearTest() {
  const folders2Check = [
    "./test/repos-test/basic-limited/",
    "./test/repos-test/big-file-added-after-init/",
    "./test/repos-test/small-file-added-after-init/",
    "./test/repos-test/websites/"
  ];

  for (let folder of folders2Check) {
    try {
      await removeFolder(folder);
    } catch(err) {

    }
  }
}

describe('LimitDirs', function() {

  this.timeout(120000);

  beforeEach(function(done) {
    clearTest().then(() => {
      done();
    });
  });

  describe('with 5 KB limit with auto discover', function() {

    it("should not erase with smaller file - auto", function(done) {

      genDirFor("./test/repos-test/websites/test.txt");
      genDirFor("./test/repos-test/websites/user1/test.txt");
      genDirFor("./test/repos-test/websites/user2/test.txt");
      genDirFor("./test/repos-test/websites/user1/website1/test.txt");
      genDirFor("./test/repos-test/websites/user2/website2/test.txt");

      const dirLimiter = new LimitDirs(
        {
          "rootDir": "./test/repos-test/websites/",
          "level": 2,
          "forceDirs": [],
          "autoDiscoverNewSubDirs": true,
          "intervalAutoScan": 3,
          "defaultLimitMB": 5 / 1000,
          "verbose": true
        });

      dirLimiter.launch();

      setTimeout(() => {
        genAndWriteFile(10, "./test/repos-test/websites/user1/website1/test.txt");
        genAndWriteFile(10, "./test/repos-test/websites/user2/website2/test.txt");
      }, 3000);

      setTimeout(() => {
        let fExists = fs.existsSync("./test/repos-test/websites/user1/website1/test.txt");
        expect(fExists).to.equal(true);
        fExists = fs.existsSync("./test/repos-test/websites/user2/website2/test.txt");
        expect(fExists).to.equal(true);
        dirLimiter.stop();
        setTimeout(() => done(), 1000);
      }, 10000);
    });

    it("should erase only 1 big file - auto", function(done) {
      genDirFor("./test/repos-test/websites/test.txt");
      genDirFor("./test/repos-test/websites/user1/test.txt");
      genDirFor("./test/repos-test/websites/user2/test.txt");
      genDirFor("./test/repos-test/websites/user1/website1/test.txt");
      genDirFor("./test/repos-test/websites/user2/website2/test.txt");

      const dirLimiter = new LimitDirs(
        {
          "rootDir": "./test/repos-test/websites/",
          "level": 2,
          "forceDirs": [],
          "autoDiscoverNewSubDirs": true,
          "intervalAutoScan": 3,
          "defaultLimitMB": 5 / 1000,
          "verbose": true
        });

      dirLimiter.launch();

      setTimeout(() => {
        genAndWriteFile(10, "./test/repos-test/websites/user1/website1/test.txt");
        genAndWriteFile(10000, "./test/repos-test/websites/user2/website2/test.txt");
      }, 3000);

      setTimeout(() => {
        let fExists = fs.existsSync("./test/repos-test/websites/user1/website1/test.txt");
        expect(fExists).to.equal(true);
        fExists = fs.existsSync("./test/repos-test/websites/user2/website2/test.txt");
        expect(fExists).to.equal(false);
        dirLimiter.stop();
        setTimeout(() => done(), 1000);
      }, 10000);
    });
  });

  describe('with 5 KB limit without auto discover', function() {

    it("should not erase with smaller file", function(done) {

      genDirFor("./test/repos-test/basic/small-file.txt");

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
          "verbose": false
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

      genDirFor("./test/repos-test/basic-limited/test.txt");

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
          "verbose": false
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

      genDirFor("./test/repos-test/small-file-added-after-init/test.txt");

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
          "verbose": false
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

      genDirFor("./test/repos-test/big-file-added-after-init/test.txt");

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
          "verbose": false
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

  });

  afterEach(function(done) {
    clearTest().then(() => {
      done();
    });
  });

});
