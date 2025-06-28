"use client"

const ActionInput = ({ actions, setActions, minExpectedReward, setMinExpectedReward }) => {
  const addAction = () => {
    setActions([...actions, { name: `Action ${actions.length + 1}`, reward: 0 }])
  }

  const removeAction = (index) => {
    if (actions.length > 2) {
      setActions(actions.filter((_, i) => i !== index))
    }
  }

  const updateAction = (index, field, value) => {
    const newActions = [...actions]
    newActions[index][field] = field === "reward" ? Number.parseFloat(value) || 0 : value
    setActions(newActions)
  }

  return (
    <div className="action-input">
      <h3>Define Actions and Rewards</h3>

      {actions.map((action, index) => (
        <div key={index} className="action-row">
          <input
            type="text"
            placeholder="Action name"
            value={action.name}
            onChange={(e) => updateAction(index, "name", e.target.value)}
            className="action-name-input"
          />
          <input
            type="number"
            placeholder="Reward"
            value={action.reward}
            onChange={(e) => updateAction(index, "reward", e.target.value)}
            className="reward-input"
          />
          {actions.length > 2 && (
            <button onClick={() => removeAction(index)} className="remove-button">
              ×
            </button>
          )}
        </div>
      ))}

      <button onClick={addAction} className="add-action-button">
        Add Action
      </button>

      <div className="constraint-input">
        <label>
          Minimum Expected Reward:
          <input
            type="number"
            value={minExpectedReward}
            onChange={(e) => setMinExpectedReward(Number.parseFloat(e.target.value) || 0)}
            className="constraint-input-field"
          />
        </label>
      </div>

      <div className="explanation">
        <h4>How it works:</h4>
        <p>The Maximum Entropy Principle finds the probability distribution that:</p>
        <ul>
          <li>Maximizes entropy (uncertainty/randomness)</li>
          <li>Meets your minimum expected reward constraint</li>
          <li>Ensures all probabilities sum to 1</li>
        </ul>
      </div>
    </div>
  )
}

export default ActionInput
