import React, { useEffect, useState } from "react";
import { supabase } from './supabaseClient';
import "./App.css";

const getRandomPair = async () => {
  const { data, error } = await supabase
    .from('foot_pics')
    .select('*')
    .limit(100); // Fetch enough to shuffle

  if (error) {
    console.error('Error fetching foot pics:', error.message);
    return [];
  }
  if (!data || data.length < 2) {
    console.warn('Not enough foot pics.');
    return [];
  }

  const shuffled = data.sort(() => Math.random() - 0.5);
  console.log("Fetched pair candidates:", shuffled.slice(0, 2));
  return shuffled.slice(0, 2);
};

function App() {
  const [pair, setPair] = useState([]);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    const fetchPair = async () => {
      const newPair = await getRandomPair();
      console.log("Initial pair loaded:", newPair);
      setPair(newPair);
    };
    fetchPair();
  }, []);

  const handleVote = (chosenIndex) => {
    const [left, right] = pair;
    const chosen = pair[chosenIndex];
    const other = pair[1 - chosenIndex];

    const chosenScore = chosen.votes > 0 ? chosen.wins / chosen.votes : 0;
    const otherScore = other.votes > 0 ? other.wins / other.votes : 0;

    const isCorrect = chosenScore >= otherScore;
    setFeedback(isCorrect ? "Correct! 🎉" : "Wrong 😬");

    const updateStats = async () => {
      try {
        console.log("Updating votes for chosen id:", chosen.id);
        const { error: chosenError } = await supabase
          .from('foot_pics')
          .update({
            votes: Number(chosen.votes) + 1,
            wins: isCorrect ? Number(chosen.wins) + 1 : Number(chosen.wins),
          })
          .eq('id', chosen.id);
        if (chosenError) throw chosenError;

        console.log("Updating votes for other id:", other.id);
        const { error: otherError } = await supabase
          .from('foot_pics')
          .update({
            votes: Number(other.votes) + 1,
          })
          .eq('id', other.id);
        if (otherError) throw otherError;

        // Wait a bit to ensure DB consistency
        await new Promise(r => setTimeout(r, 300));

        // Fetch fresh data to update UI
        const newPair = await getRandomPair();
        console.log("New pair after vote update:", newPair);

        setPair(newPair);
        setFeedback(null);
      } catch (err) {
        console.error("Error updating stats:", err);
        setFeedback("Something went wrong updating stats 😞");
      }
    };

    setTimeout(updateStats, 1000);
  };

  return (
    <div style={{ textAlign: "center", marginTop: "40px" }}>
      <h2>Which foot pic is more popular?</h2>

      {pair.length === 2 && (
        <div style={{ display: "flex", justifyContent: "center", gap: "40px", marginTop: "20px" }}>
          {[0, 1].map(index => {
            const foot = pair[index];
            const ratio = foot.votes > 0 ? (foot.wins / foot.votes).toFixed(2) : "0.00";

            return (
              <div key={foot.id}>
                <img
                  src={foot.image_url}
                  alt={`Foot ${foot.id}`}
                  width="250"
                  height="250"
                  style={{ cursor: "pointer", borderRadius: "10px" }}
                  onClick={() => handleVote(index)}
                />
                <div style={{ marginTop: "10px", fontSize: "14px", color: "#666" }}>
                  Total votes: {foot.votes}<br />
                  Win ratio: {ratio}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {feedback && <h3 style={{ marginTop: "20px" }}>{feedback}</h3>}
    </div>
  );
}

export default App;
