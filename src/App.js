import { supabase } from './supabaseClient';
import React, { useEffect, useState } from "react";
import "./App.css";

const getRandomPair = async () => {
  const { data, error } = await supabase
    .from('foot_pics')
    .select('*');

  if (error) {
    console.error('Error fetching foot pics:', error.message);
    return [];
  }

  if (!data || data.length < 2) {
    console.warn('Not enough foot pics to create a pair.');
    return [];
  }

  // Shuffle and pick two
  const shuffled = [...data].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 2);
};

function App() {
  const [pair, setPair] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [showStats, setShowStats] = useState(false); // controls visibility of stats

  useEffect(() => {
    const fetchPair = async () => {
      const newPair = await getRandomPair();
      setPair(newPair);
      setShowStats(false);
      setFeedback(null);
    };

    fetchPair();
  }, []);

  const handleVote = (chosenIndex) => {
    if (showStats) return; // disable voting if stats are showing

    const [left, right] = pair;
    const chosen = pair[chosenIndex];
    const other = pair[1 - chosenIndex];

    const chosenScore = chosen.votes > 0 ? chosen.wins / chosen.votes : 0;
    const otherScore = other.votes > 0 ? other.wins / other.votes : 0;

    const isCorrect = chosenScore >= otherScore;
    setFeedback(isCorrect ? "Correct! 🎉" : "Wrong 😬");
    setShowStats(true);

    const updateStats = async () => {
      await supabase
        .from('foot_pics')
        .update({
          votes: chosen.votes + 1,
          wins: isCorrect ? chosen.wins + 1 : chosen.wins,
        })
        .eq('id', chosen.id);

      await supabase
        .from('foot_pics')
        .update({
          votes: other.votes + 1,
        })
        .eq('id', other.id);

      // Refresh the pair data to get updated votes/wins
      const refreshedPair = await getRandomPair();
      setPair(refreshedPair);
    };

    // Update stats in background, keep stats visible
    updateStats();
  };

  const handleNext = async () => {
    const newPair = await getRandomPair();
    setPair(newPair);
    setShowStats(false);
    setFeedback(null);
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '40px' }}>
      <h1>FEETDLE!</h1>

      {pair.length === 2 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "40px",
            marginTop: "20px",
          }}
        >
          {[0, 1].map((i) => (
            <div key={pair[i].id} style={{ textAlign: 'center' }}>
              <img
                src={pair[i].image_url}
                alt={`Foot ${pair[i].id}`}
                width="200"
                height="200"
                style={{ cursor: showStats ? "default" : "pointer" }}
                onClick={() => !showStats && handleVote(i)}
              />
              {showStats && (
                <div style={{ marginTop: "10px", fontSize: "14px" }}>
                  <p>Total votes: <b>{pair[i].votes}</b></p>
                  <p>
                    Win ratio:{" "}
                    <b>{pair[i].votes > 0 ? (pair[i].wins / pair[i].votes).toFixed(2) : "0"}</b>
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {feedback && <p style={{ marginTop: "20px", fontSize: "18px" }}>{feedback}</p>}

      {showStats && (
        <button
          onClick={handleNext}
          style={{
            marginTop: "30px",
            padding: "10px 20px",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          Next
        </button>
      )}
    </div>
  );
}

export default App;
