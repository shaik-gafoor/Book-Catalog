import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { getAuthUser, isAdminUser } from "../../api/libraryApi";

const RequireAdmin = () => {
  const currentUser = getAuthUser();

  if (!isAdminUser(currentUser)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default RequireAdmin;
