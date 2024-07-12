const t = require("@babel/types");
const { createTranslationKey } = require("../translation");
const { isURL } = require("../utils");

const processJSXAttributes = (path, config, filePath, updatedTranslations) => {
  const { name, value } = path.node;
  if (
    name.name === "aria-label" &&
    (t.isStringLiteral(value) || t.isTemplateLiteral(value)) &&
    !isURL(value.value)
  ) {
    const textValue = t.isTemplateLiteral(value)
      ? value.quasis.map(quasi => quasi.value.raw).join('${')
      : value.value;
    const key = createTranslationKey(config.componentsDir, filePath, textValue);
    updatedTranslations[key] = textValue.replace(/\$\{([^\}]+)\}/g, '${$1}');

    if (t.isTemplateLiteral(value)) {
      const args = [];
      value.expressions.forEach((expr, index) => {
        const varName = `var${index}`;
        args.push(t.objectProperty(t.identifier(varName), expr));
        value.quasis[index].value.raw = `\${${varName}}`;
      });

      path.node.value = t.jsxExpressionContainer(
        t.callExpression(t.identifier("t"), [
          t.stringLiteral(key),
          t.objectExpression(args)
        ])
      );
    } else {
      path.node.value = t.jsxExpressionContainer(
        t.callExpression(t.identifier("t"), [t.stringLiteral(key)])
      );
    }

    console.log(`Updated aria-label: ${textValue} -> ${key}`);
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
      const textValue = t.isTemplateLiteral(attr.value)
        ? attr.value.quasis.map(quasi => quasi.value.raw).join('${')
        : attr.value.value;
      const key = createTranslationKey(config.componentsDir, filePath, textValue);
      updatedTranslations[key] = textValue.replace(/\$\{([^\}]+)\}/g, '${$1}');

      if (t.isTemplateLiteral(attr.value)) {
        const args = [];
        attr.value.expressions.forEach((expr, index) => {
          const varName = `var${index}`;
          args.push(t.objectProperty(t.identifier(varName), expr));
          attr.value.quasis[index].value.raw = `\${${varName}}`;
        });

        attr.value = t.jsxExpressionContainer(
          t.callExpression(t.identifier("t"), [
            t.stringLiteral(key),
            t.objectExpression(args)
          ])
        );
      } else {
        attr.value = t.jsxExpressionContainer(
          t.callExpression(t.identifier("t"), [t.stringLiteral(key)])
        );
      }

      console.log(`Updated title: ${textValue} -> ${key}`);
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
      const key = createTranslationKey(config.componentsDir, filePath, parts.join(" "));
      updatedTranslations[key] = parts.join(" ").replace(/\$\{([^\}]+)\}/g, '${$1}');
      const args = [];
      parts.forEach((part, index) => {
        if (part.startsWith("${") && part.endsWith("}")) {
          const varName = part.slice(2, -1);
          args.push(t.objectProperty(t.identifier(varName), t.identifier(varName)));
        }
      });

      path.replaceWith(
        t.jsxExpressionContainer(
          t.callExpression(t.identifier("t"), [
            t.stringLiteral(key),
            t.objectExpression(args)
          ])
        )
      );
      console.log(`Updated text: ${value} -> ${key}`);
      return true;
    } else {
      const key = createTranslationKey(config.componentsDir, filePath, value);
      updatedTranslations[key] = value;
      path.replaceWith(
        t.jsxExpressionContainer(
          t.callExpression(t.identifier("t"), [t.stringLiteral(key)])
        )
      );
      console.log(`Updated text: ${value} -> ${key}`);
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