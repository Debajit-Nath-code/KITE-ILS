/**
 * Kite ILS - Modern University Digital Library Platform
 * Application Entry & Router Configuration
 */
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { ToastProvider } from './components/ui/Toast';
import { AuthProvider } from './context/AuthContext';

// Pages
import { LandingPage } from './pages/LandingPage';
import { DiscoverPage } from './pages/DiscoverPage';
import { BookDetailsPage } from './pages/BookDetailsPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { StudentDashboardPage } from './pages/StudentDashboardPage';
import { MyLibraryPage } from './pages/MyLibraryPage';
import { ReservationsPage } from './pages/ReservationsPage';
import { ReservationDetailPage } from './pages/ReservationDetailPage';
import { ReserveBookPage } from './pages/ReserveBookPage';
import { WayfindingPage } from './pages/WayfindingPage';
import { RequestsPage } from './pages/RequestsPage';
import { DesignSystemShowcasePage } from './pages/DesignSystemShowcasePage';
import { ReaderPage } from './pages/ReaderPage';

// Admin / Librarian Pages & Layout
import { AdminLayout } from './layouts/AdminLayout';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminBooksPage } from './pages/admin/AdminBooksPage';
import { AdminCopiesPage } from './pages/admin/AdminCopiesPage';
import { AdminReservationsPage } from './pages/admin/AdminReservationsPage';
import { AdminBorrowingPage } from './pages/admin/AdminBorrowingPage';
import { AdminAcquisitionsPage } from './pages/admin/AdminAcquisitionsPage';
import { AdminMapPage } from './pages/admin/AdminMapPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AppLayout />}>
              {/* Public Landing Page */}
              <Route index element={<LandingPage />} />
              
              {/* Authentication Routes */}
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
              <Route path="forgot-password" element={<ForgotPasswordPage />} />

              {/* Patron Dashboard */}
              <Route path="dashboard" element={<StudentDashboardPage />} />

              {/* Librarian / Admin Experience */}
              <Route path="admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboardPage />} />
                <Route path="books" element={<AdminBooksPage />} />
                <Route path="copies" element={<AdminCopiesPage />} />
                <Route path="reservations" element={<AdminReservationsPage />} />
                <Route path="borrowing" element={<AdminBorrowingPage />} />
                <Route path="acquisitions" element={<AdminAcquisitionsPage />} />
                <Route path="map" element={<AdminMapPage />} />
                <Route path="users" element={<AdminUsersPage />} />
              </Route>

              {/* Library Functionality */}
              <Route path="discover" element={<DiscoverPage />} />
              <Route path="book/:bookId" element={<BookDetailsPage />} />
              <Route path="reserve/:bookId" element={<ReserveBookPage />} />
              <Route path="my-library" element={<MyLibraryPage />} />
              <Route path="reservations" element={<ReservationsPage />} />
              <Route path="reservations/:id" element={<ReservationDetailPage />} />
              <Route path="navigate" element={<WayfindingPage />} />
              <Route path="navigate/:shelfId" element={<WayfindingPage />} />
              <Route path="requests" element={<RequestsPage />} />
              <Route path="requests/new" element={<RequestsPage />} />
              <Route path="reader" element={<ReaderPage />} />
              <Route path="reader/:bookId" element={<ReaderPage />} />
              <Route path="design-system" element={<DesignSystemShowcasePage />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
