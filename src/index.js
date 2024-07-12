const { loadTranslations, saveTranslations } = require("./utils");
const { traverseDirectory } = require("./fileProcessor");
const getConfig = require("./config");

const run = (options) => {
  // Get configuration
  const config = getConfig(options);

  // Load existing translations
  const translations = loadTranslations(config.translationFile, config.componentsDir);

  // Start processing
  traverseDirectory(config.componentsDir, config, translations);

  // Save translations
  saveTranslations(config.translationFile, translations);

  console.log("Translation keys generated and components updated.");
};

module.exports = {
  run,
};