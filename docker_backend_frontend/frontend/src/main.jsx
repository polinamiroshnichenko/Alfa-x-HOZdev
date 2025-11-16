import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./index.css";

import { AuthProvider } from "./components/context/auth-content.jsx";

import { HomePage } from "./components/home-page";
import { LoginPage } from "./components/login-page";
import { RegisterPage } from "./components/register-page";
import { UpdateUserPage } from "./components/update-user-page";
import { PageLayout } from "./components/page-layout";

const basePath = import.meta.env.BASE_URL;

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <PageLayout>
            <AuthProvider>
                <Router>
                    <Routes>
                        <Route path={basePath + "/"} element={<HomePage />} />
                        <Route
                            path={basePath + "/login"}
                            element={<LoginPage />}
                        />
                        <Route
                            path={basePath + "/register"}
                            element={<RegisterPage />}
                        />
                        <Route
                            path={basePath + "/update-user"}
                            element={<UpdateUserPage />}
                        />
                    </Routes>
                </Router>
            </AuthProvider>
        </PageLayout>
    </StrictMode>
);
