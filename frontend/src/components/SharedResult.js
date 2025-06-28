"use client"

import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import ResultsDisplay from "./ResultsDisplay"
import { getSharedResult } from "../services/api"

const SharedResult = () => {
  const { id } = useParams()
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchSharedResult = async () => {
      try {
        const sharedResult = await getSharedResult(id)

        // Sanitize the shared result to prevent null reference errors
        const sanitizedResult = {
          ...sharedResult,
          expectedReward:
            sharedResult.expectedReward !== null && sharedResult.expectedReward !== undefined
              ? sharedResult.expectedReward
              : 0,
          entropy: sharedResult.entropy !== null && sharedResult.entropy !== undefined ? sharedResult.entropy : 0,
          minExpectedReward:
            sharedResult.minExpectedReward !== null && sharedResult.minExpectedReward !== undefined
              ? sharedResult.minExpectedReward
              : 0,
          feasible: sharedResult.feasible !== false,
          converged: sharedResult.converged !== false,
          constraintError:
            sharedResult.constraintError !== null && sharedResult.constraintError !== undefined
              ? sharedResult.constraintError
              : 0,
          actions: sharedResult.actions || [],
          rewards: sharedResult.rewards || [],
          probabilities: sharedResult.probabilities || [],
        }

        setResult(sanitizedResult)
      } catch (err) {
        console.error("Error fetching shared result:", err)
        setError("Shared result not found or expired")
      }
      setLoading(false)
    }

    if (id) {
      fetchSharedResult()
    } else {
      setError("Invalid share ID")
      setLoading(false)
    }
  }, [id])

  if (loading) {
    return (
      <div className="shared-result">
        <div className="container">
          <div className="loading">Loading shared result...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="shared-result">
        <div className="container">
          <div className="error">{error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="shared-result">
      <div className="container">
        <h2>Shared Decision Analysis</h2>
        <div className="shared-info">
          <p>Shared on: {new Date(result.timestamp || Date.now()).toLocaleString()}</p>
        </div>
        <ResultsDisplay result={result} />
      </div>
    </div>
  )
}

export default SharedResult
