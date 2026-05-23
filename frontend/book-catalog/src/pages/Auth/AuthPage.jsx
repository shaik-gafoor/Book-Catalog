// import React, { useMemo, useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import {
//   Alert,
//   Box,
//   Button,
//   Card,
//   CardContent,
//   Divider,
//   Stack,
//   Tab,
//   Tabs,
//   TextField,
//   Typography,
// } from "@mui/material";
// import {
//   authLogin,
//   authSignup,
//   clearAuthSession,
//   forgotPassword,
//   resetPassword,
//   setAuthSession,
// } from "../../api/libraryApi";

// const panelSx = {
//   maxWidth: 560,
//   mx: "auto",
//   mt: { xs: 4, md: 8 },
//   border: "1px solid #e5e7eb",
//   borderRadius: 4,
//   overflow: "hidden",
//   boxShadow: "0 16px 48px rgba(15, 23, 42, 0.08)",
// };

// const fieldSx = {
//   "& .MuiOutlinedInput-root": {
//     borderRadius: 2,
//   },
// };

// const initialLogin = { username: "", password: "" };
// const initialSignup = { email: "", password: "", phone: "", fullName: "" };
// const initialForgot = { email: "" };
// const initialReset = { token: "", password: "" };

// const AuthPage = () => {
//   const [tab, setTab] = useState(0);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");
//   const [loginForm, setLoginForm] = useState(initialLogin);
//   const [signupForm, setSignupForm] = useState(initialSignup);
//   const [forgotForm, setForgotForm] = useState(initialForgot);
//   const [resetForm, setResetForm] = useState(initialReset);
//   const navigate = useNavigate();
//   const location = useLocation();

//   const fromPath = useMemo(
//     () => location.state?.from?.pathname || "/",
//     [location.state],
//   );

