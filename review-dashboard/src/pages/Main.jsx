import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import CollapsibleSection from "../components/CollapsibleSection";
import { BeakerIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

const Main = () => {
  const [reviews, setReviews] = useState([]);
  const [search, setSearch] = useState("");

  const role = localStorage.getItem("role");
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://localhost:3001/api/analysis").then((res) => {
      setReviews(res.data);
    });
  }, []);

  const filtered = reviews.filter((item) => {
    const content = `${item.pylint_output} ${item.bandit_output}`.toLowerCase();
    return content.includes(search.toLowerCase());
  });

  const handleExport = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      reviews
        .map((r) =>
          `"${r.pylint_output.replace(/\n/g, " ")}","${r.bandit_output.replace(
            /\n/g,
            " "
          )}","${new Date(r.createdAt).toLocaleString()}"`
        )
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "code_reviews.csv");
    document.body.appendChild(link);
    link.click();
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white font-mono animate-fadeIn">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 py-4 px-8 glass shadow-xl">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <BeakerIcon className="w-8 h-8 text-teal-400 animate-pulse" />
            <h1 className="text-2xl font-bold text-white">
              AI Code Review Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {role === "admin" && (
              <span className="bg-teal-500/20 text-teal-300 px-3 py-1 rounded-full text-sm font-bold border border-teal-500/30 animate-pulse">
                Admin
              </span>
            )}
            <button
              onClick={handleLogout}
              className="bg-red-500/20 text-red-300 px-4 py-2 rounded-lg hover:bg-red-500/40 transition-colors duration-300 border border-red-500/30"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-8">
        {/* Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
          <div className="relative w-full md:w-1/2">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
            <input
              type="text"
              placeholder="Search by PyLint / Bandit feedback..."
              className="w-full pl-12 pr-4 py-3 bg-black/20 rounded-full border-2 border-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-400 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {role === "admin" && (
            <button
              className="w-full md:w-auto px-6 py-3 bg-teal-500 text-black font-bold rounded-lg shadow-glow hover:bg-teal-400 hover:scale-105 transform transition-all duration-300"
              onClick={handleExport}
            >
              Export Reviews
            </button>
          )}
        </div>

        {/* Reviews Grid */}
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((review, index) => (
            <div
              key={index}
              className="glass p-6 rounded-2xl shadow-lg border border-gray-700/50 hover:border-teal-400 transition-all duration-300 transform hover:-translate-y-1 animate-scaleIn"
              style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'backwards' }}
            >
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-white">
                  Review #{review.id || index + 1}
                </h2>
                <p className="text-xs text-gray-400 italic">
                  🕓 {new Date(review.createdAt).toLocaleString()}
                </p>
              </div>

              <div className="space-y-2">
                <CollapsibleSection title="PyLint" color="teal">
                  {review.pylint_output || "No output."}
                </CollapsibleSection>
                <CollapsibleSection title="Bandit" color="sky">
                  {review.bandit_output || "No output."}
                </CollapsibleSection>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Main;
