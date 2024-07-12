const fs = require("fs");
const path = require("path");

const loadTranslations = (translationFile, componentsDir) => {
  const componentsKey = path.basename(componentsDir);
  let translations = { [componentsKey]: {} };
  if (fs.existsSync(translationFile)) {
    const existingTranslations = JSON.parse(
      fs.readFileSync(translationFile, "utf8")
    );
    translations = { ...existingTranslations, [componentsKey]: existingTranslations[componentsKey] || {} };
  }
  return translations;
};

const saveTranslations = (translationFile, newTranslations) => {
  let translations = {};
  if (fs.existsSync(translationFile)) {
    translations = JSON.parse(fs.readFileSync(translationFile, "utf8"));
  }
  // Merge new translations with existing ones
  const mergedTranslations = { ...translations, ...newTranslations };
  fs.writeFileSync(translationFile, JSON.stringify(mergedTranslations, null, 2));
  console.log(`Translations saved to ${translationFile}`);
};

const convertTextToKey = (text) => {
  return text
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^\w_]/g, "");
};

const isURL = (text) => {
  const urlPattern = new RegExp(
    "^(https?:\\/\\/)?" + // protocol
    "((([a-zA-Z0-9$_.+!*'(),;?&=-]|%[0-9a-fA-F]{2})+(:([a-zA-Z0-9$_.+!*'(),;?&=-]|%[0-9a-fA-F]{2})+)?@)?)" + // authentication
    "(([a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]\\.)+[a-zA-Z]{2,6}|((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?))" + // hostname or IP
    "(:[0-9]{1,5})?" + // port
    "(\\/([a-zA-Z0-9$_.+!*'(),;:@&=-]|%[0-9a-fA-F]{2})*)*" + // path
    "(\\?([a-zA-Z0-9$_.+!*'(),;:@&=-]|%[0-9a-fA-F]{2})*)?" + // query string
    "(#([a-zA-Z0-9$_.+!*'(),;@&=-]|%[0-9a-fA-F]{2})*)?$" // fragment
  );
  return urlPattern.test(text);
};

module.exports = {
  loadTranslations,
  saveTranslations,
  convertTextToKey,
  isURL
};