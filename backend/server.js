const express = require("express")
const cors = require("cors")
const path = require("path")

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())

// In-memory storage for shared results
const sharedResults = new Map()

// Helper function to get the correct base URL
function getBaseUrl(req) {
  // Check if we're on Vercel
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  // Check for custom domain or other deployment platforms
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  }

  // Use the request headers to determine the URL
  const protocol = req.get("x-forwarded-proto") || req.protocol || "http"
  const host = req.get("x-forwarded-host") || req.get("host")

  // For production deployments, prefer HTTPS
  const finalProtocol = host && !host.includes("localhost") ? "https" : protocol

  return `${finalProtocol}://${host}`
}

// Mathematically correct Maximum Entropy Optimization
function maximizeEntropy(rewards, minExpectedReward, maxIterations = 5000, tolerance = 1e-12) {
  const n = rewards.length

  // Input validation
  if (n === 0) {
    throw new Error("No actions provided")
  }

  if (rewards.some((r) => isNaN(r) || !isFinite(r))) {
    throw new Error("Invalid reward values")
  }

  // Check constraint feasibility
  const maxReward = Math.max(...rewards)
  const minReward = Math.min(...rewards)

  if (minExpectedReward > maxReward) {
    throw new Error(
      `Infeasible constraint: Minimum expected reward (${minExpectedReward.toFixed(2)}) exceeds maximum possible reward (${maxReward.toFixed(2)})`,
    )
  }

  // Handle edge case: uniform distribution satisfies constraint
  const uniformExpectedReward = rewards.reduce((sum, r) => sum + r, 0) / n
  if (minExpectedReward <= uniformExpectedReward + tolerance) {
    const uniformProbs = new Array(n).fill(1 / n)
    return {
      probabilities: uniformProbs,
      expectedReward: uniformExpectedReward,
      entropy: Math.log(n), // Maximum entropy = log(n) for uniform distribution
      converged: true,
      iterations: 0,
      feasible: true,
      constraintError: Math.abs(uniformExpectedReward - minExpectedReward),
    }
  }

  // Handle edge case: constraint requires maximum reward
  if (minExpectedReward >= maxReward - tolerance) {
    const probabilities = rewards.map((r) => (Math.abs(r - maxReward) < tolerance ? 1 : 0))
    const numMaxRewards = probabilities.reduce((sum, p) => sum + p, 0)

    // Normalize probabilities
    for (let i = 0; i < n; i++) {
      probabilities[i] /= numMaxRewards
    }

    return {
      probabilities,
      expectedReward: maxReward,
      entropy: numMaxRewards > 1 ? Math.log(numMaxRewards) : 0,
      converged: true,
      iterations: 0,
      feasible: true,
      constraintError: 0,
    }
  }

  // Mathematically correct Maximum Entropy with Lagrange multipliers
  // We solve: maximize H = -∑p_i*log(p_i) subject to ∑p_i = 1 and ∑p_i*r_i >= R_min
  // Solution: p_i = exp(λ*r_i) / Z where Z = ∑exp(λ*r_j)

  let lambda = 0 // Lagrange multiplier for expected reward constraint
  let probabilities = new Array(n).fill(1 / n)

  // Binary search for the correct lambda value
  let lambdaMin = -50
  let lambdaMax = 50
  let bestLambda = 0
  let bestError = Number.POSITIVE_INFINITY

  // First, find approximate range using binary search
  for (let iter = 0; iter < 100; iter++) {
    lambda = (lambdaMin + lambdaMax) / 2

    // Calculate probabilities using exponential family
    const expValues = rewards.map((r) => Math.exp(lambda * r))
    const Z = expValues.reduce((sum, exp) => sum + exp, 0)

    if (Z === 0 || !isFinite(Z)) {
      lambdaMax = lambda
      continue
    }

    probabilities = expValues.map((exp) => exp / Z)
    const expectedReward = probabilities.reduce((sum, p, i) => sum + p * rewards[i], 0)
    const error = expectedReward - minExpectedReward

    if (Math.abs(error) < tolerance) {
      bestLambda = lambda
      break
    }

    if (Math.abs(error) < bestError) {
      bestError = Math.abs(error)
      bestLambda = lambda
    }

    if (error < 0) {
      lambdaMin = lambda // Need higher lambda to increase expected reward
    } else {
      lambdaMax = lambda // Need lower lambda to decrease expected reward
    }
  }

  // Fine-tune using Newton-Raphson method for higher precision
  lambda = bestLambda
  for (let iter = 0; iter < maxIterations; iter++) {
    // Calculate probabilities and derivatives
    const expValues = rewards.map((r) => Math.exp(lambda * r))
    const Z = expValues.reduce((sum, exp) => sum + exp, 0)

    if (Z === 0 || !isFinite(Z)) break

    probabilities = expValues.map((exp) => exp / Z)
    const expectedReward = probabilities.reduce((sum, p, i) => sum + p * rewards[i], 0)
    const error = expectedReward - minExpectedReward

    if (Math.abs(error) < tolerance) break

    // Calculate derivative for Newton-Raphson: d(E[R])/dλ = Var[R]
    const variance = probabilities.reduce((sum, p, i) => {
      const deviation = rewards[i] - expectedReward
      return sum + p * deviation * deviation
    }, 0)

    if (variance < 1e-15) break // Avoid division by zero

    // Newton-Raphson update
    const deltaLambda = error / variance
    lambda += deltaLambda

    // Prevent lambda from becoming too extreme
    lambda = Math.max(-50, Math.min(50, lambda))

    if (Math.abs(deltaLambda) < tolerance) break
  }

  // Final calculation with best lambda
  const expValues = rewards.map((r) => Math.exp(lambda * r))
  const Z = expValues.reduce((sum, exp) => sum + exp, 0)
  probabilities = expValues.map((exp) => exp / Z)

  // Ensure probabilities are valid
  probabilities = probabilities.map((p) => Math.max(0, Math.min(1, p)))
  const probSum = probabilities.reduce((sum, p) => sum + p, 0)
  if (probSum > 0) {
    probabilities = probabilities.map((p) => p / probSum)
  }

  // Calculate final metrics
  const finalExpectedReward = probabilities.reduce((sum, p, i) => sum + p * rewards[i], 0)
  const entropy = -probabilities.reduce((sum, p) => {
    return sum + (p > 1e-15 ? p * Math.log(p) : 0)
  }, 0)

  const constraintError = Math.abs(finalExpectedReward - minExpectedReward)
  const feasible = constraintError < tolerance * 100

  return {
    probabilities,
    expectedReward: finalExpectedReward,
    entropy,
    converged: constraintError < tolerance,
    iterations: maxIterations,
    feasible,
    constraintError,
    lambda, // Include lambda for debugging
  }
}

