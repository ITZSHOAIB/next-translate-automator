const t = require("@babel/types");
const { createTranslationKey } = require("../translation");

const collectConcatenatedStrings = (node) => {
  const parts = [];
  const traverseNode = (n) => {
    if (t.isStringLiteral(n)) {
      parts.push(n.value);
    } else if (t.isTemplateLiteral(n)) {
      n.quasis.forEach((quasi, index) => {
        parts.push(quasi.value.raw);
        if (n.expressions[index]) {
          parts.push(`\${${n.expressions[index].name}}`);
        }
      });
    } else if (t.isBinaryExpression(n) && n.operator === "+") {
      traverseNode(n.left);
      traverseNode(n.right);
    } else if (t.isIdentifier(n) || t.isMemberExpression(n)) {
      parts.push(`{{${n.name || n.property.name}}}`);
    }
  };
  traverseNode(node);
  return parts;
};

const processLiteralValue = (node, config, filePath, updatedTranslations) => {
  const parts = collectConcatenatedStrings(node);
  const textValue = parts.join("");

  const key = createTranslationKey(config.componentsDir, filePath, textValue);
  updatedTranslations[key] = textValue;

  const args = parts
    .filter((part) => part.startsWith("{{") && part.endsWith("}}"))
    .map((part) => {
      const varName = part.slice(2, -2);
      return t.objectProperty(t.identifier(varName), t.identifier(varName));
    });

  const callArgs =
    args.length > 0
      ? [t.stringLiteral(key), t.objectExpression(args)]
      : [t.stringLiteral(key)];

  console.log(`Updated text: ${textValue} -> ${key}`);
  return t.callExpression(t.identifier("t"), callArgs);
};

module.exports = {
  processLiteralValue,
};
