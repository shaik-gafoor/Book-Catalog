import React, { useState, useEffect, useRef } from "react";
import StatesCard from "./StatesCard";
import CurrentLoans from "./CurrentLoans";
import Reservation from "./Reservation";
import ReadingHistory from "./ReadingHistory";
import Recommandation from "./Recommandation";
import { Box, Tabs, Tab } from "@mui/material";
import { MenuBook } from "@mui/icons-material";
import { statsConfig } from "./StateConfig";

const cheerEmojis = [
  "🎉",
  "🥳",
  "🏆",
  "⭐",
  "🔥",
  "💪",
  "📚",
  "🌟",
  "🎊",
  "🙌",
];
const cheerMessages = [
  "🌟 You're crushing it — 25 books done!",
  "🔥 On fire! Keep that reading streak!",
  "🏆 Champion reader in the making!",
  "💪 Unstoppable! 5 more to glory!",
  "📚 Books completed, minds expanded!",
  "🎊 25 stories richer — amazing!",
  "🙌 The finish line is SO close!",
  "⭐ Star reader alert — that's you!",
];

const TOTAL_BOOKS = 30;
const READ_BOOKS = 25;
const PROGRESS = (READ_BOOKS / TOTAL_BOOKS) * 100;

const stateData = statsConfig({
  myLoans: [1, 2, 3],
  reservations: [1, 2],
  stats: { readingStreak: 5 },
});