//   const submit = async (action) => {
//     setLoading(true);
//     setError("");
//     setSuccess("");
//     try {
//       const data = await action();
//       setSuccess(data?.message || "Success");
//       return data;
//     } catch (err) {
//       setError(err.message || "Request failed");
//       return null;
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleLogin = async () => {
//     const data = await submit(() => authLogin(loginForm));
//     if (data?.jwt) {
//       clearAuthSession();
//       setAuthSession(data.jwt, data.user);
//       navigate(fromPath, { replace: true });
//     }
//   };

//   const handleSignup = async () => {
//     const data = await submit(() => authSignup(signupForm));
//     if (data?.jwt) {
//       clearAuthSession();
//       setAuthSession(data.jwt, data.user);
//       navigate("/", { replace: true });
//     }
//   };

//   const handleForgot = async () => {
//     await submit(() => forgotPassword(forgotForm));
//   };

//   const handleReset = async () => {
//     await submit(() => resetPassword(resetForm));
//   };

//   return (
//     <Box sx={{ minHeight: "100vh", bgcolor: "#f9fafb", px: 2, py: 4 }}>
//       <Card sx={panelSx} elevation={0}>
//         <CardContent sx={{ p: { xs: 3, md: 4 } }}>
//           <Stack spacing={1} sx={{ mb: 3 }}>
//             <Typography variant="h4" sx={{ fontWeight: 800, color: "#111827" }}>
//               BookCatalog
//             </Typography>
//             <Typography variant="body2" sx={{ color: "#6b7280" }}>
//               Sign in, create an account, or manage password reset for the
//               library app.
//             </Typography>
//           </Stack>

//           <Tabs value={tab} onChange={(_, next) => setTab(next)} sx={{ mb: 3 }}>
//             <Tab label="Login" />
//             <Tab label="Signup" />
//             <Tab label="Forgot Password" />
//             <Tab label="Reset Password" />
//           </Tabs>

//           {error && (
//             <Alert severity="error" sx={{ mb: 2 }}>
//               {error}
//             </Alert>
//           )}
//           {success && (
//             <Alert severity="success" sx={{ mb: 2 }}>
//               {success}
//             </Alert>
//           )}

//           {tab === 0 && (
//             <Stack spacing={2}>
//               <TextField
//                 label="Username or email"
//                 value={loginForm.username}
//                 onChange={(e) =>
//                   setLoginForm({ ...loginForm, username: e.target.value })
//                 }
//                 fullWidth
//                 sx={fieldSx}
//               />
//               <TextField
//                 label="Password"
//                 type="password"
//                 value={loginForm.password}
//                 onChange={(e) =>
//                   setLoginForm({ ...loginForm, password: e.target.value })
//                 }
//                 fullWidth
//                 sx={fieldSx}
//               />
//               <Button
//                 variant="contained"
//                 onClick={handleLogin}
//                 disabled={loading}
//                 sx={{ textTransform: "none" }}
//               >
//                 Login
//               </Button>
//             </Stack>
//           )}

//           {tab === 1 && (
//             <Stack spacing={2}>
//               <TextField
//                 label="Full name"
//                 value={signupForm.fullName}
//                 onChange={(e) =>
//                   setSignupForm({ ...signupForm, fullName: e.target.value })
//                 }
//                 fullWidth
//                 sx={fieldSx}
//               />
//               <TextField
//                 label="Email"
//                 value={signupForm.email}
//                 onChange={(e) =>
//                   setSignupForm({ ...signupForm, email: e.target.value })
//                 }
//                 fullWidth
//                 sx={fieldSx}
//               />
//               <TextField
//                 label="Phone"
//                 value={signupForm.phone}
//                 onChange={(e) =>
//                   setSignupForm({ ...signupForm, phone: e.target.value })
//                 }
//                 fullWidth
//                 sx={fieldSx}
//               />
//               <TextField
//                 label="Password"
//                 type="password"
//                 value={signupForm.password}
//                 onChange={(e) =>
//                   setSignupForm({ ...signupForm, password: e.target.value })
//                 }
//                 fullWidth
//                 sx={fieldSx}
//               />
//               <Button
//                 variant="contained"
//                 onClick={handleSignup}
//                 disabled={loading}
//                 sx={{ textTransform: "none" }}
//               >
//                 Create account
//               </Button>
//             </Stack>
//           )}

//           {tab === 2 && (
//             <Stack spacing={2}>
//               <TextField
//                 label="Email"
//                 value={forgotForm.email}
//                 onChange={(e) => setForgotForm({ email: e.target.value })}
//                 fullWidth
//                 sx={fieldSx}
//               />
//               <Button
//                 variant="contained"
//                 onClick={handleForgot}
//                 disabled={loading}
//                 sx={{ textTransform: "none" }}
//               >
//                 Send reset link
//               </Button>
//             </Stack>
//           )}

//           {tab === 3 && (
//             <Stack spacing={2}>
//               <TextField
//                 label="Reset token"
//                 value={resetForm.token}
//                 onChange={(e) =>
//                   setResetForm({ ...resetForm, token: e.target.value })
//                 }
//                 fullWidth
//                 sx={fieldSx}
//               />
//               <TextField
//                 label="New password"
//                 type="password"
//                 value={resetForm.password}
//                 onChange={(e) =>
//                   setResetForm({ ...resetForm, password: e.target.value })
//                 }
//                 fullWidth
//                 sx={fieldSx}
//               />
//               <Button
//                 variant="contained"
//                 onClick={handleReset}
//                 disabled={loading}
//                 sx={{ textTransform: "none" }}
//               >
//                 Reset password
//               </Button>
//             </Stack>
//           )}

//           <Divider sx={{ my: 3 }} />
//           <Typography variant="caption" sx={{ color: "#9ca3af" }}>
//             The app will store the returned JWT in localStorage and send it as
//             Authorization: Bearer ...
//           </Typography>
//         </CardContent>
//       </Card>
//     </Box>
//   );
// };

// export default AuthPage;

import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  authLogin,
  authSignup,
  clearAuthSession,
  forgotPassword,
  setAuthSession,
} from "../../api/libraryApi";

/* ─── Design tokens ─────────────────────────────────────────────── */
const T = {
  bg: "#0a0a0a",
  surface: "#111111",
  surfaceHigh: "#181818",
  border: "#222222",
  text: "#f5f5f5",
  muted: "#888888",
  faint: "#3a3a3a",
  accent: "#ffffff",
  accentDim: "rgba(255,255,255,0.07)",
  errorBg: "rgba(255,80,80,0.08)",
  errorBorder: "rgba(255,107,107,0.22)",
  errorText: "#ff6b6b",
  successBg: "rgba(80,255,160,0.08)",
  successBdr: "rgba(74,222,128,0.22)",
  successText: "#4ade80",
};

