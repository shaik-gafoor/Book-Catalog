import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard/Dashboard";
import UserLayout from "./pages/UserLayout/UserLayout";
import BookPage from "./pages/Book/BookPage";
import AddBookPage from "./pages/Book/AddBookPage.jsx";
import MyLoans from "./pages/MyLoans/MyLoans";
import MyReservations from "./pages/MyReservations/Myreservations.jsx";
import AuthPage from "./pages/Auth/AuthPage.jsx";
import RequireAuth from "./pages/Auth/RequireAuth.jsx";
import MyFines from "./pages/MyFines/MyFines.jsx";
import SubscriptionPage from "./pages/Subscription/SubscriptionPage.jsx";
import WishlistPage from "./pages/Wishlist/WishlistPage.jsx";
import ProfilePage from "./pages/Profile/ProfilePage.jsx";
import SettingsPage from "./pages/Settings/SettingsPage.jsx";
import AdminPage from "./pages/Admin/AdminPage.jsx";

function App() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route element={<RequireAuth />}>
        <Route element={<UserLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/books" element={<BookPage />} />
          <Route path="/add-book" element={<AddBookPage />} />
          <Route path="/my-loans" element={<MyLoans />} />
          <Route path="/my-reservations" element={<MyReservations />} />
          <Route path="/my-fines" element={<MyFines />} />
          <Route path="/subscriptions" element={<SubscriptionPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
