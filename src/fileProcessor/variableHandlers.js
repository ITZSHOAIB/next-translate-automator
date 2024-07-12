const t = require("@babel/types");
const { createTranslationKey } = require("../translation");
const { isURL } = require("../utils");

const processVariableDeclarators = (path, config, filePath, updatedTranslations) => {
  const { id, init } = path.node;
  if (
    t.isIdentifier(id) &&
    (t.isStringLiteral(init) || t.isTemplateLiteral(init)) &&
    !isURL(init.value)
  ) {
    const textValue = t.isTemplateLiteral(init)
      ? init.quasis.map(quasi => quasi.value.raw).join('${')
      : init.value;
    const key = createTranslationKey(config.componentsDir, filePath, textValue);
    updatedTranslations[key] = textValue.replace(/\$\{([^\}]+)\}/g, '${$1}');

    if (t.isTemplateLiteral(init)) {
      const args = [];
      init.expressions.forEach((expr, index) => {
        const varName = `var${index}`;
        args.push(t.objectProperty(t.identifier(varName), expr));
        init.quasis[index].value.raw = `\${${varName}}`;
      });

      path.node.init = t.callExpression(t.identifier("t"), [
        t.stringLiteral(key),
        t.objectExpression(args)
      ]);
    } else {
      path.node.init = t.callExpression(t.identifier("t"), [
        t.stringLiteral(key),
      ]);
    }

    console.log(`Updated variable: ${textValue} -> ${key}`);
    return true;
  }
  return false;
};

module.exports = {
  processVariableDeclarators,
};