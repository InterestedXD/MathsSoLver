import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./Layout";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Quiz from "./pages/Quiz";
import ResultPage from "./pages/Result";
import Solver from "./pages/Solver";
import QuizPage from "./pages/Quiz";
import Arcade from "./pages/Arcade";

import Flashcards from "./pages/Flashcards";
import Progress from "./pages/Progress";
import UserManual from "./pages/UserManual";
import FAQ from "./pages/FAQ";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Feedback from "./pages/Feedback";
import CommunityPage from "./pages/Community";
import PostDetails from "./components/community/PostDetails";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/ProtectedRoute";

import { ToastProvider } from "./components/ui/toast";
import { ConfirmProvider } from "./components/ui/confirm-dialog";
import { DarkModeProvider } from "./contexts/DarkModeContext";
import ErrorBoundary from "./components/ErrorBoundary";
import FloatingCalcButton from "./components/FloatingCalcButton";
import CalculatorPopup from "./components/CalculatorPopup";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

// ✅ Import SidebarProvider
import { SidebarProvider } from "./components/ui/sidebar";

function App() {
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [user, setUser] = useState(null);

  const toggleCalculator = () => setIsCalculatorOpen(!isCalculatorOpen);
  const closeCalculator = () => setIsCalculatorOpen(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          const userData = {
            displayName: firebaseUser.displayName,
            email: firebaseUser.email,
            photoURL: firebaseUser.photoURL,
          };
          localStorage.setItem("user", JSON.stringify(userData));
          setUser(userData);
        }
      } else {
        localStorage.removeItem("user");
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <ErrorBoundary>
      <DarkModeProvider>
        <ToastProvider>
          <ConfirmProvider>
            <Router>
              <Routes>
                <Route path="/login" element={<Login setUser={setUser} />} />

                {/* ✅ Wrap Layout inside SidebarProvider */}
                <Route
                  path="/"
                  element={
                    <SidebarProvider defaultOpen={true}>
                      <Layout user={user} setUser={setUser} />
                    </SidebarProvider>
                  }
                >
<Route index element={<Dashboard />} />

                {/* Public route - Arcade accessible without login */}
                  <Route
                    path="arcade"
                    element={<Arcade />}
                  />
                  


                {/* Public route - Flashcards accessible without login */}
                  <Route
                    path="flashcards"
                    element={<Flashcards />}
                  />

                {/* Protected routes */}
                  <Route
                    path="solver"
                    element={
                      <ProtectedRoute user={user}>
                        <Solver />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="quiz" element={<QuizPage />} />
                  <Route path="result" element={<ResultPage />} />
                  <Route
                    path="progress"
                    element={
                      <ProtectedRoute user={user}>
                        <Progress />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="profile"
                    element={
                      <ProtectedRoute user={user}>
                        <Profile user={user} />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="community"
                    element={
                      <ProtectedRoute user={user}>
                        <CommunityPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Public routes */}
                  <Route path="usermanual" element={<UserManual />} />
                  <Route path="faq" element={<FAQ />} />
                  <Route path="privacypolicy" element={<PrivacyPolicy />} />
                  <Route path="feedback" element={<Feedback />} />
                  <Route path="community/post/:id" element={<PostDetails />} />
                </Route>
              </Routes>
            </Router>

            {/* Floating calculator button */}
            {user && (
              <>
                <FloatingCalcButton
                  onToggle={toggleCalculator}
                  isOpen={isCalculatorOpen}
                />
                <CalculatorPopup
                  isOpen={isCalculatorOpen}
                  onClose={closeCalculator}
                />
              </>
            )}
          </ConfirmProvider>
        </ToastProvider>
      </DarkModeProvider>
    </ErrorBoundary>
  );
}

export default App;
