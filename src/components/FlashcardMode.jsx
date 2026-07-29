import { useState, useEffect } from "react";

export default function FlashcardMode({ flashcards }) {
  const [cards, setCards] = useState(flashcards);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [difficultCards, setDifficultCards] = useState([]);
  const [reviewMode, setReviewMode] = useState(false);

  useEffect(() => {
    setCards(flashcards);
  }, [flashcards]);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "ArrowRight") nextCard();
      if (e.key === "ArrowLeft") previousCard();
      if (e.key === " ") {
        e.preventDefault();
        setFlipped((prev) => !prev);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  if (!cards || cards.length === 0) {
    return (
      <div className="empty-state">
        <p>No flashcards available.</p>
      </div>
    );
  }

  const currentCard = cards[index];

  function nextCard() {
    if (index < cards.length - 1) {
      setIndex(index + 1);
      setFlipped(false);
    }
  }

  function previousCard() {
    if (index > 0) {
      setIndex(index - 1);
      setFlipped(false);
    }
  }

  function shuffleCards() {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setIndex(0);
    setFlipped(false);
  }

  function toggleDifficult() {
    const exists = difficultCards.includes(currentCard);

    if (exists) {
      setDifficultCards(
        difficultCards.filter((card) => card !== currentCard)
      );
    } else {
      setDifficultCards([...difficultCards, currentCard]);
    }
  }

  function reviewDifficult() {
    if (difficultCards.length === 0) return;

    setCards(difficultCards);
    setIndex(0);
    setFlipped(false);
    setReviewMode(true);
  }

  function showAllCards() {
    setCards(flashcards);
    setIndex(0);
    setFlipped(false);
    setReviewMode(false);
  }

  const progress = ((index + 1) / cards.length) * 100;

  return (
    <div className="flashcard-container fade-in">

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 20,
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <button className="btn btn-secondary" onClick={shuffleCards}>
          🔀 Shuffle
        </button>

        <button className="btn btn-secondary" onClick={toggleDifficult}>
          ⭐ Mark Difficult
        </button>

        {!reviewMode ? (
          <button
            className="btn btn-secondary"
            onClick={reviewDifficult}
            disabled={difficultCards.length === 0}
          >
            📚 Review Difficult ({difficultCards.length})
          </button>
        ) : (
          <button
            className="btn btn-secondary"
            onClick={showAllCards}
          >
            Show All Cards
          </button>
        )}
      </div>

      <div className="counter">
        Card {index + 1} of {cards.length}
      </div>

      <progress
        value={progress}
        max="100"
        style={{
          width: "100%",
          height: 10,
          margin: "15px 0",
        }}
      />

      <div
        className={`flashcard ${flipped ? "flipped" : ""}`}
        onClick={() => setFlipped(!flipped)}
      >
        <div className="flashcard-inner">

          <div className="flashcard-face flashcard-front">
            <div className="flashcard-label">
              Question
            </div>

            <div className="flashcard-text">
              {currentCard.front}
            </div>

            <div className="flashcard-hint">
              Click to reveal answer
            </div>
          </div>

          <div className="flashcard-face flashcard-back">
            <div className="flashcard-label">
              Answer
            </div>

            <div className="flashcard-text">
              {currentCard.back}
            </div>

            <div className="flashcard-hint">
              Click to flip back
            </div>
          </div>

        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 15,
          marginTop: 20,
          flexWrap: "wrap",
        }}
      >
        <button
          className="btn btn-secondary"
          onClick={previousCard}
          disabled={index === 0}
        >
          ← Previous
        </button>

        <button
          className="btn btn-primary"
          onClick={() => setFlipped(!flipped)}
        >
          {flipped ? "Hide Answer" : "Show Answer"}
        </button>

        <button
          className="btn btn-secondary"
          onClick={nextCard}
          disabled={index === cards.length - 1}
        >
          Next →
        </button>
      </div>
    </div>
  );
}