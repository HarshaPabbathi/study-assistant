import { useState } from 'react';
import FlashcardMode from './FlashcardMode.jsx';
import QuizMode from './QuizMode.jsx';

export default function StudyView({ session, onBackHome, onNavigateHistory }) {
  const [mode, setMode] = useState('cards');

  return (
    <div className="fade-in">
      <div className="study-header">
        <div>
          <h2>{session.topic}</h2>
          <div className="meta">
            {session.flashcards.length} flashcards · {session.quiz.length} quiz questions
            {session.inputText && ' · Based on your notes'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="mode-tabs">
            <button
              className={`mode-tab ${mode === 'cards' ? 'active' : ''}`}
              onClick={() => setMode('cards')}
            >Flashcards</button>
            <button
              className={`mode-tab ${mode === 'quiz' ? 'active' : ''}`}
              onClick={() => setMode('quiz')}
            >Quiz</button>
          </div>
          <button className="btn btn-secondary" onClick={onBackHome}>← New set</button>
          <button className="btn btn-ghost" onClick={onNavigateHistory}>History</button>
        </div>
      </div>

      {mode === 'cards' ? (
        <FlashcardMode flashcards={session.flashcards} />
      ) : (
        <QuizMode quiz={session.quiz} onRestart={onBackHome} />
      )}
    </div>
  );
}