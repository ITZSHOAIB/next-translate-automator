const t = require("@babel/types");
const { isURL } = require("../utils");
const { processLiteralValue } = require("./templateLiteralHandlers");

const processJSXAttributes = (path, config, filePath, updatedTranslations) => {
  const { name, value } = path.node;
  if (
    name.name === "aria-label" &&
    (t.isStringLiteral(value) || t.isTemplateLiteral(value)) &&
    !isURL(value.value)
  ) {
    path.node.value = t.jsxExpressionContainer(
      processLiteralValue(value, config, filePath, updatedTranslations)
    );
    console.log("...Updated aria-label...");
    return true;
  }
  return false;
};

const processJSXElements = (path, config, filePath, updatedTranslations) => {
  const openingElement = path.node.openingElement;
  let updated = false;
  openingElement.attributes.forEach((attr) => {
    if (
      t.isJSXAttribute(attr) &&
      attr.name.name === "title" &&
      (t.isStringLiteral(attr.value) || t.isTemplateLiteral(attr.value)) &&
      !isURL(attr.value.value)
    ) {
      attr.value = t.jsxExpressionContainer(
        processLiteralValue(attr.value, config, filePath, updatedTranslations)
      );
      console.log("...Updated title...");
      updated = true;
    }
  });
  return updated;
};

const processJSXText = (path, config, filePath, updatedTranslations) => {
  const value = path.node.value.trim();
  if (value && !isURL(value)) {
    const textNode = t.stringLiteral(value);
    const callExpression = processLiteralValue(
      textNode,
      config,
      filePath,
      updatedTranslations
    );
    path.replaceWith(t.jsxExpressionContainer(callExpression));
    console.log("...Updated innerText...");
    return true;
  }
  return false;
};

module.exports = {
  processJSXAttributes,
  processJSXElements,
  processJSXText,
};
