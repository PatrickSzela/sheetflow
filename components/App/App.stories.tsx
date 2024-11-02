import { withFullscreen } from "@/.storybook/decorators/Fullscreen";
import type { Meta, StoryObj } from "@storybook/react";
import { App } from "./App";

const meta = {
  title: "Main",
  component: App,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [withFullscreen()],
} satisfies Meta<{}>;

type Story = StoryObj<typeof meta>;

export const AppStory: Story = {
  name: "App",
};

export default meta;
