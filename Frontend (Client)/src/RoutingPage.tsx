import LoginPage from "./pages/LoginPage.js";
import App from "./App.tsx";

import { BrowserRouter, Routes, Route } from "react-router-dom";

const RoutingPage = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />}></Route>
        <Route path="/map/:shipName" element={<App />}></Route>
      </Routes>
    </BrowserRouter>
  );
};

export default RoutingPage;
