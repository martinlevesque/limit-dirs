const LimitDirs = require("../index");
const commander = require("commander");

commander
    .version("1.0.0");

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
        "level": opts.level,
        "forceDirs": [],
        "autoDiscoverNewSubDirs": true,
        "intervalAutoScan": opts.intervalAutoScan,
        "defaultLimitMB": opts.defaultLimitMB,
        "verbose": opts.verbose
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
