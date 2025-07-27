import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes";
import "./index.css";

console.log("main.tsx loaded!");

ReactDOM.createRoot(document.getElementById("root")!).render(
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
);
