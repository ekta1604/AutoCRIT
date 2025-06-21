import React, { useEffect, useState } from "react";
import axios from "axios";

const ReviewList = () => {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:3001/api/analysis")
      .then(res => setReviews(res.data))
      .catch(err => console.error("❌ Failed to fetch data", err));
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">🔍 Code Review Dashboard</h1>
      {reviews.length === 0 ? (
        <p>No reviews yet</p>
      ) : (
        <ul className="space-y-4">
          {reviews.map((review, i) => (
            <li key={i} className="border p-4 rounded shadow">
              <h2 className="font-semibold">File #{i + 1}</h2>
              <p><strong>PyLint:</strong></p>
              <pre>{review.pylint_output}</pre>
              <p><strong>Bandit:</strong></p>
              <pre>{review.bandit_output}</pre>
              <p className="text-sm text-gray-500">{new Date(review.createdAt).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ReviewList;
