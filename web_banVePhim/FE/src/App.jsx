import React from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';

// Đã sửa toàn bộ @/ thành ./
import { Toaster } from './components/ui/sonner';
import ScrollToTop from './components/ScrollToTop.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { BookingProvider } from './context/BookingContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import LoginPage from './pages/LoginPage.jsx';
import HomePage from './pages/HomePage.jsx';
import MovieListPage from './pages/MovieListPage.jsx';
import BookingPage from './pages/BookingPage.jsx';
import TicketConfirmationPage from './pages/TicketConfirmationPage.jsx';
import TicketHistoryPage from './pages/TicketHistoryPage.jsx';
import WalletHistoryPage from './pages/WalletHistoryPage.jsx';

function App() {
  return (
    <AuthProvider>
      <BookingProvider>
        <Router>
          <ScrollToTop />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<HomePage />} />
            <Route path="/movies" element={<MovieListPage />} />
            
            {/* Protected Routes */}
            <Route
              path="/booking/:movieId"
              element={
                <ProtectedRoute>
                  <BookingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/confirmation"
              element={
                <ProtectedRoute>
                  <TicketConfirmationPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <TicketHistoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/wallet"
              element={
                <ProtectedRoute>
                  <WalletHistoryPage />
                </ProtectedRoute>
              }
            />
          </Routes>
          <Toaster />
        </Router>
      </BookingProvider>
    </AuthProvider>
  );
}

export default App;