import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import storybook from "eslint-plugin-storybook";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  // Vite
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommendedTypeChecked,
      tseslint.configs.stylisticTypeChecked,
      reactHooks.configs.flat["recommended-latest"],
      reactRefresh.configs.vite,
      {
        languageOptions: {
          parserOptions: {
            projectService: true,
            tsconfigRootDir: import.meta.dirname,
          },
        },
      },
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/consistent-type-definitions": "off",
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "@typescript-eslint/no-empty-object-type": [
        "error",
        { allowInterfaces: "always" },
      ],
      "no-restricted-imports": [
        "error",
        {
          // https://mui.com/material-ui/guides/minimizing-bundle-size/#enforce-best-practices-with-eslint
          patterns: [{ regex: "^@mui/[^/]+$" }],
        },
      ],
    },
  },

  // Storybook
  ...storybook.configs["flat/recommended"],
  {
    ignores: ["!**/.storybook", "**/storybook-static"],
  },
]);
