import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles/global.css";
import "./styles/components.css";

const el = document.getElementById("root");
createRoot(el).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
