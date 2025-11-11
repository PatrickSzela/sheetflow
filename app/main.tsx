import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "@/components/App";
import { ThemeProvider } from "@/libs/mui";

import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
);