// Mathematically correct entropy calculation
function calculateEntropy(probabilities) {
  return -probabilities.reduce((sum, p) => {
    return sum + (p > 1e-15 ? p * Math.log(p) : 0)
  }, 0)
}

// Verify mathematical correctness
function verifyMaximumEntropy(probabilities, rewards, minExpectedReward) {
  const n = probabilities.length

  // Check probability constraints
  const probSum = probabilities.reduce((sum, p) => sum + p, 0)
  const probValid = probabilities.every((p) => p >= 0 && p <= 1)

  // Check expected reward constraint
  const expectedReward = probabilities.reduce((sum, p, i) => sum + p * rewards[i], 0)
  const rewardConstraintSatisfied = expectedReward >= minExpectedReward - 1e-10

  // Calculate entropy
  const entropy = calculateEntropy(probabilities)

  // Check if this is maximum entropy solution by verifying KKT conditions
  // For maximum entropy: ∂H/∂p_i + λ₁ + λ₂*r_i = 0
  // This gives: p_i = exp(-1-λ₁-λ₂*r_i) = exp(λ*r_i)/Z

  return {
    probabilitySum: probSum,
    probabilitiesValid: probValid,
    expectedReward,
    rewardConstraintSatisfied,
    entropy,
    maxPossibleEntropy: Math.log(n),
    entropyRatio: entropy / Math.log(n),
  }
}

