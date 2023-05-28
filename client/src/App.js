import React from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import MainPage from "./pages/MainPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import { Routes, Route } from "react-router-dom";
import ToolBar from "./component/ToolBar";

const App = () => {
    return (
        <div style={{ maxWidth: 600, margin: "auto" }}>
            <ToastContainer />
            <ToolBar />
            <Routes>
                <Route path="/auth/register" exact element={<RegisterPage />} />
                <Route path="/auth/login" exact element={<LoginPage />} />
                <Route path="/" element={<MainPage />} />
            </Routes>
        </div>
    );
};

export default App;
