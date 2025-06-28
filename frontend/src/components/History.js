"use client"

import { useState, useEffect } from "react"
import ResultsDisplay from "./ResultsDisplay"

const History = () => {
  const [history, setHistory] = useState([])
  const [selectedResult, setSelectedResult] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem("entropyHistory")
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory)
        // Validate and sanitize history items
        const validHistory = parsedHistory
          .filter(
            (item) =>
              item &&
              item.actions &&
              item.rewards &&
              item.probabilities &&
              Array.isArray(item.actions) &&
              Array.isArray(item.rewards) &&
              Array.isArray(item.probabilities),
          )
          .map((item) => ({
            // Ensure all required properties exist with safe defaults
            ...item,
            expectedReward: item.expectedReward !== null && item.expectedReward !== undefined ? item.expectedReward : 0,
            entropy: item.entropy !== null && item.entropy !== undefined ? item.entropy : 0,
            minExpectedReward:
              item.minExpectedReward !== null && item.minExpectedReward !== undefined ? item.minExpectedReward : 0,
            feasible: item.feasible !== false, // Default to true if undefined
            converged: item.converged !== false, // Default to true if undefined
            constraintError:
              item.constraintError !== null && item.constraintError !== undefined ? item.constraintError : 0,
          }))

        setHistory(validHistory)

        // If we filtered out invalid items, save the cleaned history
        if (validHistory.length !== parsedHistory.length) {
          localStorage.setItem("entropyHistory", JSON.stringify(validHistory))
        }
      }
    } catch (err) {
      console.error("Error loading history:", err)
      setError("Failed to load history. The data may be corrupted.")
      // Clear corrupted data
      localStorage.removeItem("entropyHistory")
    }
  }, [])

  const clearHistory = () => {
    if (window.confirm("Are you sure you want to clear all history? This cannot be undone.")) {
      try {
        localStorage.removeItem("entropyHistory")
        setHistory([])
        setSelectedResult(null)
        setError(null)
      } catch (err) {
        console.error("Error clearing history:", err)
        setError("Failed to clear history.")
      }
    }
  }

  const deleteResult = (index) => {
    if (window.confirm("Are you sure you want to delete this result?")) {
      try {
        const newHistory = history.filter((_, i) => i !== index)
        setHistory(newHistory)
        localStorage.setItem("entropyHistory", JSON.stringify(newHistory))

        if (selectedResult && history[index] === selectedResult) {
          setSelectedResult(null)
        }
        setError(null)
      } catch (err) {
        console.error("Error deleting result:", err)
        setError("Failed to delete result.")
      }
    }
  }

  const selectResult = (result) => {
    try {
      // Validate and sanitize result before selecting
      if (result && result.actions && result.rewards && result.probabilities) {
        const sanitizedResult = {
          ...result,
          expectedReward:
            result.expectedReward !== null && result.expectedReward !== undefined ? result.expectedReward : 0,
          entropy: result.entropy !== null && result.entropy !== undefined ? result.entropy : 0,
          minExpectedReward:
            result.minExpectedReward !== null && result.minExpectedReward !== undefined ? result.minExpectedReward : 0,
          feasible: result.feasible !== false,
          converged: result.converged !== false,
          constraintError:
            result.constraintError !== null && result.constraintError !== undefined ? result.constraintError : 0,
        }
        setSelectedResult(sanitizedResult)
        setError(null)
      } else {
        setError("This result appears to be corrupted and cannot be displayed.")
      }
    } catch (err) {
      console.error("Error selecting result:", err)
      setError("Failed to load selected result.")
    }
  }

  // Safe value extraction
  const safeValue = (value, defaultValue = 0) => {
    return value !== null && value !== undefined && !isNaN(value) ? Number(value) : defaultValue
  }

  return (
    <div className="history-page">
      <div className="container">
        <div className="history-header">
          <h2>Decision History</h2>
          {history.length > 0 && (
            <button onClick={clearHistory} className="clear-button">
              Clear All History
            </button>
          )}
        </div>

        {error && <div className="error-banner">{error}</div>}

        {history.length === 0 ? (
          <div className="empty-history">
            <p>No decision history yet. Start by using the planner!</p>
          </div>
        ) : (
          <div className="history-grid">
            <div className="history-list">
              <h3>Previous Decisions ({history.length})</h3>
              {history.map((result, index) => {
                // Safely access result properties
                const actionsCount = result.actions?.length || 0
                const expectedReward = safeValue(result.expectedReward)
                const timestamp = result.timestamp || result.savedAt || new Date().toISOString()
                const feasible = result.feasible !== false

                return (
                  <div
                    key={result.id || index}
                    className={`history-item ${selectedResult === result ? "selected" : ""}`}
                    onClick={() => selectResult(result)}
                  >
                    <div className="history-item-header">
                      <span className="timestamp">
                        {new Date(timestamp).toLocaleDateString()} {new Date(timestamp).toLocaleTimeString()}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteResult(index)
                        }}
                        className="delete-button"
                        title="Delete this result"
                      >
                        ×
                      </button>
                    </div>
                    <div className="history-item-summary">
                      <p>
                        {actionsCount} action{actionsCount !== 1 ? "s" : ""}
                      </p>
                      <p>Expected Reward: {expectedReward.toFixed(3)}</p>
                      {!feasible && <p className="warning">⚠️ Constraint not satisfied</p>}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="history-details">
              {selectedResult ? (
                <ResultsDisplay result={selectedResult} />
              ) : (
                <div className="select-prompt">
                  <p>Select a decision from the history to view details</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default History