const ReadingGoalCard = () => {
  const [cheerIndex, setCheerIndex] = useState(0);
  const [msgIndex, setMsgIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [bursts, setBursts] = useState([]);
  const [emojiKey, setEmojiKey] = useState(0);
  const [msgKey, setMsgKey] = useState(0);
  const [barVisible, setBarVisible] = useState(false);
  const cheerCardRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setBarVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  const handleCheerClick = () => {
    if (isAnimating) return;
    setIsAnimating(true);

    const rect = cheerCardRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    const newBursts = Array.from({ length: 8 }, (_, i) => ({
      id: Date.now() + i,
      emoji: ["✨", "🌟", "⭐", "🎊", "🎉", "💥", "🔥"][
        Math.floor(Math.random() * 7)
      ],
      angle: (i / 8) * 360,
      dist: 50 + Math.random() * 60,
      size: 14 + Math.random() * 10,
      x: cx,
      y: cy,
    }));
    setBursts(newBursts);
    setTimeout(() => setBursts([]), 800);

    setCheerIndex((prev) => (prev + 1) % cheerEmojis.length);
    setMsgIndex((prev) => (prev + 1) % cheerMessages.length);
    setEmojiKey((k) => k + 1);
    setMsgKey((k) => k + 1);
    setTimeout(() => setIsAnimating(false), 700);
  };

  return (
    <>
      <style>{`
        @keyframes fillBar {
          from { width: 0%; }
          to { width: ${PROGRESS}%; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }
        @keyframes sparkIn {
          from { opacity: 0; transform: scale(0.4) rotate(-10deg); }
          to { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        @keyframes countUp {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes cheerBounce {
          0%   { transform: translateY(0) scale(1) rotate(0deg); }
          30%  { transform: translateY(-22px) scale(1.3) rotate(-8deg); }
          60%  { transform: translateY(-30px) scale(1.4) rotate(8deg); }
          80%  { transform: translateY(-18px) scale(1.1) rotate(-4deg); }
          100% { transform: translateY(0) scale(1) rotate(0deg); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-12deg); }
          75% { transform: rotate(12deg); }
        }
        @keyframes burstOut {
          from { transform: translate(0, 0) scale(1); opacity: 1; }
          to   { transform: translate(var(--dx), var(--dy)) scale(0.3); opacity: 0; }
        }
        .rg-book-wrap  { animation: sparkIn 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.2s both; }
        .rg-book-inner { animation: float 3s ease-in-out 1s infinite; }
        .rg-bar-fill {
          animation: ${barVisible ? `fillBar 1.2s cubic-bezier(0.4,0,0.2,1) 0.3s both` : "none"};
          width: ${barVisible ? `${PROGRESS}%` : "0%"};
        }
        .rg-shimmer  { animation: shimmer 2.5s ease-in-out 1.5s infinite; }
        .rg-stat-1   { animation: countUp 0.5s ease 0.7s both; opacity: 0; }
        .rg-stat-2   { animation: countUp 0.5s ease 0.85s both; opacity: 0; }
        .rg-cheer    { animation: countUp 0.5s ease 1s both; opacity: 0; }
        .rg-msg      { animation: fadeSlideUp 0.5s ease 1.2s both; opacity: 0; }
        .rg-emoji-bounce { animation: cheerBounce 0.7s cubic-bezier(0.34,1.56,0.64,1) both; }
        .rg-emoji-idle   { animation: wiggle 1s ease-in-out 2s 3; }
        .rg-msg-slide    { animation: fadeSlideUp 0.4s ease both; }
        .rg-tab .MuiTab-root {
          font-size: 0.8rem;
          font-weight: 500;
          color: #6b7280;
          text-transform: none;
          min-height: 44px;
        }
        .rg-tab .MuiTab-root.Mui-selected {
          color: #111827;
          font-weight: 600;
        }
        .rg-tab .MuiTabs-indicator {
          background-color: #1a1a1a;
          height: 2px;
        }
      `}</style>

      {/* Burst particles */}
      {bursts.map((b) => {
        const rad = (b.angle * Math.PI) / 180;
        const dx = Math.cos(rad) * b.dist;
        const dy = Math.sin(rad) * b.dist;
        return (
          <div
            key={b.id}
            style={{
              position: "fixed",
              left: b.x,
              top: b.y,
              fontSize: b.size,
              pointerEvents: "none",
              zIndex: 9999,
              "--dx": `${dx}px`,
              "--dy": `${dy}px`,
              animation: "burstOut 0.7s ease-out both",
            }}
          >
            {b.emoji}
          </div>
        );
      })}

      {/* Reading Goal Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div style={{ animation: "countUp 0.5s ease both" }}>
            <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-1">
              2025 Reading Goal
            </p>
            <h3 className="text-xl font-semibold text-gray-900 mb-1">
              {READ_BOOKS} of {TOTAL_BOOKS} books
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                {TOTAL_BOOKS - READ_BOOKS} books to go
              </span>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                On track
              </span>
            </div>
          </div>

          <div className="rg-book-wrap">
            <div className="rg-book-inner w-14 h-14 rounded-full flex items-center justify-center bg-gray-100">
              <MenuBook sx={{ fontSize: 26, color: "#374151" }} />
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative h-3 rounded-full overflow-hidden mb-2.5 bg-gray-100">
          <div
            className="rg-bar-fill absolute left-0 top-0 bottom-0 rounded-full"
            style={{
              background: "linear-gradient(90deg, #1a1a1a 0%, #6b7280 100%)",
            }}
          >
            <div
              className="rg-shimmer absolute inset-0 rounded-full"
              style={{
                background:
                  "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%)",
                width: "40%",
              }}
            />
          </div>
        </div>

        <div className="flex justify-between items-center mb-5">
          <span className="text-xs text-gray-400">0</span>
          <div className="flex items-center gap-1">
            <span className="text-sm">🔥</span>
            <span className="text-xs font-medium text-gray-500">
              {Math.round(PROGRESS)}% complete
            </span>
          </div>
          <span className="text-xs text-gray-400">{TOTAL_BOOKS}</span>
        </div>

        {/* Stats Row */}
        <div className="flex gap-2 border-t border-gray-100 pt-4 mb-4">
          <div className="rg-stat-1 flex-1 bg-gray-50 border border-gray-100 rounded-xl p-3 text-center">
            <p className="text-lg font-semibold text-gray-900 m-0">
              {READ_BOOKS}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">Read</p>
          </div>
          <div className="rg-stat-2 flex-1 bg-gray-50 border border-gray-100 rounded-xl p-3 text-center">
            <p className="text-lg font-semibold text-gray-900 m-0">
              {TOTAL_BOOKS - READ_BOOKS}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">Remaining</p>
          </div>
          <div
            ref={cheerCardRef}
            className="rg-cheer flex-1 bg-gray-50 border border-gray-100 rounded-xl p-3 text-center cursor-pointer select-none hover:bg-gray-100 transition-colors"
            onClick={handleCheerClick}
          >
            <div
              key={emojiKey}
              className={emojiKey > 0 ? "rg-emoji-bounce" : "rg-emoji-idle"}
              style={{ fontSize: 22, lineHeight: 1, marginBottom: 2 }}
            >
              {cheerEmojis[cheerIndex]}
            </div>
            <p className="text-xs text-gray-400 mt-0.5">Cheers</p>
          </div>
        </div>

        {/* Cheer Message */}
        <div
          key={msgKey}
          className={msgKey > 0 ? "rg-msg-slide" : "rg-msg"}
          style={{
            textAlign: "center",
            fontSize: 13,
            fontWeight: 500,
            color: "#374151",
            background: "#f3f4f6",
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            padding: "8px 12px",
            minHeight: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {cheerMessages[msgIndex]}
        </div>
      </div>
    </>
  );
};

const Dashboard = () => {
  const [tabValue, setTabValue] = useState(0);

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Dashboard
        </h1>
        <p className="mt-1.5 text-sm text-gray-500 max-w-lg">
          A place where books are more than pages — they become ideas, dreams,
          and the beginning of something extraordinary.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stateData.map((item, index) => (
          <StatesCard
            bgColor={item.bgColor}
            textColor={item.textColor}
            borderColor={item.borderColor}
            icon={item.icon}
            value={item.value}
            title={item.title}
            subtitle={item.subtitle}
            key={item.id || index}
          />
        ))}
      </div>

      {/* Reading Goal */}
      <ReadingGoalCard />

      {/* Tab Section */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mt-6">
        <Box
          className="rg-tab"
          sx={{ borderBottom: 1, borderColor: "#f3f4f6", px: 2 }}
        >
          <Tabs
            value={tabValue}
            onChange={(_, newValue) => setTabValue(newValue)}
            aria-label="dashboard tabs"
            sx={{
              "& .MuiTab-root": {
                fontSize: "0.8rem",
                fontWeight: 500,
                color: "#6b7280",
                textTransform: "none",
                minHeight: 44,
                px: 1.5,
              },
              "& .MuiTab-root.Mui-selected": {
                color: "#111827",
                fontWeight: 600,
              },
              "& .MuiTabs-indicator": {
                backgroundColor: "#1a1a1a",
                height: 2,
              },
            }}
          >
            <Tab label="Current Loans" />
            <Tab label="Reservations" />
            <Tab label="Reading History" />
            <Tab label="Recommendations" />
          </Tabs>
        </Box>

        {tabValue === 0 && <CurrentLoans />}
        {tabValue === 1 && <Reservation />}
        {tabValue === 2 && <ReadingHistory />}
        {tabValue === 3 && <Recommandation />}
      </div>
    </div>
  );
};

export default Dashboard;
