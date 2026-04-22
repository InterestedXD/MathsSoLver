import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./Layout";
import Home from "./pages/Home";
import UserManual from "./pages/UserManual";
import FAQ from "./pages/FAQ";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Feedback from "./pages/Feedback";
import { ToastProvider } from "./components/ui/toast";
import { ConfirmProvider } from "./components/ui/confirm-dialog";
import { DarkModeProvider } from "./contexts/DarkModeContext";
import ErrorBoundary from "./components/ErrorBoundary";
import { SidebarProvider } from "./components/ui/sidebar";

// Simple test App without Firebase auth
function App() {
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [user, setUser] = useState(null); // Start with no user

  const toggleCalculator = () => setIsCalculatorOpen(!isCalculatorOpen);
  const closeCalculator = () => setIsCalculatorOpen(false);

  return (
    <ErrorBoundary>
      <DarkModeProvider>
        <ToastProvider>
          <ConfirmProvider>
            <Router>
              <Routes>
                <Route path="/login" element={<div className="p-8">Login Page - Coming Soon</div>} />

                <Route
                  path="/"
                  element={
                    <SidebarProvider defaultOpen={true}>
                      <Layout user={user} setUser={setUser} />
                    </SidebarProvider>
                  }
                >
                  <Route index element={<Home user={user} />} />
                  <Route path="usermanual" element={<UserManual />} />
                  <Route path="faq" element={<FAQ />} />
                  <Route path="privacypolicy" element={<PrivacyPolicy />} />
                  <Route path="feedback" element={<Feedback />} />
                </Route>
              </Routes>
            </Router>
          </ConfirmProvider>
        </ToastProvider>
      </DarkModeProvider>
    </ErrorBoundary>
  );
}

export default App;

