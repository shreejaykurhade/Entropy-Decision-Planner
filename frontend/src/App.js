"use client"

import { useState, useEffect } from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Header from "./components/Header"
import LandingPage from "./components/LandingPage"
import PlannerApp from "./components/PlannerApp"
import SharedResult from "./components/SharedResult"
import History from "./components/History"
import Footer from "./components/Footer"
import "./App.css"

function App() {
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem("darkMode")
    if (savedTheme) {
      setDarkMode(JSON.parse(savedTheme))
    }
  }, [])

  const toggleDarkMode = () => {
    const newMode = !darkMode
    setDarkMode(newMode)
    localStorage.setItem("darkMode", JSON.stringify(newMode))
  }

  return (
    <Router>
      <div className={`App ${darkMode ? "dark" : "light"}`}>
        <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/planner" element={<PlannerApp />} />
          <Route path="/history" element={<History />} />
          <Route path="/shared/:id" element={<SharedResult />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  )
}

export default App
