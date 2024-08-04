import React from "react"
import ReactDOM from "react-dom/client"
import App from "./components/App.jsx"
import "./index.css"

import { ScripturesProvider } from "./components/Scripture.tsx"

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ScripturesProvider>
      <App />
    </ScripturesProvider>
  </React.StrictMode>
)
