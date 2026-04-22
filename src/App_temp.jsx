import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './Layout';
import Home from './pages/Home';
import Solver from './pages/Solver';
import Quiz from './pages/Quiz';
import Progress from './pages/Progress';
import UserManual from './pages/UserManual';
import FAQ from './pages/FAQ';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import Feedback from './pages/Feedback';
import Community from './pages/Community';
import PostDetails from './components/community/PostDetails';
import { ToastProvider } from './components/ui/toast';
import { ConfirmProvider } from './components/ui/confirm-dialog';
import { DarkModeProvider } from './contexts/DarkModeContext';
import ErrorBoundary from './components/ErrorBoundary';
import FloatingCalcButton from './components/FloatingCalcButton';
import CalculatorPopup from './components/CalculatorPopup';

function App() {
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

  const toggleCalculator = () => {
    setIsCalculatorOpen(!isCalculatorOpen);
  };

  const closeCalculator = () => {
    setIsCalculatorOpen(false);
  };

  return (
    <ErrorBoundary>
      <DarkModeProvider>
        <ToastProvider>
          <ConfirmProvider>
            <Router>
              <Layout>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/solver" element={<Solver />} />
                  <Route path="/quiz" element={<Quiz />} />
                  <Route path="/progress" element={<Progress />} />
                  <Route path="/usermanual" element={<UserManual />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/privacypolicy" element={<PrivacyPolicy />} />
                  <Route path="/termsofservice" element={<TermsOfService />} />
                  <Route path="/feedback" element={<Feedback />} />
                  <Route path="/community" element={<Community />} />
                  <Route path="/community/post/:postId" element={<PostDetails />} />
                </Routes>
              </Layout>
            </Router>
            <FloatingCalcButton onToggle={toggleCalculator} isOpen={isCalculatorOpen} />
            <CalculatorPopup isOpen={isCalculatorOpen} onClose={closeCalculator} />
          </ConfirmProvider>
        </ToastProvider>
      </DarkModeProvider>
    </ErrorBoundary>
  );
}

export default App;
