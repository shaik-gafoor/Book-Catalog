import React, { useEffect, useState } from "react";
import { MenuBook } from "@mui/icons-material";

const mockRecommendations = [
  {
    id: 1,
    title: "Klara and the Sun",
    author: "Kazuo Ishiguro",
    genre: "Literary Fiction",
    reason: "Based on your history",
  },
  {
    id: 2,
    title: "The Overstory",
    author: "Richard Powers",
    genre: "Fiction",
    reason: "Popular in your genre",
  },
  {
    id: 3,
    title: "Fourth Wing",
    author: "Rebecca Yarros",
    genre: "Fantasy",
    reason: "Trending this week",
  },
  {
    id: 4,
    title: "Cloud Cuckoo Land",
    author: "Anthony Doerr",
    genre: "Historical Fiction",
    reason: "Readers like you enjoyed this",
  },
  {
    id: 5,
    title: "Tomorrow, and Tomorrow",
    author: "Gabrielle Zevin",
    genre: "Literary Fiction",
    reason: "Based on your history",
  },
  {
    id: 6,
    title: "Lessons in Chemistry",
    author: "Bonnie Garmus",
    genre: "Fiction",
    reason: "Highly rated this month",
  },
];

function Recommandation() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  const genres = ["All", ...new Set(mockRecommendations.map((r) => r.genre))];

  useEffect(() => {
    const timer = setTimeout(() => {
      setRecommendations(mockRecommendations);
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const filtered =
    filter === "All"
      ? recommendations
      : recommendations.filter((r) => r.genre === filter);

  return (
    <div className="min-h-screen bg-[#f8f8f6] px-6 py-8">
      <div className="mb-8 pb-6 border-b border-gray-200">
        <h1
          className="text-3xl font-normal tracking-tight text-gray-900"
          style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
        >
          Recommendations
        </h1>
        <p className="mt-1 text-sm text-gray-400 font-light">
          Curated picks just for you
        </p>
      </div>

      <div className="flex gap-2 flex-wrap mb-6">
        {genres.map((g) => (
          <button
            key={g}
            onClick={() => setFilter(g)}
            className={`text-xs font-medium px-3.5 py-1.5 rounded-full border transition-all duration-150 ${
              filter === g
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-white text-gray-500 border-gray-200 hover:border-gray-400 hover:text-gray-700"
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((book, i) => (
            <RecommendationCard key={book.id} book={book} index={i} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border border-dashed border-gray-200 rounded-2xl bg-white">
          <p className="text-sm text-gray-400 font-light">
            No recommendations in this genre.
          </p>
        </div>
      )}
    </div>
  );
}

const RecommendationCard = ({ book, index }) => (
  <div
    className="group bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-3 cursor-default relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-sm"
    style={{ animationDelay: `${index * 0.06}s` }}
  >
    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />

    <div className="flex items-start gap-3">
      <div className="relative flex-shrink-0 w-9 h-12 rounded-sm bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden">
        <span className="absolute left-0 top-0 bottom-0 w-1 bg-gray-900 opacity-10" />
        <MenuBook sx={{ fontSize: 18, color: "#9ca3af" }} />
      </div>
      <div className="flex-1 min-w-0">
        <h4
          className="text-sm font-normal text-gray-900 leading-snug mb-0.5"
          style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
        >
          {book.title}
        </h4>
        <p className="text-xs text-gray-400 font-light">{book.author}</p>
      </div>
    </div>

    <div className="flex items-center justify-between mt-auto">
      <span className="text-xs text-gray-400 bg-gray-100 border border-gray-200 rounded-full px-2.5 py-0.5">
        {book.genre}
      </span>
      <span className="text-xs text-gray-400 font-light italic">
        {book.reason}
      </span>
    </div>

    <button className="w-full text-xs font-medium text-gray-600 bg-gray-100 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all duration-150">
      Reserve
    </button>
  </div>
);

export default Recommandation;
