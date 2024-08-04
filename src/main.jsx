import React from "react"
import ReactDOM from "react-dom/client"
import App from "./components/App.jsx"
import "./index.css"

import { BibleProvider } from "./components/BibleProvider.jsx"

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BibleProvider>
      <App />
    </BibleProvider>
  </React.StrictMode>
)
