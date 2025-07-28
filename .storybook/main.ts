import { type StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-themes",
    "@storybook/addon-docs",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {
      strictMode: true,
    },
  },
  core: {
    disableTelemetry: true,
  },
  docs: {},
  staticDirs: ["../public"],
  typescript: {
    // based on https://storybook.js.org/recipes/@mui/material
    reactDocgen: "react-docgen-typescript",
    reactDocgenTypescriptOptions: {
      EXPERIMENTAL_useWatchProgram: true,
      compilerOptions: {
        allowSyntheticDefaultImports: false,
        esModuleInterop: false,
      },
      shouldExtractLiteralValuesFromEnum: true,
      shouldRemoveUndefinedFromOptional: true,
      propFilter: (prop) => {
        const forbiddenNames = [
          "className",
          "classes",
          "sx",
          "style",
          "component",
          "ref",
        ];
        const forbiddenTypes = ["Ref<", "ElementType<"];

        if (
          forbiddenNames.includes(prop.name) ||
          forbiddenTypes.some((type) => prop.type.name.startsWith(type))
        ) {
          return false;
        }

        // WORKAROUND: official regex doesn't work with pnpm
        // ? !/node_modules\/(?!@mui)/.test(prop.parent.fileName)
        return prop.parent
          ? !/node_modules\/\.pnpm\/(?!@mui)/.test(prop.parent.fileName)
          : true;
      },
    },
  },
};
export default config;
