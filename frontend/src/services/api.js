const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api"

export const optimizeEntropy = async (actions, rewards, minExpectedReward) => {
  const response = await fetch(`${API_BASE_URL}/optimize`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      actions,
      rewards,
      minExpectedReward,
    }),
  })

  if (!response.ok) {
    throw new Error("Optimization failed")
  }

  return response.json()
}

export const shareResult = async (result) => {
  const response = await fetch(`${API_BASE_URL}/share`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(result),
  })

  if (!response.ok) {
    throw new Error("Failed to create share link")
  }

  return response.json()
}

export const getSharedResult = async (shareId) => {
  const response = await fetch(`${API_BASE_URL}/shared/${shareId}`)

  if (!response.ok) {
    throw new Error("Shared result not found")
  }

  return response.json()
}
