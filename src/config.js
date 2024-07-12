const path = require("path");

const getConfig = (options) => {
  const componentsDir = path.resolve(options.componentsDir);
  const localesDir = path.resolve(options.localesDir);
  const appName = options.appName || "defaultApp";

  return {
    componentsDir,
    localesDir,
    appName,
    translationFile: path.join(localesDir, `${appName}.json`),
    excludePatterns: options.excludePatterns || [".spec.", ".test."],
  };
};

module.exports = getConfig;