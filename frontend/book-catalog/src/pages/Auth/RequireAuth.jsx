// import React from "react";
// import { Navigate, Outlet, useLocation } from "react-router-dom";
// import { getAuthToken } from "../../api/libraryApi";

// const RequireAuth = () => {
//   const location = useLocation();
//   const token = getAuthToken();

//   if (!token) {
//     return <Navigate to="/auth" replace state={{ from: location }} />;
//   }

//   return <Outlet />;
// };

// export default RequireAuth;

import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getAuthToken } from "../../api/libraryApi";

/**
 * RequireAuth
 * ──────────────────────────────────────────────────────────────────
 * Protects child routes. If no JWT exists in storage the user is
 * redirected to /auth, and the attempted path is preserved in
 * location.state so AuthPage can navigate back after login.
 */
const RequireAuth = () => {
  const location = useLocation();
  const token = getAuthToken();

  if (!token) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default RequireAuth;
