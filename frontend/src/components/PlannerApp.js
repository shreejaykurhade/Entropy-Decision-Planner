"use client"

import { useState } from "react"
import ActionInput from "./ActionInput"
import ResultsDisplay from "./ResultsDisplay"
import { optimizeEntropy, shareResult } from "../services/api"

const PlannerApp = () => {
  const [actions, setActions] = useState([
    { name: "Action 1", reward: 10 },
    { name: "Action 2", reward: 15 },
  ])
  const [minExpectedReward, setMinExpectedReward] = useState(12)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [shareUrl, setShareUrl] = useState("")

  const handleOptimize = async () => {
    setLoading(true)
    try {
      // Validate inputs before sending
      const validActions = actions.filter((a) => a.name.trim().length > 0 && !isNaN(a.reward) && isFinite(a.reward))

      if (validActions.length < 1) {
        alert("Please add at least one valid action with a name and numeric reward.")
        setLoading(false)
        return
      }

      if (isNaN(minExpectedReward) || !isFinite(minExpectedReward)) {
        alert("Please enter a valid minimum expected reward.")
        setLoading(false)
        return
      }

      const actionNames = validActions.map((a) => a.name.trim())
      const rewards = validActions.map((a) => Number(a.reward))

      // Check for duplicate action names
      const uniqueNames = new Set(actionNames)
      if (uniqueNames.size !== actionNames.length) {
        alert("Action names must be unique. Please check for duplicates.")
        setLoading(false)
        return
      }

      const optimizationResult = await optimizeEntropy(actionNames, rewards, minExpectedReward)
      setResult(optimizationResult)

      // Save to local storage with error handling
      try {
        const history = JSON.parse(localStorage.getItem("entropyHistory") || "[]")
        const historyItem = {
          ...optimizationResult,
          id: Date.now(),
          savedAt: new Date().toISOString(),
        }
        history.unshift(historyItem)

        // Keep last 50 items and ensure we don't exceed localStorage limits
        const trimmedHistory = history.slice(0, 50)
        localStorage.setItem("entropyHistory", JSON.stringify(trimmedHistory))
      } catch (storageError) {
        console.warn("Failed to save to history:", storageError)
        // Continue without saving to history
      }
    } catch (error) {
      console.error("Optimization failed:", error)

      // Show user-friendly error message
      let errorMessage = "Optimization failed. "
      if (error.message) {
        errorMessage += error.message
      } else {
        errorMessage += "Please check your inputs and try again."
      }

      alert(errorMessage)
    }
    setLoading(false)
  }

  const handleShare = async () => {
    if (!result) return

    try {
      const shareResponse = await shareResult(result)
      setShareUrl(shareResponse.shareUrl)

      // Copy to clipboard
      navigator.clipboard.writeText(shareResponse.shareUrl)
      alert("Share link copied to clipboard!")
    } catch (error) {
      console.error("Failed to create share link:", error)
      alert("Failed to create share link.")
    }
  }

  return (
    <div className="planner-app">
      <div className="container">
        <h2>Decision Planner</h2>

        <div className="planner-grid">
          <div className="input-section">
            <ActionInput
              actions={actions}
              setActions={setActions}
              minExpectedReward={minExpectedReward}
              setMinExpectedReward={setMinExpectedReward}
            />

            <button onClick={handleOptimize} disabled={loading || actions.length < 2} className="optimize-button">
              {loading ? "Optimizing..." : "Optimize Decision"}
            </button>
          </div>

          <div className="results-section">
            {result && (
              <>
                <ResultsDisplay result={result} />
                <button onClick={handleShare} className="share-button">
                  Share Result
                </button>
                {shareUrl && (
                  <div className="share-url">
                    <p>
                      Share URL:{" "}
                      <a href={shareUrl} target="_blank" rel="noopener noreferrer">
                        {shareUrl}
                      </a>
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PlannerApp
