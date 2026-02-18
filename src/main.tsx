import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const legacyHash = window.location.hash;
if (legacyHash.startsWith("#/sign/")) {
  const targetPath = legacyHash.slice(1);
  window.history.replaceState(null, "", targetPath);
}

createRoot(document.getElementById("root")!).render(<App />);
