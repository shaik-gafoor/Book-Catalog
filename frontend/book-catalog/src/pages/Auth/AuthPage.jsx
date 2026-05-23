import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import {
  authLogin,
  authSignup,
  clearAuthSession,
  forgotPassword,
  resetPassword,
  setAuthSession,
} from "../../api/libraryApi";

const panelSx = {
  maxWidth: 560,
  mx: "auto",
  mt: { xs: 4, md: 8 },
  border: "1px solid #e5e7eb",
  borderRadius: 4,
  overflow: "hidden",
  boxShadow: "0 16px 48px rgba(15, 23, 42, 0.08)",
};

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
  },
};

const initialLogin = { username: "", password: "" };
const initialSignup = { email: "", password: "", phone: "", fullName: "" };
const initialForgot = { email: "" };
const initialReset = { token: "", password: "" };

const AuthPage = () => {
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loginForm, setLoginForm] = useState(initialLogin);
  const [signupForm, setSignupForm] = useState(initialSignup);
  const [forgotForm, setForgotForm] = useState(initialForgot);
  const [resetForm, setResetForm] = useState(initialReset);
  const navigate = useNavigate();
  const location = useLocation();

  const fromPath = useMemo(
    () => location.state?.from?.pathname || "/",
    [location.state],
  );

  const submit = async (action) => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const data = await action();
      setSuccess(data?.message || "Success");
      return data;
    } catch (err) {
      setError(err.message || "Request failed");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    const data = await submit(() => authLogin(loginForm));
    if (data?.jwt) {
      clearAuthSession();
      setAuthSession(data.jwt, data.user);
      navigate(fromPath, { replace: true });
    }
  };

  const handleSignup = async () => {
    const data = await submit(() => authSignup(signupForm));
    if (data?.jwt) {
      clearAuthSession();
      setAuthSession(data.jwt, data.user);
      navigate("/", { replace: true });
    }
  };

  const handleForgot = async () => {
    await submit(() => forgotPassword(forgotForm));
  };

  const handleReset = async () => {
    await submit(() => resetPassword(resetForm));
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f9fafb", px: 2, py: 4 }}>
      <Card sx={panelSx} elevation={0}>
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Stack spacing={1} sx={{ mb: 3 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: "#111827" }}>
              BookCatalog
            </Typography>
            <Typography variant="body2" sx={{ color: "#6b7280" }}>
              Sign in, create an account, or manage password reset for the
              library app.
            </Typography>
          </Stack>

          <Tabs value={tab} onChange={(_, next) => setTab(next)} sx={{ mb: 3 }}>
            <Tab label="Login" />
            <Tab label="Signup" />
            <Tab label="Forgot Password" />
            <Tab label="Reset Password" />
          </Tabs>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          {tab === 0 && (
            <Stack spacing={2}>
              <TextField
                label="Username or email"
                value={loginForm.username}
                onChange={(e) =>
                  setLoginForm({ ...loginForm, username: e.target.value })
                }
                fullWidth
                sx={fieldSx}
              />
              <TextField
                label="Password"
                type="password"
                value={loginForm.password}
                onChange={(e) =>
                  setLoginForm({ ...loginForm, password: e.target.value })
                }
                fullWidth
                sx={fieldSx}
              />
              <Button
                variant="contained"
                onClick={handleLogin}
                disabled={loading}
                sx={{ textTransform: "none" }}
              >
                Login
              </Button>
            </Stack>
          )}

          {tab === 1 && (
            <Stack spacing={2}>
              <TextField
                label="Full name"
                value={signupForm.fullName}
                onChange={(e) =>
                  setSignupForm({ ...signupForm, fullName: e.target.value })
                }
                fullWidth
                sx={fieldSx}
              />
              <TextField
                label="Email"
                value={signupForm.email}
                onChange={(e) =>
                  setSignupForm({ ...signupForm, email: e.target.value })
                }
                fullWidth
                sx={fieldSx}
              />
              <TextField
                label="Phone"
                value={signupForm.phone}
                onChange={(e) =>
                  setSignupForm({ ...signupForm, phone: e.target.value })
                }
                fullWidth
                sx={fieldSx}
              />
              <TextField
                label="Password"
                type="password"
                value={signupForm.password}
                onChange={(e) =>
                  setSignupForm({ ...signupForm, password: e.target.value })
                }
                fullWidth
                sx={fieldSx}
              />
              <Button
                variant="contained"
                onClick={handleSignup}
                disabled={loading}
                sx={{ textTransform: "none" }}
              >
                Create account
              </Button>
            </Stack>
          )}

          {tab === 2 && (
            <Stack spacing={2}>
              <TextField
                label="Email"
                value={forgotForm.email}
                onChange={(e) => setForgotForm({ email: e.target.value })}
                fullWidth
                sx={fieldSx}
              />
              <Button
                variant="contained"
                onClick={handleForgot}
                disabled={loading}
                sx={{ textTransform: "none" }}
              >
                Send reset link
              </Button>
            </Stack>
          )}

          {tab === 3 && (
            <Stack spacing={2}>
              <TextField
                label="Reset token"
                value={resetForm.token}
                onChange={(e) =>
                  setResetForm({ ...resetForm, token: e.target.value })
                }
                fullWidth
                sx={fieldSx}
              />
              <TextField
                label="New password"
                type="password"
                value={resetForm.password}
                onChange={(e) =>
                  setResetForm({ ...resetForm, password: e.target.value })
                }
                fullWidth
                sx={fieldSx}
              />
              <Button
                variant="contained"
                onClick={handleReset}
                disabled={loading}
                sx={{ textTransform: "none" }}
              >
                Reset password
              </Button>
            </Stack>
          )}

          <Divider sx={{ my: 3 }} />
          <Typography variant="caption" sx={{ color: "#9ca3af" }}>
            The app will store the returned JWT in localStorage and send it as
            Authorization: Bearer ...
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AuthPage;
