"use client"

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Maximum Entropy Decision Planner</h3>
            <p>
              Make optimal decisions using the Maximum Entropy Principle. Our algorithm helps you find the best
              probability distribution over your available actions while meeting your constraints.
            </p>
          </div>

          <div className="footer-section">
            <h4>Features</h4>
            <ul>
              <li>Entropy Optimization</li>
              <li>Visual Analytics</li>
              <li>Decision History</li>
              <li>Share Results</li>
              <li>Responsive Design</li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>How It Works</h4>
            <ul>
              <li>Define Actions & Rewards</li>
              <li>Set Constraints</li>
              <li>Maximize Entropy</li>
              <li>Get Optimal Strategy</li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Mathematical Foundation</h4>
            <p>
              Based on the Maximum Entropy Principle from information theory, our algorithm finds the probability
              distribution that maximizes uncertainty while satisfying your reward constraints.
            </p>
            <div className="formula">
              <strong>Maximize:</strong> H = -∑pᵢ log pᵢ
              <br />
              <strong>Subject to:</strong> ∑pᵢ = 1, ∑pᵢrᵢ ≥ R_min
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <div className="copyright">
              <p>&copy; {currentYear} Maximum Entropy Decision Planner. Built with JavaScript, React & Express.</p>
            </div>
            <div className="footer-links">
              <span className="tech-stack">
                <strong>Tech Stack:</strong> React • Node.js • Express • Chart.js • Maximum Entropy Optimization
              </span>
            </div>
          </div>
          <div className="footer-note">
            <p>
              <strong>Free & Open Source</strong> - No API keys required. All calculations performed locally using
              advanced numerical optimization algorithms.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
