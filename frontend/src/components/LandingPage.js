import { Link } from "react-router-dom"

const LandingPage = () => {
  return (
    <div className="landing-page">
      <div className="container">
        <section className="hero">
          <h1>Decision Planner</h1>
          <p className="hero-subtitle">Make optimal decisions using the Maximum Entropy Principle</p>
          <p className="hero-description">
            Input your actions and rewards, set constraints, and let our algorithm compute the optimal probability
            distribution that maximizes entropy while meeting your expected reward requirements.
          </p>
          <Link to="/planner" className="cta-button">
            Start Planning
          </Link>
        </section>

        <section className="features">
          <div className="feature-grid">
            <div className="feature-card">
              <h3>🎯 Optimal Decision Making</h3>
              <p>
                Uses Maximum Entropy Principle to find the best probability distribution over your available actions.
              </p>
            </div>
            <div className="feature-card">
              <h3>📊 Visual Analytics</h3>
              <p>
                Interactive charts and visualizations to understand your decision probabilities and expected outcomes.
              </p>
            </div>
            <div className="feature-card">
              <h3>🔗 Share Results</h3>
              <p>Generate shareable links to discuss your decision analysis with colleagues and stakeholders.</p>
            </div>
            <div className="feature-card">
              <h3>📝 Decision History</h3>
              <p>
                Keep track of all your previous analyses with local storage and easy access to historical decisions.
              </p>
            </div>
          </div>
        </section>

        <section className="how-it-works">
          <h2>How It Works</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Define Actions</h3>
              <p>List all possible actions you can take</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>Set Rewards</h3>
              <p>Assign reward values to each action</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Add Constraints</h3>
              <p>Specify minimum expected reward threshold</p>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <h3>Optimize</h3>
              <p>Get optimal probability distribution</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default LandingPage
