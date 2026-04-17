import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { ReduxProvider } from "./redux/store/ReduxProvider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ReduxProvider>
      <App />
    </ReduxProvider>
  </StrictMode>,
);
