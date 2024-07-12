const fs = require("fs");
const path = require("path");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const generator = require("@babel/generator").default;
const t = require("@babel/types");
const { createTranslationKey, setTranslationKey } = require("../translation");
const { processJSXAttributes, processJSXElements, processJSXText } = require("./jsxHandlers");
const { processVariableDeclarators } = require("./variableHandlers");
const { processObjectProperties } = require("./objectHandlers");

const processFile = (filePath, config, translations) => {
  const content = fs.readFileSync(filePath, "utf8");
  const ast = parser.parse(content, {
    sourceType: "module",
    plugins: ["typescript", "jsx"],
  });

  let addTranslationHook = false;
  let hasUseTranslationImport = false;
  let firstTUsageNode = null;
  let updatedTranslations = {};

  // Traverse the AST
  traverse(ast, {
    ImportDeclaration(path) {
      if (path.node.source.value === "next-translate/useTranslation") {
        hasUseTranslationImport = true;
      }
    },
    JSXAttribute(path) {
      addTranslationHook = processJSXAttributes(path, config, filePath, updatedTranslations) || addTranslationHook;
    },
    JSXElement(path) {
      addTranslationHook = processJSXElements(path, config, filePath, updatedTranslations) || addTranslationHook;
    },
    JSXText(path) {
      addTranslationHook = processJSXText(path, config, filePath, updatedTranslations) || addTranslationHook;
    },
    VariableDeclarator(path) {
      addTranslationHook = processVariableDeclarators(path, config, filePath, updatedTranslations) || addTranslationHook;
    },
    ObjectProperty(path) {
      addTranslationHook = processObjectProperties(path, config, filePath, updatedTranslations) || addTranslationHook;
    },
    CallExpression(path) {
      if (t.isIdentifier(path.node.callee, { name: "t" }) && !firstTUsageNode) {
        firstTUsageNode = path;
      }
    },
  });

  if (addTranslationHook && firstTUsageNode) {
    // Determine where to insert the useTranslation hook
    const insertTranslationHook = (path) => {
      path.insertBefore(
        t.variableDeclaration("const", [
          t.variableDeclarator(
            t.objectPattern([
              t.objectProperty(
                t.identifier("t"),
                t.identifier("t"),
                false,
                true
              ),
            ]),
            t.callExpression(t.identifier("useTranslation"), [
              t.stringLiteral(config.appName),
            ])
          ),
        ])
      );
    };

    const functionParent = firstTUsageNode.getFunctionParent();
    if (functionParent) {
      const blockStatement = functionParent.get("body");
      if (blockStatement.isBlockStatement()) {
        insertTranslationHook(blockStatement.get("body.0"));

        // Add useTranslation import if needed
        if (!hasUseTranslationImport) {
          const importDeclaration = t.importDeclaration(
            [t.importDefaultSpecifier(t.identifier("useTranslation"))],
            t.stringLiteral("next-translate/useTranslation")
          );
          ast.program.body.unshift(importDeclaration);
          console.log(`Added useTranslation import`);
        }

        // Generate code only if we added the translation hook
        const { code } = generator(ast, { retainLines: true });
        fs.writeFileSync(filePath, code, "utf8");

        // Update translations only if the file was modified
        Object.keys(updatedTranslations).forEach((key) => {
          setTranslationKey(translations, key, updatedTranslations[key]);
        });

        console.log(`Updated file`);
      }
    }
  }
};

// Function to traverse directory and process files
const traverseDirectory = (dir, config, translations) => {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      traverseDirectory(fullPath, config, translations);
    } else if (
      fullPath.endsWith(".tsx") &&
      !config.excludePatterns.some((pattern) => fullPath.includes(pattern))
    ) {
      processFile(fullPath, config, translations);
    }
  });
};

module.exports = {
  processFile,
  traverseDirectory,
};