/* ─── Inject CSS once ───────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: ${T.bg};
    color: ${T.text};
    font-family: 'DM Mono', monospace;
    -webkit-font-smoothing: antialiased;
  }

  /* ── Root grid ── */
  .ar {
    min-height: 100vh;
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  /* ── Left brand panel ── */
  .al {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 52px;
    background: ${T.surface};
    border-right: 1px solid ${T.border};
    overflow: hidden;
  }
  .al::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      repeating-linear-gradient(0deg,   transparent, transparent 39px, ${T.border} 39px, ${T.border} 40px),
      repeating-linear-gradient(90deg,  transparent, transparent 39px, ${T.border} 39px, ${T.border} 40px);
    opacity: 0.35;
    pointer-events: none;
  }
  .al-logo {
    font-family: 'DM Serif Display', serif;
    font-size: 26px;
    color: ${T.text};
    position: relative;
    z-index: 1;
  }
  .al-logo span { font-style: italic; color: ${T.muted}; }
  .al-center { position: relative; z-index: 1; }
  .al-headline {
    font-family: 'DM Serif Display', serif;
    font-size: clamp(34px, 3.6vw, 50px);
    line-height: 1.1;
    color: ${T.text};
    margin-bottom: 18px;
  }
  .al-headline em { font-style: italic; color: ${T.muted}; }
  .al-sub {
    font-size: 12px;
    letter-spacing: 0.07em;
    color: ${T.muted};
    line-height: 1.75;
    max-width: 300px;
  }
  .al-foot {
    position: relative;
    z-index: 1;
    font-size: 10px;
    color: ${T.faint};
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  /* ── Right form panel ── */
  .aright {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 48px 40px;
    background: ${T.bg};
  }
  .aform { width: 100%; max-width: 370px; }

  /* ── Two-tab switcher ── */
  .atabs {
    display: grid;
    grid-template-columns: 1fr 1fr;
    border: 1px solid ${T.border};
    border-radius: 6px;
    overflow: hidden;
    margin-bottom: 36px;
  }
  .atab {
    background: transparent;
    border: none;
    border-right: 1px solid ${T.border};
    padding: 11px 8px;
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: ${T.muted};
    cursor: pointer;
    transition: background 0.18s, color 0.18s;
  }
  .atab:last-child { border-right: none; }
  .atab:hover:not(.atab-on) { background: ${T.accentDim}; color: ${T.text}; }
  .atab-on { background: ${T.accent}; color: ${T.bg}; font-weight: 500; }

  /* ── Section head ── */
  .ahead { font-family: 'DM Serif Display', serif; font-size: 26px; color: ${T.text}; margin-bottom: 4px; }
  .asub  { font-size: 11px; color: ${T.muted}; letter-spacing: 0.04em; margin-bottom: 28px; }

  /* ── Alerts ── */
  .aalert {
    border-radius: 4px;
    padding: 10px 14px;
    font-size: 11px;
    letter-spacing: 0.04em;
    margin-bottom: 18px;
    border: 1px solid transparent;
    line-height: 1.55;
  }
  .aerr { background:${T.errorBg};   border-color:${T.errorBorder}; color:${T.errorText}; }
  .aok  { background:${T.successBg}; border-color:${T.successBdr};  color:${T.successText}; }

  /* ── Fields ── */
  .afields { display:flex; flex-direction:column; gap:14px; margin-bottom:6px; }
  .afield  { display:flex; flex-direction:column; gap:6px; }
  .alabel  { font-size:10px; letter-spacing:0.12em; text-transform:uppercase; color:${T.muted}; }

  .ainput {
    background: ${T.surface};
    border: 1px solid ${T.border};
    border-radius: 4px;
    padding: 12px 14px;
    font-family: 'DM Mono', monospace;
    font-size: 13px;
    color: ${T.text};
    outline: none;
    width: 100%;
    transition: border-color 0.18s, box-shadow 0.18s;
  }
  .ainput::placeholder { color: ${T.faint}; }
  .ainput:focus { border-color: ${T.accent}; box-shadow: 0 0 0 3px rgba(255,255,255,0.05); }

  /* ── Kill browser autofill colour injection ── */
  .ainput:-webkit-autofill,
  .ainput:-webkit-autofill:hover,
  .ainput:-webkit-autofill:focus,
  .ainput:-webkit-autofill:active {
    -webkit-box-shadow: 0 0 0 9999px ${T.surface} inset !important;
    box-shadow:         0 0 0 9999px ${T.surface} inset !important;
    -webkit-text-fill-color: ${T.text} !important;
    caret-color: ${T.text};
    transition: background-color 99999s ease-in-out 0s;
  }

  /* ── Forgot link row ── */
  .aforgot-row {
    display: flex;
    justify-content: flex-end;
    margin-top: 6px;
    margin-bottom: 20px;
  }
  .aforgot-link {
    background: none;
    border: none;
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.08em;
    color: ${T.muted};
    cursor: pointer;
    padding: 0;
    text-decoration: underline;
    text-underline-offset: 3px;
    text-decoration-color: ${T.faint};
    transition: color 0.15s;
  }
  .aforgot-link:hover { color: ${T.text}; text-decoration-color: ${T.text}; }

  /* ── Forgot inline panel ── */
  .aforgot-panel {
    border: 1px solid ${T.border};
    border-radius: 6px;
    padding: 18px;
    margin-bottom: 20px;
    background: ${T.surfaceHigh};
    animation: slideDown 0.22s ease forwards;
  }
  .aforgot-title {
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: ${T.text};
    margin-bottom: 12px;
  }
  .aforgot-actions {
    display: flex;
    gap: 8px;
    margin-top: 12px;
  }
  .aforgot-send {
    flex: 1;
    padding: 10px;
    background: ${T.accent};
    color: ${T.bg};
    border: none;
    border-radius: 4px;
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    cursor: pointer;
    transition: opacity 0.15s;
  }
  .aforgot-send:hover:not(:disabled) { opacity: 0.85; }
  .aforgot-send:disabled { opacity: 0.35; cursor: not-allowed; }
  .aforgot-cancel {
    padding: 10px 14px;
    background: transparent;
    color: ${T.muted};
    border: 1px solid ${T.border};
    border-radius: 4px;
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    cursor: pointer;
    transition: border-color 0.15s, color 0.15s;
  }
  .aforgot-cancel:hover { border-color: ${T.muted}; color: ${T.text}; }

  /* ── Main CTA button ── */
  .abtn {
    width: 100%;
    padding: 13px;
    background: ${T.accent};
    color: ${T.bg};
    border: none;
    border-radius: 4px;
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    cursor: pointer;
    transition: opacity 0.18s, transform 0.14s;
    margin-top: 20px;
  }
  .abtn:hover:not(:disabled) { opacity: 0.87; transform: translateY(-1px); }
  .abtn:active:not(:disabled) { transform: translateY(0); }
  .abtn:disabled { opacity: 0.3; cursor: not-allowed; }

  /* ── Bottom switch link ── */
  .aswitch {
    margin-top: 22px;
    text-align: center;
    font-size: 11px;
    color: ${T.muted};
    letter-spacing: 0.04em;
  }
  .aswitch button {
    background: none;
    border: none;
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    color: ${T.text};
    cursor: pointer;
    text-decoration: underline;
    text-underline-offset: 3px;
    padding: 0;
    margin-left: 4px;
  }

  /* ── Animations ── */
  @keyframes fadeUp   { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  @keyframes slideDown{ from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
  .fade-up { animation: fadeUp 0.3s ease forwards; }

  /* ── Responsive ── */
  @media (max-width: 760px) {
    .ar { grid-template-columns: 1fr; }
    .al { display: none; }
    .aright { padding: 40px 20px; align-items: flex-start; }
  }
`;

if (typeof document !== "undefined" && !document.getElementById("auth-css")) {
  const s = document.createElement("style");
  s.id = "auth-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

/* ─── Field component ───────────────────────────────────────────── */
const Field = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete = "new-password",
}) => (
  <div className="afield">
    <label className="alabel">{label}</label>
    <input
      className="ainput"
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder || ""}
      autoComplete={autoComplete}
      data-lpignore="true"
      data-form-type="other"
    />
  </div>
);

/* ─── AuthPage ──────────────────────────────────────────────────── */
const AuthPage = () => {
  // 0 = login, 1 = signup
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForgot, setShowForgot] = useState(false);

  const [loginForm, setLogin] = useState({ username: "", password: "" });
  const [signupForm, setSignup] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [forgotEmail, setForgotEmail] = useState("");

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
    const data = await submit(() => forgotPassword({ email: forgotEmail }));
    if (data) setShowForgot(false);
  };

  const switchTab = (i) => {
    setTab(i);
    setError("");
    setSuccess("");
    setShowForgot(false);
  };

  const META = [
    { title: "Welcome back.", sub: "Sign in to your library account." },
    { title: "Join us.", sub: "Create your library account in seconds." },
  ];

  return (
    <div className="ar">
      {/* ── Brand left ── */}
      <div className="al">
        <div className="al-logo">
          Book<span>Catalog</span>
        </div>
        <div className="al-center">
          <h1 className="al-headline">
            Your library,
            <br />
            <em>organised.</em>
          </h1>
          <p className="al-sub">
            A minimal catalog for readers who value their collection. Borrow,
            track, and discover — all in one place.
          </p>
        </div>
        <p className="al-foot">BookCatalog © {new Date().getFullYear()}</p>
      </div>

      {/* ── Form right ── */}
      <div className="aright">
        <div className="aform">
          {/* Tabs */}
          <div className="atabs">
            {["Login", "Sign Up"].map((label, i) => (
              <button
                key={label}
                className={`atab${tab === i ? " atab-on" : ""}`}
                onClick={() => switchTab(i)}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Animated section */}
          <div key={tab} className="fade-up">
            <h2 className="ahead">{META[tab].title}</h2>
            <p className="asub">{META[tab].sub}</p>

            {error && <div className="aalert aerr">{error}</div>}
            {success && <div className="aalert aok">{success}</div>}

            {/* ── LOGIN ── */}
            {tab === 0 && (
              <>
                {/* Hidden honeypot fields — stops Chrome autofill on real inputs */}
                <input
                  type="text"
                  style={{ display: "none" }}
                  aria-hidden="true"
                  readOnly
                />
                <input
                  type="password"
                  style={{ display: "none" }}
                  aria-hidden="true"
                  readOnly
                />
                <div className="afields">
                  <Field
                    label="Username or email"
                    value={loginForm.username}
                    placeholder="you@example.com"
                    autoComplete="new-password"
                    onChange={(e) =>
                      setLogin({ ...loginForm, username: e.target.value })
                    }
                  />
                  <Field
                    label="Password"
                    type="password"
                    value={loginForm.password}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    onChange={(e) =>
                      setLogin({ ...loginForm, password: e.target.value })
                    }
                  />
                </div>

                {/* Forgot password link */}
                <div className="aforgot-row">
                  <button
                    className="aforgot-link"
                    onClick={() => {
                      setShowForgot(!showForgot);
                      setError("");
                      setSuccess("");
                    }}
                  >
                    {showForgot ? "Hide" : "Forgot password?"}
                  </button>
                </div>

                {/* Inline forgot panel */}
                {showForgot && (
                  <div className="aforgot-panel">
                    <p className="aforgot-title">Reset your password</p>
                    <Field
                      label="Your email address"
                      value={forgotEmail}
                      placeholder="you@example.com"
                      onChange={(e) => setForgotEmail(e.target.value)}
                    />
                    <div className="aforgot-actions">
                      <button
                        className="aforgot-send"
                        onClick={handleForgot}
                        disabled={loading}
                      >
                        {loading ? "Sending…" : "Send reset link →"}
                      </button>
                      <button
                        className="aforgot-cancel"
                        onClick={() => setShowForgot(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <button
                  className="abtn"
                  onClick={handleLogin}
                  disabled={loading}
                >
                  {loading ? "Signing in…" : "Sign in →"}
                </button>

                <p className="aswitch">
                  Don't have an account?
                  <button onClick={() => switchTab(1)}>Create one</button>
                </p>
              </>
            )}

            {/* ── SIGN UP ── */}
            {tab === 1 && (
              <>
                <div className="afields">
                  <Field
                    label="Full name"
                    value={signupForm.fullName}
                    placeholder="Jane Doe"
                    onChange={(e) =>
                      setSignup({ ...signupForm, fullName: e.target.value })
                    }
                  />
                  <Field
                    label="Email"
                    value={signupForm.email}
                    placeholder="you@example.com"
                    onChange={(e) =>
                      setSignup({ ...signupForm, email: e.target.value })
                    }
                  />
                  <Field
                    label="Phone"
                    value={signupForm.phone}
                    placeholder="+91 00000 00000"
                    onChange={(e) =>
                      setSignup({ ...signupForm, phone: e.target.value })
                    }
                  />
                  <Field
                    label="Password"
                    type="password"
                    value={signupForm.password}
                    placeholder="••••••••"
                    onChange={(e) =>
                      setSignup({ ...signupForm, password: e.target.value })
                    }
                  />
                </div>

                <button
                  className="abtn"
                  onClick={handleSignup}
                  disabled={loading}
                >
                  {loading ? "Creating account…" : "Create account →"}
                </button>

                <p className="aswitch">
                  Already have an account?
                  <button onClick={() => switchTab(0)}>Sign in</button>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
