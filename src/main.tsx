
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { appFullName } from "./lib/appName";

// Brauzer oynasi sarlavhasi tanlangan tilda (til almashsa sahifa qayta yuklanadi)
document.title = appFullName();

createRoot(document.getElementById("root")!).render(<App />);
