import type { Preview } from "@storybook/react-vite";
import { withMuiThemeProvider } from "./decorators";

const preview: Preview = {
  decorators: [withMuiThemeProvider()],
  parameters: {
    controls: {
      disableSaveFromUI: true,
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
