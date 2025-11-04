import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import RoutingPage from "./RoutingPage.tsx"
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
      <RoutingPage />
  </StrictMode>
);
