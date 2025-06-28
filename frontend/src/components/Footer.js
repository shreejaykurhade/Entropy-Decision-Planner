"use client"

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Decision Planner</h3>
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
        </div>

        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <div className="copyright">
              <p>&copy; {currentYear} Maximum Entropy Decision Planner.</p>
            </div>
            <div className="footer-links">
              <span className="tech-stack">
                <strong>Tech Stack:</strong> React • Node.js • Express • Chart.js • Maximum Entropy Optimization
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
