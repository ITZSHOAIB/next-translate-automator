const t = require("@babel/types");
const { createTranslationKey } = require("../translation");

const processLiteralValue = (value, config, filePath, updatedTranslations) => {
  const textValue = t.isTemplateLiteral(value)
    ? value.quasis
        .map((quasi, index) => {
          const expression = value.expressions[index];
          return quasi.value.raw + (expression ? `\${${expression.name}}` : "");
        })
        .join("")
    : value.value;

  const key = createTranslationKey(config.componentsDir, filePath, textValue);
  updatedTranslations[key] = textValue;

  const callArgs = [t.stringLiteral(key)];

  if (t.isTemplateLiteral(value)) {
    const args = value.expressions
      .filter((expr) => expr.name)
      .map((expr) => t.objectProperty(t.identifier(expr.name), expr));

    if (args.length > 0) {
      callArgs.push(t.objectExpression(args));
    }
  }

  console.log(`Updated: ${key} -> ${value}`);
  return t.callExpression(t.identifier("t"), callArgs);
};

module.exports = {
  processLiteralValue,
};
