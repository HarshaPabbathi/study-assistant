import { useState } from "react";
import { AuthProvider, useAuth } from "./lib/auth.jsx";
import ThemeToggle from "./components/ThemeToggle.jsx";

import AuthView from "./components/AuthView.jsx";
import HomeView from "./components/HomeView.jsx";
import StudyView from "./components/StudyView.jsx";
import HistoryView from "./components/HistoryView.jsx";

import { getSession } from "./lib/supabase.js";

function AppInner() {
  const { user, loading: authLoading, signOut } = useAuth();

  const [view, setView] = useState("home");
  const [session, setSession] = useState(null);
  const [loadingSession, setLoadingSession] = useState(false);
  const [loadError, setLoadError] = useState("");

  function goHome() {
    setSession(null);
    setView("home");
  }

  async function openSession(id) {
    setLoadingSession(true);
    setLoadError("");

    try {
      const data = await getSession(id);

      if (!data) {
        setLoadError("That study set could not be found.");
        setView("history");
      } else {
        setSession({
          id: data.id,
          topic: data.topic,
          inputText: data.input_text,
          flashcards: data.flashcards ?? [],
          quiz: data.quiz ?? [],
          created_at: data.created_at,
        });

        setView("study");
      }
    } catch (err) {
      setLoadError(err.message || "Failed to load study set.");
      setView("history");
    } finally {
      setLoadingSession(false);
    }
  }

  if (authLoading) {
    return (
      <div className="app">
        <main className="main">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="app">
        <main className="main">
          <AuthView />
        </main>
      </div>
    );
  }

  return (
    <div className="app">

      <header className="header">

        <div className="header-inner">

          <div
            className="brand"
            onClick={goHome}
            style={{ cursor: "pointer" }}
          >

            <div className="brand-name">
              Study<span>Buddy</span>
            </div>
          </div>

          <nav
            className="header-nav"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >

            <ThemeToggle />

            <button
              className={`nav-btn ${
                view === "home" ? "active" : ""
              }`}
              onClick={goHome}
            >
              Create
            </button>

            <button
              className={`nav-btn ${
                view === "history" ? "active" : ""
              }`}
              onClick={() => setView("history")}
            >
              History
            </button>

            <button
              className="nav-btn"
              onClick={signOut}
              title={user.email}
            >
              Sign Out
            </button>

          </nav>

        </div>

      </header>

      <main className="main">

        {loadError && (
          <div className="error-banner">
            <span>⚠️</span> {loadError}
          </div>
        )}

        {loadingSession ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading study set...</p>
          </div>
        ) : (
          <>
            {view === "home" && (
              <HomeView
                onStudy={(studySession) => {
                  setSession(studySession);
                  setView("study");
                }}
                onNavigateHistory={() => setView("history")}
              />
            )}

            {view === "study" && session && (
              <StudyView
                session={session}
                onBackHome={goHome}
                onNavigateHistory={() => setView("history")}
              />
            )}

            {view === "history" && (
              <HistoryView
                onOpen={openSession}
                onBackHome={goHome}
              />
            )}
          </>
        )}

      </main>

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}