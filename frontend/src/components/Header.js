"use client"
import { Link, useLocation } from "react-router-dom"

const Header = ({ darkMode, toggleDarkMode }) => {
  const location = useLocation()

  return (
    <header className="header">
      <div className="container">
        <Link to="/" className="logo">
          <h1>Maximum Entropy Decision Planner</h1>
        </Link>
        <nav className="nav">
          <Link to="/" className={location.pathname === "/" ? "nav-link active" : "nav-link"}>
            Home
          </Link>
          <Link to="/planner" className={location.pathname === "/planner" ? "nav-link active" : "nav-link"}>
            Planner
          </Link>
          <Link to="/history" className={location.pathname === "/history" ? "nav-link active" : "nav-link"}>
            History
          </Link>
          <button onClick={toggleDarkMode} className="theme-toggle">
            {darkMode ? "☀️" : "🌙"}
          </button>
        </nav>
      </div>
    </header>
  )
}

export default Header
