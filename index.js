const watch = require("watch");
const fs = require("fs");
const path = require("path");

class LimirDirs {
  constructor(rootDir, subDirs = [], options = {}) {
    this.rootDir = rootDir;
    this.subDirs = subDirs;
    this.autoDiscoverNewSubDirs = options.autoDiscoverNewSubDirs;
    this.activatedWatches = {};
    this.defaultLimitMB = options.defaultLimitMB;

    for (let d of subDirs) {
      this.activateWatch(d.subdir, d.limitMB);
    }

    if (this.autoDiscoverNewSubDirs) {
      setInterval(() => {
        this.scanRoot();
      }, 3000);
    }

  }

  scanRoot() {
    fs.readdir(this.rootDir, (err, dirs) => {
      if ( ! err) {
        for (let dir of dirs) {
          this.activateWatch(dir, this.defaultLimitMB);
        }
      }
    });;
  }

  pretty() {
    console.log("root dir ");
    console.log(this.rootDir);
    console.log("active watches ");
    console.log(this.activatedWatches);
  }

  _initWatch(dir) {
    watch.watchTree(dir, function (f, curr, prev) {
        if (typeof f == "object" && prev === null && curr === null) {
          // Finished walking the tree
          console.log("done walking the tree...");
        } else if (prev === null) {
          // f is a new file
          console.log("new f");
        } else if (curr.nlink === 0) {
          // f was removed
          console.log("removed ..");
        } else {
          // f was changed
          console.log("changed ..");
          console.log("cur = ");
          console.log(curr);
          console.log("prev = ");
          console.log(prev);
        }
      })
  }

  activateWatch(dir, limitMB) {
    const normDir = path.resolve(dir);

    fs.lstat(normDir, (err, stat) => {
      if ( ! err) {
        if (stat.isDirectory()) {
          if ( ! this.activatedWatches[normDir]) {
            this._initWatch(normDir);
            this.activatedWatches[normDir] = {
              "status": "active",
              limitMB
            };
          }
        }
      }
    });
  }
}

let d = new LimirDirs("./", [/* {"subdir": '...', limitMB: 1000} */],
  { "autoDiscoverNewSubDirs": true, "defaultLimitMB": 1000 });

d.pretty();
