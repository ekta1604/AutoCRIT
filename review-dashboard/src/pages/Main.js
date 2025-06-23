import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white font-sans p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold">🔍 AI Code Review Dashboard</h1>

        <div className="flex items-center gap-4">
          {role === "admin" && (
            <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
              Admin Access
            </span>
          )}
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="flex justify-center mb-8">
        <input
          type="text"
          placeholder="Search PyLint / Bandit output..."
          className="w-full md:w-1/2 px-4 py-2 rounded-md text-black focus:outline-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {role === "admin" && (
        <div className="flex justify-end mb-6">
          <button
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            onClick={handleExport}
          >
            Export Reviews
          </button>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((review, index) => (
          <div
            key={index}
            className="bg-slate-800 p-6 rounded-xl shadow-md hover:shadow-lg transition duration-300"
          >
            <h2 className="text-lg font-semibold mb-2">🚀 File #{index + 1}</h2>
            <p className="text-sm text-slate-400 mb-1">
              🕓 {new Date(review.createdAt).toLocaleString()}
            </p>

            <div className="mt-2">
              <p className="text-pink-400 font-medium">PyLint:</p>
              <pre className="text-sm whitespace-pre-wrap break-words bg-slate-700 p-2 rounded-md">
                {review.pylint_output || "N/A"}
              </pre>
            </div>

            <div className="mt-4">
              <p className="text-blue-400 font-medium">Bandit:</p>
              <pre className="text-sm whitespace-pre-wrap break-words bg-slate-700 p-2 rounded-md">
                {review.bandit_output || "N/A"}
              </pre>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Main;
