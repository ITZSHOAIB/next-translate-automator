#!/usr/bin/env node

const { Command } = require("commander");
const { run } = require("./index");

const program = new Command();

program
  .version("1.0.0")
  .description("A CLI tool to automate the internationalization of React components using Next.js and Babel")
  .option("-c, --components-dir <path>", "Path to the components directory", "src/components")
  .option("-l, --locales-dir <path>", "Path to the locales directory", "locales")
  .option("-a, --app-name <name>", "Application name", "app")
  .option("-e, --exclude-patterns <patterns>", "Comma-separated list of patterns to exclude", ".spec.,.test.")
  .action((options) => {
    const config = {
      componentsDir: options.componentsDir,
      localesDir: options.localesDir,
      appName: options.appName,
      excludePatterns: options.excludePatterns.split(","),
    };

    run(config);
  });

program.parse(process.argv);