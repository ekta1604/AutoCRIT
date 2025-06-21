// src/App.js
import React, { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [reviews, setReviews] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    axios.get("http://localhost:3001/api/analysis").then((res) => {
      setReviews(res.data);
    });
  }, []);

  const filtered = reviews.filter((item) => {
    const content = `${item.pylint_output} ${item.bandit_output}`.toLowerCase();
    return content.includes(search.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white font-sans p-8">
      <h1 className="text-4xl font-bold mb-6 text-center">🔍 AI Code Review Dashboard</h1>

      <div className="flex justify-center mb-8">
        <input
          type="text"
          placeholder="Search PyLint / Bandit output..."
          className="w-full md:w-1/2 px-4 py-2 rounded-md text-black focus:outline-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((review, index) => (
          <div
            key={index}
            className="bg-slate-800 p-6 rounded-xl shadow-md hover:shadow-lg transition duration-300"
          >
            <h2 className="text-lg font-semibold mb-2">🚀 File #{index + 1}</h2>
            <p className="text-sm text-slate-400 mb-1">🕓 {new Date(review.createdAt).toLocaleString()}</p>

            <div className="mt-2">
              <p className="text-pink-400 font-medium">PyLint:</p>
              <pre className="text-sm whitespace-pre-wrap break-words bg-slate-700 p-2 rounded-md">{review.pylint_output || "N/A"}</pre>
            </div>

            <div className="mt-4">
              <p className="text-blue-400 font-medium">Bandit:</p>
              <pre className="text-sm whitespace-pre-wrap break-words bg-slate-700 p-2 rounded-md">{review.bandit_output || "N/A"}</pre>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
