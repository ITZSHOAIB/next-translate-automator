const t = require("@babel/types");
const { createTranslationKey } = require("../translation");
const { isURL } = require("../utils");

const processObjectProperties = (path, config, filePath, updatedTranslations) => {
  const { value } = path.node;
  if (
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

      path.node.value = t.callExpression(t.identifier("t"), [
        t.stringLiteral(key),
        t.objectExpression(args)
      ]);
    } else {
      path.node.value = t.callExpression(t.identifier("t"), [
        t.stringLiteral(key),
      ]);
    }

    console.log(`Updated object property: ${textValue} -> ${key}`);
    return true;
  }
  return false;
};

module.exports = {
  processObjectProperties,
};