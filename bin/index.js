#!/usr/bin/env node

'use strict';

const LimitDirs = require("../index");
const commander = require("commander");

commander
    .version("1.0.3");

commander
  .command('launch')
  .option("--rootDir <rootDir>", "Root dir")
  .option("--level <level>", "Directory tree level folders to be watched")
  .option("--intervalAutoScan <intervalAutoScan>", "Interval in seconds to scan")
  .option("--defaultLimitMB <defaultLimitMB>", "Limit in MB")
  .option("--verbose <verbose>", "Mode verbose")
  .description('Deploy your website on opeNode')
  .action(async function(opts) {
    const dirLimiter = new LimitDirs(
      {
        "rootDir": opts.rootDir,
        "level": parseInt(opts.level),
        "forceDirs": [],
        "autoDiscoverNewSubDirs": true,
        "intervalAutoScan": parseFloat(opts.intervalAutoScan),
        "defaultLimitMB": parseFloat(opts.defaultLimitMB),
        "verbose": opts.verbose == "true"
      });

    dirLimiter.launch();
  });

commander
  .command('*')
  .description('')
  .action(async function() {
    log.err("Invalid command")
    commander.help();
  });

commander.parse(process.argv);

if ( ! commander.args.length)
  commander.help();
