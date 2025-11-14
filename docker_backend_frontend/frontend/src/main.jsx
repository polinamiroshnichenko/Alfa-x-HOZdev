import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { Home } from "./components/home";
import { Login } from "./components/login";
import { Register } from "./components/register";
import { AuthProvider } from "./components/context/auth-content.jsx";

const basePath = import.meta.env.BASE_URL;

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path={basePath + "/"} element={<Home />} />
                    <Route path={basePath + "/login"} element={<Login />} />
                    <Route
                        path={basePath + "/register"}
                        element={<Register />}
                    />
                </Routes>
            </Router>
        </AuthProvider>
    </StrictMode>
);
