# Maximum Entropy Decision Planner

A web application that helps users make optimal decisions using the Maximum Entropy Principle. Built with JavaScript, Node.js, Express, and React.

## Features

- **Maximum Entropy Optimization**: Computes optimal probability distributions over actions
- **Interactive Landing Page**: Clean, responsive design with feature explanations
- **Visual Analytics**: Charts and graphs using Chart.js
- **Share Results**: Generate shareable links for decision analyses
- **Decision History**: Local storage of previous analyses
- **Responsive Design**: Black and white theme with mobile support

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install backend dependencies:
   \`\`\`bash
   cd backend
   npm install
   \`\`\`

3. Install frontend dependencies:
   \`\`\`bash
   cd frontend
   npm install
   \`\`\`

### Running the Application

1. Start the backend server:
   \`\`\`bash
   cd backend
   npm run dev
   \`\`\`

2. Start the frontend development server:
   \`\`\`bash
   cd frontend
   npm start
   \`\`\`

3. Open your browser and navigate to `http://localhost:3000`

## How It Works

The Maximum Entropy Principle finds the probability distribution that:
1. Maximizes entropy (uncertainty/randomness)
2. Meets your minimum expected reward constraint
3. Ensures all probabilities sum to 1

This approach is useful for decision-making under uncertainty where you want to avoid making overly confident predictions while still meeting performance requirements.

## Project Structure

\`\`\`
├── backend/
│   ├── server.js          # Express server and API routes
│   └── package.json       # Backend dependencies
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── services/      # API service functions
│   │   ├── App.js         # Main App component
│   │   └── index.js       # React entry point
│   ├── public/
│   └── package.json       # Frontend dependencies
└── README.md
\`\`\`

## API Endpoints

- `POST /api/optimize` - Compute optimal probability distribution
- `POST /api/share` - Create shareable link for results
- `GET /api/shared/:id` - Retrieve shared result

## Technologies Used

- **Backend**: Node.js, Express.js
- **Frontend**: React, Chart.js
- **Styling**: CSS3 with responsive design
- **Storage**: Local Storage for history, In-memory for sharing
