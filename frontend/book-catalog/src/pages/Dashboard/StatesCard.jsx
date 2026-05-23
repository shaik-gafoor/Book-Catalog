import React, { useEffect, useState } from "react";

function StatesCard({ icon, value, title, subtitle }) {
  const [displayValue, setDisplayValue] = useState(Number(value) || 0);

  useEffect(() => {
    const target = Number(value) || 0;
    const start = Number(displayValue) || 0;
    if (start === target) {
      setDisplayValue(target);
      return;
    }

    const duration = 900;
    const stepMs = 16;
    const totalSteps = Math.max(1, Math.round(duration / stepMs));
    let step = 0;

    const timer = setInterval(() => {
      step += 1;
      const progress = step / totalSteps;
      const nextValue = start + (target - start) * progress;

      if (step >= totalSteps) {
        setDisplayValue(target);
        clearInterval(timer);
        return;
      }

      setDisplayValue(Math.round(nextValue));
    }, stepMs);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <div
      style={{
        background: "#ffffff",
        border: "0.5px solid #e0ddd6",
        borderRadius: "16px",
        padding: "22px 20px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
        overflow: "hidden",
        cursor: "default",
        transition: "transform 0.2s, border-color 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.borderColor = "#b8b5ae";
        e.currentTarget.querySelector(".ubar").style.transform = "scaleX(1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.borderColor = "#e0ddd6";
        e.currentTarget.querySelector(".ubar").style.transform = "scaleX(0)";
      }}
    >
      <div
        className="ubar"
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "2px",
          background: "#2d5a3d",
          transform: "scaleX(0)",
          transformOrigin: "left",
          transition: "transform 0.3s",
        }}
      />

      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "10px",
            background: "#f0ede6",
            border: "0.5px solid #e0ddd6",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
        <span
          style={{
            fontFamily:
              "'Playfair Display', 'DM Serif Display', Georgia, serif",
            fontSize: "36px",
            fontWeight: 400,
            color: "#1a1a18",
            lineHeight: 1,
          }}
        >
          {displayValue}
        </span>
      </div>

      <div>
        <p
          style={{
            fontSize: "13.5px",
            fontWeight: 500,
            color: "#2C2C2A",
            marginBottom: "3px",
          }}
        >
          {title}
        </p>
        <p style={{ fontSize: "11.5px", color: "#888780", fontWeight: 300 }}>
          {subtitle}
        </p>
      </div>
    </div>
  );
}

export default StatesCard;
