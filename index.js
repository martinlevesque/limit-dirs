const watch = require("watch");
const fs = require("fs");
const path = require("path");

/*
watch.createMonitor('./testing/', function (monitor) {
    //monitor.files['/home/mikeal/.zshrc'] // Stat object for my zshrc.
    monitor.on("created", function (f, stat) {
      // Handle new files
      console.log("created");
    })
    monitor.on("changed", function (f, curr, prev) {
      // Handle file changes
      console.log("changed");
    })
    monitor.on("removed", function (f, stat) {
      // Handle removed files
      console.log("removed");
    })
    monitor.stop(); // Stop watching
  });
  */

setTimeout(() => {

}, 100000);

class LimirDirs {
  constructor(rootDir, subDirs = [], options = {}) {
    this.rootDir = rootDir;
    this.subDirs = subDirs;
    this.autoDiscoverNewSubDirs = options.autoDiscoverNewSubDirs;
    this.activatedWatches = {};

    for (let d of subDirs) {
      this.activateWatch(d);
    }

    if (this.autoDiscoverNewSubDirs) {
      setInterval(() => {
        this.scanRoot();
      }, 3000);
    }

  }

  scanRoot() {
    const dirs = fs.readdirSync(this.rootDir);

    for (let dir of dirs) {
      this.activateWatch(dir);
    }
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

  activateWatch(dir) {
    const normDir = path.resolve(dir);
    
    if ( ! fs.lstatSync(normDir).isDirectory()) {
      return;
    }
    console.log("checking for " + normDir);

    if ( ! this.activatedWatches[normDir]) {
      this._initWatch(normDir);
      this.activatedWatches[normDir] = {
        "status": "active"
      };

    }
  }
}

let d = new LimirDirs("./", [], { "autoDiscoverNewSubDirs": true });

d.pretty();
