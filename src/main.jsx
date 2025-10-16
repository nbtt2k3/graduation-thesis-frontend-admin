import { BrowserRouter } from "react-router-dom";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { Toaster } from "react-hot-toast";
import { AdminTechZoneProvider } from "./context/AdminTechZoneContext";
import { SpeedInsights } from "@vercel/speed-insights/react";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Toaster position="top-center" reverseOrder={false} />
    <AdminTechZoneProvider>
      <App />
      <SpeedInsights />
    </AdminTechZoneProvider>
  </BrowserRouter>
);