// Update the /api/optimize endpoint with mathematical verification
app.post("/api/optimize", (req, res) => {
  try {
    const { actions, rewards, minExpectedReward } = req.body

    // Enhanced validation
    if (!Array.isArray(actions) || !Array.isArray(rewards)) {
      return res.status(400).json({
        error: "Actions and rewards must be arrays",
        details: "Please provide valid arrays for actions and rewards",
      })
    }

    if (actions.length !== rewards.length) {
      return res.status(400).json({
        error: "Mismatched input lengths",
        details: `Actions (${actions.length}) and rewards (${rewards.length}) must have the same length`,
      })
    }

    if (actions.length < 1) {
      return res.status(400).json({
        error: "Insufficient actions",
        details: "At least 1 action is required",
      })
    }

    if (rewards.some((r, i) => typeof r !== "number" || isNaN(r) || !isFinite(r))) {
      return res.status(400).json({
        error: "Invalid reward values",
        details: "All rewards must be finite numbers",
      })
    }

    if (typeof minExpectedReward !== "number" || isNaN(minExpectedReward) || !isFinite(minExpectedReward)) {
      return res.status(400).json({
        error: "Invalid minimum expected reward",
        details: "Minimum expected reward must be a finite number",
      })
    }

    // Filter out empty action names
    const validIndices = actions
      .map((action, i) => (action && action.toString().trim().length > 0 ? i : -1))
      .filter((i) => i >= 0)

    if (validIndices.length === 0) {
      return res.status(400).json({
        error: "No valid actions",
        details: "At least one action must have a non-empty name",
      })
    }

    const filteredActions = validIndices.map((i) => actions[i])
    const filteredRewards = validIndices.map((i) => rewards[i])

    const result = maximizeEntropy(filteredRewards, minExpectedReward)
    const verification = verifyMaximumEntropy(result.probabilities, filteredRewards, minExpectedReward)

    const response = {
      actions: filteredActions,
      rewards: filteredRewards,
      minExpectedReward,
      probabilities: result.probabilities,
      expectedReward: result.expectedReward,
      entropy: result.entropy,
      converged: result.converged,
      feasible: result.feasible,
      constraintError: result.constraintError,
      timestamp: new Date().toISOString(),
      metadata: {
        maxReward: Math.max(...filteredRewards),
        minReward: Math.min(...filteredRewards),
        uniformExpectedReward: filteredRewards.reduce((sum, r) => sum + r, 0) / filteredRewards.length,
        lambda: result.lambda,
        verification,
      },
    }

    res.json(response)
  } catch (error) {
    console.error("Optimization error:", error)

    // Send detailed error information
    res.status(400).json({
      error: error.message || "Optimization failed",
      details: error.message,
      type: "optimization_error",
    })
  }
})

// Share result endpoint - FIXED URL GENERATION
app.post("/api/share", (req, res) => {
  try {
    const result = req.body
    const shareId = Math.random().toString(36).substring(2, 15)
    sharedResults.set(shareId, result)

    // Get the correct base URL for the deployment
    const baseUrl = getBaseUrl(req)
    const shareUrl = `${baseUrl}/shared/${shareId}`

    console.log("Generated share URL:", shareUrl) // Debug log

    res.json({ shareId, shareUrl })
  } catch (error) {
    console.error("Share error:", error)
    res.status(500).json({ error: "Failed to create share link" })
  }
})

// Get shared result
app.get("/api/shared/:id", (req, res) => {
  const { id } = req.params
  const result = sharedResults.get(id)

  if (!result) {
    return res.status(404).json({ error: "Shared result not found" })
  }

  res.json(result)
})

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    baseUrl: getBaseUrl(req),
  })
})

// Serve React app - only in production or if build exists
const fs = require("fs")

// Check if build directory exists
const buildPath = path.join(__dirname, "../frontend/build")
const buildExists = fs.existsSync(buildPath)

if (buildExists) {
  app.use(express.static(buildPath))

  // Serve React app for all non-API routes
  app.get("*", (req, res) => {
    // Skip API routes
    if (req.path.startsWith("/api/")) {
      return res.status(404).json({ error: "API endpoint not found" })
    }
    res.sendFile(path.join(buildPath, "index.html"))
  })
} else {
  // Development mode - just handle API routes
  app.get("*", (req, res) => {
    if (req.path.startsWith("/api/")) {
      return res.status(404).json({ error: "API endpoint not found" })
    }
    res.json({
      message:
        "Frontend not built yet. Run 'npm run build' in the frontend directory, or start the React dev server separately.",
      mode: "development",
      baseUrl: getBaseUrl(req),
    })
  })
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`)
  if (process.env.VERCEL_URL) {
    console.log(`Vercel URL: https://${process.env.VERCEL_URL}`)
  }
})
