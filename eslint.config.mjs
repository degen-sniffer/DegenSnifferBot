import globals from "globals";
import eslint from "@eslint/js";

/** @type {import('eslint').Linter.Config[]} */
export default [
  { languageOptions: { globals: globals.node } },
  {
    files: ["**/*.js"],
    rules: {
      ...eslint.configs.recommended.rules,
    },
  },
];
