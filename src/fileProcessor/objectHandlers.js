const t = require("@babel/types");
const { createTranslationKey } = require("../translation");
const { isURL } = require("../utils");
const { processLiteralValue } = require("./templateLiteralHandlers");

const processObjectProperties = (
  path,
  config,
  filePath,
  updatedTranslations
) => {
  const { value } = path.node;
  if (
    (t.isStringLiteral(value) || t.isTemplateLiteral(value)) &&
    !isURL(value.value)
  ) {
    path.node.value = processLiteralValue(
      value,
      config,
      filePath,
      updatedTranslations
    );
    console.log("...Updated variable...");
    return true;
  }
  return false;
};

module.exports = {
  processObjectProperties,
};
