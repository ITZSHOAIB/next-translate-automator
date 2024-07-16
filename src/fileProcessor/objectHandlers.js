const t = require("@babel/types");
const { isURL } = require("../utils");
const { processLiteralValue } = require("./templateLiteralHandlers");

const objectPropertyNames = ["description", "message"];

const processObjectProperties = (
  path,
  config,
  filePath,
  updatedTranslations
) => {
  const { key, value } = path.node;
  if (
    !objectPropertyNames.includes(key.name) ||
    (!t.isStringLiteral(value) && !t.isTemplateLiteral(value)) ||
    isURL(value.value)
  ) {
    return false;
  }

  path.node.value = processLiteralValue(
    value,
    config,
    filePath,
    updatedTranslations
  );
  console.log("...Updated variable...");
  return true;
};

module.exports = {
  processObjectProperties,
};
