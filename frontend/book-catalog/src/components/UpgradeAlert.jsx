import React from "react";
import { Close } from "@mui/icons-material";

const UpgradeAlert = ({ title, message, onClose, onUpgrade }) => {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 20,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        background: "rgba(255,255,255,0.72)",
        backdropFilter: "blur(3px)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: 16,
          boxShadow: "0 24px 70px rgba(15,23,42,0.18)",
          padding: "20px 20px 18px",
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          aria-label="Dismiss"
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            width: 30,
            height: 30,
            borderRadius: "50%",
            border: "1px solid #e5e7eb",
            background: "#fff",
            color: "#64748b",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Close sx={{ fontSize: 16 }} />
        </button>
        <p
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#64748b",
            marginBottom: 8,
          }}
        >
          Upgrade Required
        </p>
        <h3
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: "#0f172a",
            marginBottom: 8,
            lineHeight: 1.25,
          }}
        >
          {title}
        </h3>
        <p
          style={{
            fontSize: 13,
            lineHeight: 1.7,
            color: "#475569",
            marginBottom: 18,
          }}
        >
          {message}
        </p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              border: "1px solid #e5e7eb",
              background: "#fff",
              color: "#334155",
              borderRadius: 10,
              padding: "10px 14px",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Dismiss
          </button>
          <button
            onClick={onUpgrade}
            style={{
              border: "1px solid #cbd5e1",
              background: "#0f172a",
              color: "#fff",
              borderRadius: 10,
              padding: "10px 14px",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Upgrade Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpgradeAlert;
