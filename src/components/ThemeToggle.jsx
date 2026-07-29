import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle() {
  const { darkMode, toggleTheme } = useTheme();

  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      title="Toggle Theme"
    >
      {darkMode ? "☀️" : "🌙"}
    </button>
  );
}