const watch = require("watch");
const fs = require("fs");
const path = require("path");
const getFSize = require("get-folder-size");
const rmDir = require("rimraf");
const dirTree = require("directory-tree");

class LimitDirs {
  constructor(options = {}) {
    this.rootDir = options.rootDir || "./";
    this.subDirs = options.subDirs || [];
    this.level = options.level || 1;
    this.autoDiscoverNewSubDirs = options.autoDiscoverNewSubDirs || false;
    this.defaultLimitMB = options.defaultLimitMB || 1000000;
    this.activatedWatches = {};
    this.verbose = options.verbose || false;

    for (let d of this.subDirs) {
      this.activateWatch(d.subdir, d.limitMB);
    }

    if (this.autoDiscoverNewSubDirs) {
      setInterval(() => {
        this.scanRoot();
      }, 3000);
    }

  }

  _log(msg) {
    if (this.verbose) {
      console.log((new Date()) + ": " + msg);
    }
  }

  _getFoldersWithLevel(dirs, level, curLevel, result = []) {
    for (let f of dirs) {
      if (f.type == "directory") {
        if (level == curLevel) {
          result.push(f);
        }
        else if (curLevel < level) {
          result = this._getFoldersWithLevel(f.children, level, curLevel + 1, [...result]);
        }
      }
    }

    return result;
  }

  scanRoot() {
    let dirsWithLevel =
      this._getFoldersWithLevel(dirTree(this.rootDir).children, this.level, 1, []);

    for (let dir of dirsWithLevel) {
      this.activateWatch(dir.path, this.defaultLimitMB);
    }
  }

  _deleteFile(f) {
    setTimeout(() => {
      fs.unlink(f, (err) => {
        if ( ! err) {
          this._log("deleted " + f);
        }
      });
    }, 3000);
  }

  _isSameAction(previousActionInfo, curAction, f) {
    return previousActionInfo.action == curAction &&
      previousActionInfo.f == f && (new Date() - previousActionInfo.ts) <= 2000;
  }

  _updPreviousAction(previousAction, action, file) {
    previousAction.action = action;
    previousAction.f = file
    previousAction.ts = new Date();
  }

  _sizeFileOrFolder(f, stat) {
    return new Promise((resolve, reject) => {
      if (stat.isDirectory()) {
        getFSize(f, (err, size) => {
          if ( ! err) {
            resolve({
              "size": size,
              "type": "folder"
            });
          } else {
            reject(err);
          }
        });
      } else {
        resolve({
          "size": stat.size,
          "type": "file"
        });
      }
    });
  }

  _initWatch(dir, currentMB, limitMB) {
    this._log("starting watch of " + dir + " starting size " + currentMB + " MB of " + limitMB);

    const previousAction = {
      "action": "",
      "f": "",
      "ts": new Date()
    };

    let timeoutCheckSize = null;

    watch.watchTree(dir, (f, curr, prev) => {
        this._log("watch treee of ");
        this._log(f);
        if (typeof f == "object" && prev === null && curr === null) {
          // Finished walking the tree

        } else if (prev === null && ! this._isSameAction(previousAction, "C", f)) { // CREATED
          // f is a new file

          this._sizeFileOrFolder(f, curr).then((sizeInfo) => {
            currentMB += sizeInfo.size / 1000 / 1000;
            this._log("[CREATED] " + f + " new size of " + dir + " = " + currentMB + " MB");

            if (currentMB > limitMB) {
              rmDir(f, (err) => {
                this._log(err);
              });
            }

          }).catch((err) => {
            console.log("errr sizeee");
            this._log(err);
          });

          this._updPreviousAction(previousAction, "C", f);
        } else if (curr.nlink === 0 && ! this._isSameAction(previousAction, "R", f)) { // REMOVED
          if (prev && prev.size) {
            currentMB -= prev.size / 1000 / 1000;
            this._log("[REMOVED] " + f + " new size of " + dir + " = " + currentMB + " MB");
          }

          this._updPreviousAction(previousAction, "R", f);
        } else if (curr && prev && ! this._isSameAction(previousAction, "M", f)) { // CHANGED
          let changedBy = curr.size - prev.size;

          currentMB += changedBy / 1000 / 1000;
          this._log("[CHANGED] " + f + " new size of " + dir + " = " + currentMB + " MB");

          if (currentMB > limitMB) {
              rmDir(f, (err) => {
                this._log(err);
              });
          }

          this._updPreviousAction(previousAction, "M", f);
        }

        if ( ! timeoutCheckSize) {
          timeoutCheckSize = setTimeout(() => {
            getFSize(dir, (err, size) => {
              if ( ! err) {
                currentMB = size / 1000 / 1000;
                this._log("Refreshed new size of " + dir + " = " + currentMB + " MB");
              }

              timeoutCheckSize = null;
            });
          }, 3000);
        }

      })
  }

  activateWatch(dir, limitMB) {
    const normDir = path.resolve(dir);

    fs.lstat(normDir, (err, stat) => {
      if ( ! err) {
        if (stat.isDirectory()) {

          getFSize(dir, (err, size) => {
            if ( ! err) {
              let sizeMB = size / 1000 / 1000;

              if ( ! this.activatedWatches[normDir]) {
                this._initWatch(normDir, sizeMB, limitMB);
                this.activatedWatches[normDir] = {
                  "status": "active",
                  limitMB
                };
              }
            } else {
              this._log("issue " + err);
            }
          });
        }
      } else {
        this._log("issue " + err);
      }
    });
  }
}

new LimitDirs(
  {
    "rootDir": "/home/martin/dummy/",
    "level": 2,
    "subDirs": [],
    "autoDiscoverNewSubDirs": true,
    "defaultLimitMB": 5,
    "verbose": true
  });
