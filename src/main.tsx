import React from "react";
import ReactDOM from "react-dom/client";
import AppRoutes from "./Routes"; // App ではなく Routes をインポート
import "./index.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { seedSampleArticles } from "./lib/articleDb";

seedSampleArticles();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <AppRoutes />
  </React.StrictMode>
);
