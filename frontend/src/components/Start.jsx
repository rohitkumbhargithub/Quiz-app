import { Link } from "react-router-dom";

export default function Start() {
  return (
    <div className="landingPage">
      <div className="landingCard">
        <div className="landingLogo">
          <span className="logoIcon">⚡</span>
          <h1>FlashQuiz</h1>
        </div>
        <p className="landingTagline">
          Test your knowledge with timed quizzes
        </p>
        <div className="landingActions">
          <Link to="/register" className="primaryBtn">
            Get Started
          </Link>
          <Link to="/login" className="secondaryBtn">
            Sign In
          </Link>
        </div>
        <div className="landingFooter">
          <Link to="/admin/login" className="adminEntry">
            🔑 Admin Access
          </Link>
        </div>
        <div className="landingFeatures">
          <div className="feature">
            <span>⏱️</span>
            <span>Timed Challenges</span>
          </div>
          <div className="feature">
            <span>📊</span>
            <span>Track Progress</span>
          </div>
          <div className="feature">
            <span>🏆</span>
            <span>Earn Points</span>
          </div>
        </div>
      </div>
    </div>
  );
}
