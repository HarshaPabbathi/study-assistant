import { useState, useEffect } from "react";

export default function QuizMode({ quiz, onRestart }) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [finished, setFinished] = useState(false);
  const [time, setTime] = useState(0);
  const [reviewWrong, setReviewWrong] = useState(false);

  useEffect(() => {
    if (finished) return;

    const timer = setInterval(() => {
      setTime((t) => t + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [finished]);

  useEffect(() => {
    function handleKey(e) {
      if (finished) return;

      if (["1", "2", "3", "4"].includes(e.key)) {
        const option = Number(e.key) - 1;
        if (option < quiz[current].options.length && selected === null) {
          setSelected(option);
        }
      }

      if (e.key === "Enter" && selected !== null) {
        nextQuestion();
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [selected, current, finished]);

  if (!quiz || quiz.length === 0) {
    return (
      <div className="empty-state">
        <p>No quiz questions available.</p>
      </div>
    );
  }

  const q = quiz[current];
  const answered = selected !== null;

  function nextQuestion() {
    const updatedAnswers = [
      ...answers,
      {
        questionIndex: current,
        selected,
      },
    ];

    setAnswers(updatedAnswers);
    setSelected(null);

    if (current + 1 < quiz.length) {
      setCurrent(current + 1);
    } else {
      setFinished(true);
    }
  }

  if (finished) {
    const correct = answers.filter(
      (a) => quiz[a.questionIndex].answerIndex === a.selected
    );

    const wrong = answers.filter(
      (a) => quiz[a.questionIndex].answerIndex !== a.selected
    );

    const score = Math.round((correct.length / quiz.length) * 100);

    let performance = "";

    if (score >= 90)
      performance = "🏆 Outstanding!";
    else if (score >= 75)
      performance = "🎉 Excellent!";
    else if (score >= 60)
      performance = "👍 Good Job!";
    else
      performance = "📚 Keep Practicing!";

    return (
      <div className="card results-card fade-in">

        <h2>{performance}</h2>

        <div className="score-circle">
          <div className="score-inner">
            <h1>{score}%</h1>
            <p>
              {correct.length} / {quiz.length}
            </p>
          </div>
        </div>

        <p>
          Time Taken: <strong>{time} sec</strong>
        </p>

        <p>
          Correct Answers: {correct.length}
        </p>

        <p>
          Wrong Answers: {wrong.length}
        </p>

        {wrong.length > 0 && (
          <details style={{ marginTop: 20 }}>
            <summary>
              Review Incorrect Answers
            </summary>

            {wrong.map((item) => (
              <div
                key={item.questionIndex}
                style={{
                  marginTop: 15,
                  padding: 15,
                  border: "1px solid #ddd",
                  borderRadius: 8,
                }}
              >
                <strong>
                  {quiz[item.questionIndex].question}
                </strong>

                <p>
                  Your Answer:
                  {" "}
                  {
                    quiz[item.questionIndex].options[
                      item.selected
                    ]
                  }
                </p>

                <p>
                  Correct Answer:
                  {" "}
                  {
                    quiz[item.questionIndex].options[
                      quiz[item.questionIndex].answerIndex
                    ]
                  }
                </p>

                <p>
                  {quiz[item.questionIndex].explanation}
                </p>
              </div>
            ))}
          </details>
        )}

        <div
          style={{
            display: "flex",
            gap: 15,
            justifyContent: "center",
            marginTop: 25,
          }}
        >
          <button
            className="btn btn-secondary"
            onClick={() => {
              setFinished(false);
              setCurrent(0);
              setSelected(null);
              setAnswers([]);
              setTime(0);
            }}
          >
            Retake Quiz
          </button>

          {onRestart && (
            <button
              className="btn btn-primary"
              onClick={onRestart}
            >
              New Study Set
            </button>
          )}
        </div>

      </div>
    );
  }

  return (
    <div className="quiz-card card fade-in">

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 15,
        }}
      >
        <strong>
          Question {current + 1} / {quiz.length}
        </strong>

        <strong>
          ⏱ {time}s
        </strong>
      </div>

      <progress
        value={current + 1}
        max={quiz.length}
        style={{
          width: "100%",
          marginBottom: 20,
        }}
      />

      <h3>{q.question}</h3>

      <div className="quiz-options">

        {q.options.map((option, i) => {

          const correct = i === q.answerIndex;
          const chosen = selected === i;

          let cls = "quiz-option";

          if (answered) {
            if (correct)
              cls += " correct";
            else if (chosen)
              cls += " incorrect";
          }

          return (
            <button
              key={i}
              className={cls}
              disabled={answered}
              onClick={() => setSelected(i)}
            >
              {String.fromCharCode(65 + i)}. {option}
            </button>
          );

        })}

      </div>

      {answered && (
        <div
          className={`quiz-feedback ${
            selected === q.answerIndex
              ? "correct"
              : "incorrect"
          }`}
        >
          <strong>
            {selected === q.answerIndex
              ? "Correct!"
              : "Incorrect"}
          </strong>

          <p>{q.explanation}</p>
        </div>
      )}

      <div style={{ marginTop: 25 }}>

        <button
          className="btn btn-primary"
          disabled={!answered}
          onClick={nextQuestion}
        >
          {current + 1 === quiz.length
            ? "Finish Quiz"
            : "Next Question"}
        </button>

      </div>

    </div>
  );
}