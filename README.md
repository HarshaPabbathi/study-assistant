# 📚 StudyBuddy

StudyBuddy is an AI-powered study assistant built with **React**, **Vite**, and **Supabase**. It helps students convert a topic or their own notes into interactive flashcards and quizzes using an AI model.

The application requests **structured JSON** from the AI and renders it as interactive flashcards and quizzes instead of displaying raw AI responses.

---

# Features

- Generate flashcards from a topic or notes
- Generate multiple-choice quizzes
- Interactive flashcards with flip animation
- Keyboard navigation for flashcards
- Mark difficult flashcards
- Review difficult flashcards
- Interactive quiz with instant feedback
- Quiz score and performance summary
- Review incorrect answers
- Save study sessions
- View previous study history
- Dark mode
- Loading, error, and empty states
- Responsive user interface

---

# Tech Stack

## Frontend

- React
- Vite
- JavaScript
- CSS

## Backend

- Supabase
- Supabase Edge Functions

## AI

- AI model integrated through a Supabase Edge Function

---

# Project Structure

```
study-assistant/
│
├── src/
│   ├── components/
│   │   ├── AuthView.jsx
│   │   ├── FlashcardMode.jsx
│   │   ├── HistoryView.jsx
│   │   ├── HomeView.jsx
│   │   ├── QuizMode.jsx
│   │   ├── StudyView.jsx
│   │   └── ThemeToggle.jsx
│   │
│   ├── context/
│   │   └── ThemeContext.jsx
│   │
│   ├── lib/
│   │   ├── auth.jsx
│   │   └── supabase.js
│   │
│   ├── App.jsx
│   ├── main.jsx
│   └── styles.css
│
├── package.json
└── README.md
```

---

# Installation

## Clone the repository

```bash
git clone https://github.com/your-username/study-assistant.git
```

## Go to the project folder

```bash
cd study-assistant
```

## Install dependencies

```bash
npm install
```

## Configure Environment Variables

Create a `.env` file in the project root and add your Supabase configuration.

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

# Running the Application

### Development Mode

```bash
npm run dev
```

### Using npm start

If you add the following script to `package.json`:

```json
"start": "vite"
```

then you can also run:

```bash
npm start
```

The application will be available at

```
http://localhost:5173
```

---

# How It Works

1. User enters a study topic or pastes notes.
2. The request is sent to a Supabase Edge Function.
3. The AI generates structured JSON containing:
   - Flashcards
   - Quiz questions
4. The application validates the AI response.
5. Flashcards and quiz are displayed as interactive components.
6. Study sessions are stored in Supabase.
7. Users can revisit previous study sessions from History.

---

# AI Usage

AI tools were used during development to:

- Understand React concepts
- Improve component structure
- Refactor existing code
- Improve UI design
- Add error handling
- Improve accessibility
- Implement Dark Mode
- Improve Flashcard and Quiz interactions

All generated code was reviewed, modified, tested, and integrated into the final application.

---

# Handling AI Failures

The application includes safeguards for unreliable AI responses.

- Validates AI response before rendering
- Handles malformed or invalid responses
- Handles empty AI output
- Displays loading indicators
- Displays meaningful error messages
- Prevents stale API responses from replacing newer results
- Allows users to retry failed requests

---

# Known Limitations

- AI output quality depends on the selected AI model.
- Internet connection is required.
- Very large notes may increase response time.
- Streaming AI responses are not implemented.
- AI-generated content may occasionally require manual verification.

---

# Time Spent

Approximately **8 hours**

### Time Breakdown

| Task | Time |
|------|------|
| Project Setup | 1 hour |
| AI Integration | 2 hours |
| Flashcards | 1 hour |
| Quiz Module | 1.5 hours |
| Session History | 1 hour |
| UI Improvements | 1 hour |
| Testing & Debugging | 0.5 hour |

---

# Future Improvements

- Streaming AI responses
- Editable flashcards
- Export study sets as PDF
- Voice-based quiz
- Spaced repetition
- AI follow-up editing instead of full regeneration

---
