const path = require("path");
const { convertTextToKey } = require("./utils");

const createTranslationKey = (componentsDir, filePath, text) => {
  const relativePath = path.relative(componentsDir, filePath);
  const pathSegments = relativePath
    .split(path.sep)
    .map((segment) => segment.replace(/\.[^/.]+$/, "")); // Remove file extension
  pathSegments.push(convertTextToKey(text));
  return `${path.basename(componentsDir)}.${pathSegments.join(".")}`;
};

const setTranslationKey = (translations, key, value) => {
  const pathSegments = key.split(".");
  let currentLevel = translations;
  pathSegments.forEach((segment, index) => {
    if (index === pathSegments.length - 1) {
      currentLevel[segment] = value;
    } else {
      if (!currentLevel[segment]) {
        currentLevel[segment] = {};
      }
      currentLevel = currentLevel[segment];
    }
  });
};

module.exports = {
  createTranslationKey,
  setTranslationKey,
};