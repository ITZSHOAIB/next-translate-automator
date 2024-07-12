const t = require("@babel/types");
const { createTranslationKey } = require("../translation");
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
    const parts = [];
    let lastIndex = 0;
    let hasVariables = false;

    const regex = /\{([^\}]+)\}/g;
    let match;
    while ((match = regex.exec(value)) !== null) {
      hasVariables = true;
      const precedingText = value.slice(lastIndex, match.index).trim();
      if (precedingText) {
        parts.push(precedingText);
      }
      parts.push(`\${${match[1].trim()}}`);
      lastIndex = match.index + match[0].length;
    }

    const remainingText = value.slice(lastIndex).trim();
    if (remainingText) {
      parts.push(remainingText);
    }

    if (hasVariables) {
      const key = createTranslationKey(
        config.componentsDir,
        filePath,
        parts.join(" ")
      );
      updatedTranslations[key] = parts
        .join(" ")
        .replace(/\$\{([^\}]+)\}/g, "${$1}");
      const args = parts
        .filter((part) => part.startsWith("${") && part.endsWith("}"))
        .map((part) => {
          const varName = part.slice(2, -1);
          return t.objectProperty(t.identifier(varName), t.identifier(varName));
        });

      path.replaceWith(
        t.jsxExpressionContainer(
          t.callExpression(t.identifier("t"), [
            t.stringLiteral(key),
            t.objectExpression(args),
          ])
        )
      );
      console.log("...Updated innerText...");
      return true;
    } else {
      const key = createTranslationKey(config.componentsDir, filePath, value);
      updatedTranslations[key] = value;
      path.replaceWith(
        t.jsxExpressionContainer(
          t.callExpression(t.identifier("t"), [t.stringLiteral(key)])
        )
      );
      console.log("...Updated innerText...");
      return true;
    }
  }
  return false;
};

module.exports = {
  processJSXAttributes,
  processJSXElements,
  processJSXText,
};
