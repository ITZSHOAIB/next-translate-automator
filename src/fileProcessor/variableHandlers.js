const t = require("@babel/types");
const { isURL } = require("../utils");
const { processLiteralValue } = require("./templateLiteralHandlers");

const processVariableDeclarators = (
  path,
  config,
  filePath,
  updatedTranslations
) => {
  const { id, init } = path.node;
  if (
    t.isIdentifier(id) &&
    (t.isStringLiteral(init) || t.isTemplateLiteral(init)) &&
    !isURL(init.value)
  ) {
    path.node.init = processLiteralValue(
      init,
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
  processVariableDeclarators,
};
