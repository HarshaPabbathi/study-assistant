import { useState, useRef } from "react";
import { generateStudySet, saveSession } from "../lib/supabase.js";

export default function HomeView({ onStudy, onNavigateHistory }) {
  const [topic, setTopic] = useState("");
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Used to ignore stale responses
  const requestIdRef = useRef(0);

  async function handleSubmit(e) {
    e.preventDefault();

    const trimmedTopic = topic.trim();
    const trimmedNotes = inputText.trim();

    // Reset previous error
    setError("");

    // Validation
    if (!trimmedTopic) {
      setError("Please enter a topic.");
      return;
    }

    if (trimmedNotes && trimmedNotes.length < 20) {
      setError(
        "Please enter at least 20 characters of notes or leave the notes field empty."
      );
      return;
    }

    setLoading(true);

    // Create a unique request id
    const currentRequest = ++requestIdRef.current;

    try {
      const data = await generateStudySet(trimmedTopic, trimmedNotes);

      // Ignore old response
      if (currentRequest !== requestIdRef.current) return;

      // Validate AI response
      if (
        !data ||
        !Array.isArray(data.flashcards) ||
        !Array.isArray(data.quiz)
      ) {
        throw new Error(
          "The AI returned an unexpected response. Please try again."
        );
      }

      if (data.flashcards.length === 0 || data.quiz.length === 0) {
        throw new Error(
          "The generated study set is empty. Please try again."
        );
      }

      const saved = await saveSession({
        topic: trimmedTopic,
        inputText: trimmedNotes,
        flashcards: data.flashcards,
        quiz: data.quiz,
      });

      if (currentRequest !== requestIdRef.current) return;

      onStudy({
        id: saved.id,
        topic: trimmedTopic,
        inputText: trimmedNotes,
        flashcards: data.flashcards,
        quiz: data.quiz,
        created_at: saved.created_at,
      });

    } catch (err) {
      if (currentRequest !== requestIdRef.current) return;

      setError(
        err.message ||
          "Unable to generate the study set. Please try again."
      );
    } finally {
      if (currentRequest === requestIdRef.current) {
        setLoading(false);
      }
    }
  }

  return (
    <>
      <div className="hero fade-in">
        <h1>
          Turn any topic into{" "}
          <span className="gradient">flashcards & quizzes</span> in seconds
        </h1>

        <p>
          StudyBuddy uses AI to generate study material from any topic or your
          own notes. Flip cards, test yourself, and track what you know.
        </p>
      </div>

      {error && (
        <div
          className="error-banner"
          style={{ maxWidth: 650, margin: "0 auto 20px" }}
        >
          <span>⚠️</span>

          <div style={{ flex: 1 }}>
            <strong>Error</strong>
            <div>{error}</div>
          </div>

          <button
            className="btn btn-secondary"
            onClick={() => setError("")}
          >
            Dismiss
          </button>
        </div>
      )}

      {loading ? (
        <div className="loading-state fade-in">
          <div className="spinner"></div>

          <h3 style={{ marginTop: 20 }}>
            Generating your study set...
          </h3>

          <p>Please wait while AI prepares your study material.</p>

          <div
            style={{
              marginTop: 25,
              textAlign: "left",
              maxWidth: 350,
              marginInline: "auto",
              lineHeight: 2,
            }}
          >
            <div>📖 Reading your topic...</div>
            <div>🧠 Creating flashcards...</div>
            <div>❓ Preparing quiz questions...</div>
            <div>✅ Validating AI response...</div>
          </div>
        </div>
      ) : (
        <form className="card form-card fade-in" onSubmit={handleSubmit}>
          <h2>Create a Study Set</h2>

          <p className="subtitle">
            Enter a topic and optionally paste your notes.
          </p>

          <div className="field">
            <label htmlFor="topic">Topic</label>

            <input
              id="topic"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Operating Systems"
              autoFocus
            />

            <div className="hint">
              Enter the subject you want to study.
            </div>
          </div>

          <div className="field">
            <label htmlFor="notes">
              Your Notes (Optional)
            </label>

            <textarea
              id="notes"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste class notes, textbook content, or any study material..."
            />

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span className="hint">
                Leave blank to let AI generate content.
              </span>

              <span className="hint">
                {inputText.length} / 5000
              </span>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate Study Set"}
          </button>
        </form>
      )}
    </>
  );
}