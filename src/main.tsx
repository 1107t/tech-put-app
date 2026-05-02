// src/main.tsx
// アプリケーションのエントリーポイント。ReactアプリをHTMLのroot要素にマウントする。
import React from "react";
import ReactDOM from "react-dom/client";
import AppRoutes from "./Routes"; // App ではなく Routes をインポート
import "./index.css";
import "bootstrap/dist/css/bootstrap.min.css"; // Bootstrapのスタイルを全体に適用

// strictModeでアプリを起動（開発時の潜在的な問題を検出しやすくする）
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <AppRoutes />
  </React.StrictMode>
);
