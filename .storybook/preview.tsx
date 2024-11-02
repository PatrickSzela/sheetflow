import type { Preview } from "@storybook/react";
import { withMuiThemeProvider } from "./decorators/MuiThemeProvider";

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
