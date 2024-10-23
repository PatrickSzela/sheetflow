import type { Meta, StoryObj } from "@storybook/react";
import { App } from "./App";

const meta = {
  title: "Formula",
  component: App,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div style={{ height: "100vh", width: "100%" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<{}>;

type Story = StoryObj<typeof meta>;

export const AppStory: Story = {
  name: "Main App",
};

export default meta;
