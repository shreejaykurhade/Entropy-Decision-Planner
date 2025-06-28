"use client"

import { useEffect, useRef } from "react"
import Chart from "chart.js/auto"

const ResultsDisplay = ({ result }) => {
  const chartRef = useRef(null)
  const chartInstance = useRef(null)

  useEffect(() => {
    if (result && chartRef.current && result.probabilities) {
      // Destroy existing chart
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }

      const ctx = chartRef.current.getContext("2d")

      // Create colors based on probabilities (darker = higher probability)
      const colors = result.probabilities.map((prob) => {
        const intensity = Math.floor(prob * 200 + 55) // Range from 55 to 255
        return `rgba(${255 - intensity}, ${255 - intensity}, ${255 - intensity}, 0.8)`
      })

      chartInstance.current = new Chart(ctx, {
        type: "bar",
        data: {
          labels: result.actions || [],
          datasets: [
            {
              label: "Probability",
              data: result.probabilities.map((p) => ((p || 0) * 100).toFixed(2)),
              backgroundColor: colors,
              borderColor: colors.map((color) => color.replace("0.8", "1")),
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: "Maximum Entropy Probability Distribution",
              font: {
                size: 16,
                weight: "bold",
              },
            },
            legend: {
              display: false,
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const prob = result.probabilities[context.dataIndex] || 0
                  const reward = (result.rewards && result.rewards[context.dataIndex]) || 0
                  const contribution = (prob * reward).toFixed(4)
                  return [
                    `Probability: ${(prob * 100).toFixed(3)}%`,
                    `Reward: ${reward}`,
                    `Contribution: ${contribution}`,
                  ]
                },
              },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              title: {
                display: true,
                text: "Probability (%)",
              },
              ticks: {
                callback: (value) => value + "%",
              },
            },
            x: {
              title: {
                display: true,
                text: "Actions",
              },
            },
          },
        },
      })
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [result])

  // Safe value extraction with defaults
  const safeValue = (value, defaultValue = 0) => {
    return value !== null && value !== undefined && !isNaN(value) ? Number(value) : defaultValue
  }

  const safeToFixed = (value, digits = 4) => {
    const safeVal = safeValue(value)
    return safeVal.toFixed(digits)
  }

  if (!result) return null

  // Safely extract values with defaults
  const expectedReward = safeValue(result.expectedReward)
  const minExpectedReward = safeValue(result.minExpectedReward)
  const entropy = safeValue(result.entropy)
  const constraintError = safeValue(result.constraintError)
  const actions = result.actions || []
  const rewards = result.rewards || []
  const probabilities = result.probabilities || []
  const feasible = result.feasible !== false
  const converged = result.converged !== false

  // Mathematical calculations
  const maxPossibleEntropy = actions.length > 0 ? Math.log(actions.length) : 0
  const entropyEfficiency = maxPossibleEntropy > 0 ? (entropy / maxPossibleEntropy) * 100 : 0
  const probabilitySum = probabilities.reduce((sum, p) => sum + safeValue(p), 0)

  return (
    <div className="results-display">
      <h3>Maximum Entropy Optimization Results</h3>

      {!feasible && (
        <div className="warning-banner">
          ⚠️ Warning: Constraint not perfectly satisfied. Error: {safeToFixed(constraintError, 8)}
        </div>
      )}

      <div className="metrics">
        <div className="metric">
          <label>Expected Reward:</label>
          <span className={expectedReward >= minExpectedReward - 1e-10 ? "success" : "warning"}>
            {safeToFixed(expectedReward, 6)}
          </span>
        </div>
        <div className="metric">
          <label>Target Reward:</label>
          <span>{safeToFixed(minExpectedReward, 6)}</span>
        </div>
        <div className="metric">
          <label>Entropy (H):</label>
          <span>{safeToFixed(entropy, 6)}</span>
        </div>
        <div className="metric">
          <label>Max Entropy:</label>
          <span>{safeToFixed(maxPossibleEntropy, 6)}</span>
        </div>
        <div className="metric">
          <label>Entropy Efficiency:</label>
          <span>{safeToFixed(entropyEfficiency, 2)}%</span>
        </div>
        <div className="metric">
          <label>Probability Sum:</label>
          <span className={Math.abs(probabilitySum - 1) < 1e-10 ? "success" : "error"}>
            {safeToFixed(probabilitySum, 8)}
          </span>
        </div>
      </div>

      <div className="mathematical-info">
        <h4>Mathematical Verification</h4>
        <div className="math-details">
          <p>
            <strong>Objective:</strong> Maximize H = -∑pᵢ log pᵢ
          </p>
          <p>
            <strong>Constraints:</strong> ∑pᵢ = 1, ∑pᵢrᵢ ≥ {safeToFixed(minExpectedReward, 3)}
          </p>
          <p>
            <strong>Solution:</strong> pᵢ = exp(λrᵢ) / Z
          </p>
          {result.metadata?.lambda !== undefined && (
            <p>
              <strong>Lagrange Multiplier (λ):</strong> {safeToFixed(result.metadata.lambda, 6)}
            </p>
          )}
        </div>
      </div>

      <div className="chart-container">
        <canvas ref={chartRef}></canvas>
      </div>

      <div className="probability-table">
        <h4>Detailed Mathematical Analysis</h4>
        <table>
          <thead>
            <tr>
              <th>Action</th>
              <th>Reward (rᵢ)</th>
              <th>Probability (pᵢ)</th>
              <th>Contribution (pᵢrᵢ)</th>
              <th>-pᵢ log pᵢ</th>
              <th>Relative Weight</th>
            </tr>
          </thead>
          <tbody>
            {actions.map((action, index) => {
              const prob = safeValue(probabilities[index])
              const reward = safeValue(rewards[index])
              const contribution = prob * reward
              const entropyContribution = prob > 1e-15 ? -prob * Math.log(prob) : 0
              const maxProb = probabilities.length > 0 ? Math.max(...probabilities.map((p) => safeValue(p))) : 0
              const relativeWeight = maxProb > 0 ? (prob / maxProb) * 100 : 0

              return (
                <tr key={index}>
                  <td>{action || `Action ${index + 1}`}</td>
                  <td>{safeToFixed(reward, 4)}</td>
                  <td>{safeToFixed(prob, 6)}</td>
                  <td>{safeToFixed(contribution, 6)}</td>
                  <td>{safeToFixed(entropyContribution, 6)}</td>
                  <td>
                    <div className="importance-bar">
                      <div className="importance-fill" style={{ width: `${safeToFixed(relativeWeight, 0)}%` }}></div>
                      <span>{safeToFixed(relativeWeight, 1)}%</span>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {result.metadata && (
        <div className="metadata">
          <h4>Mathematical Properties</h4>
          <div className="metadata-grid">
            <div>Max Reward: {safeToFixed(result.metadata.maxReward, 4)}</div>
            <div>Min Reward: {safeToFixed(result.metadata.minReward, 4)}</div>
            <div>Uniform E[R]: {safeToFixed(result.metadata.uniformExpectedReward, 4)}</div>
            <div>Constraint Error: {safeToFixed(constraintError, 8)}</div>
            {result.metadata.verification && (
              <>
                <div>Entropy Ratio: {safeToFixed(result.metadata.verification.entropyRatio * 100, 2)}%</div>
                <div>Constraint Met: {result.metadata.verification.rewardConstraintSatisfied ? "✓" : "✗"}</div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="mathematical-explanation">
        <h4>Understanding Maximum Entropy</h4>
        <p>
          This solution maximizes uncertainty (entropy) while satisfying your reward constraint. Higher entropy means
          the strategy is more robust and makes fewer assumptions about unknown factors.
        </p>
        <ul>
          <li>
            <strong>Entropy = {safeToFixed(entropy, 4)}</strong> - Measure of uncertainty/randomness
          </li>
          <li>
            <strong>Efficiency = {safeToFixed(entropyEfficiency, 1)}%</strong> - How close to maximum possible entropy
          </li>
          <li>
            <strong>Expected Reward = {safeToFixed(expectedReward, 4)}</strong> - Weighted average outcome
          </li>
        </ul>
      </div>
    </div>
  )
}

export default ResultsDisplay
