import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Desktop (Electron) build gets the Hydra-style theme override on top of the neon base.
if (import.meta.env.VITE_TARGET === "electron") {
  import("./index-desktop.css");
}

createRoot(document.getElementById("root")!).render(<App />);
