import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function Dashboard() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    fetchStats();
    fetchResults();
  }, [user]);

  const fetchStats = () => {
    fetch("/api/results/stats", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => { if (!res.ok) throw new Error(); return res.json(); })
      .then(setStats)
      .catch(() => {});
  };

  const fetchResults = () => {
    fetch("/api/results/mine", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => { if (!res.ok) throw new Error(); return res.json(); })
      .then(setResults)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const getSuggestion = () => {
    if (!stats || stats.completed === 0) return "Start your first quiz to see how you perform!";
    if (stats.averageScore >= 80) return "Excellent work! You're mastering the material. Try challenging yourself with more quizzes.";
    if (stats.averageScore >= 60) return "Good job! You have a solid foundation. Keep practicing to improve further.";
    if (stats.averageScore >= 40) return "You're making progress! Review the questions you missed and try again.";
    return "Keep going! Consistent practice will help you improve. Try taking more quizzes.";
  };

  if (loading) {
    return (
      <div className="dashboardPage">
        <div className="loadingState">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="dashboardPage">
      <div className="dashTopBar">
        <div className="dashBrand">
          <span className="brandIcon">⚡</span>
          <h1>FlashQuiz</h1>
        </div>
        <div className="dashTopRight">
          <span className="userBadge">👤 {user?.name}</span>
          <Link to="/quiz" className="primaryBtn" style={{ padding: "10px 20px", fontSize: "14px" }}>
            🎯 Start Quiz
          </Link>
          <button onClick={logout} className="navBtn logoutBtn">🚪 Logout</button>
        </div>
      </div>

      <div className="dashContainer">
        <div className="dashGreeting">
          <h2>Welcome back, {user?.name}! 👋</h2>
          <p>{getSuggestion()}</p>
        </div>

        <div className="statsGrid">
          <div className="statCard total">
            <div className="statIcon">📋</div>
            <div className="statInfo">
              <span className="statValue">{stats?.totalQuestions || 0}</span>
              <span className="statLabel">Total Questions</span>
            </div>
          </div>
          <div className="statCard completed">
            <div className="statIcon">✅</div>
            <div className="statInfo">
              <span className="statValue">{stats?.completed || 0}</span>
              <span className="statLabel">Completed</span>
            </div>
          </div>
          <div className="statCard upcoming">
            <div className="statIcon">📝</div>
            <div className="statInfo">
              <span className="statValue">{stats?.upcoming || 0}</span>
              <span className="statLabel">Upcoming</span>
            </div>
          </div>
          <div className="statCard score">
            <div className="statIcon">🏆</div>
            <div className="statInfo">
              <span className="statValue">{stats?.averageScore ? Math.round(stats.averageScore) : 0}%</span>
              <span className="statLabel">Avg Score</span>
            </div>
          </div>
        </div>

        <div className="dashSections">
          <div className="dashSection quickActions">
            <h3>Quick Actions</h3>
            <div className="quickActionGrid">
              <Link to="/quiz" className="quickActionCard">
                <span className="qaIcon">🎯</span>
                <span className="qaTitle">Start Quiz</span>
                <span className="qaDesc">Take a timed quiz challenge</span>
              </Link>
              <Link to="/admin" className="quickActionCard">
                <span className="qaIcon">⚙️</span>
                <span className="qaTitle">Admin Panel</span>
                <span className="qaDesc">Manage questions</span>
              </Link>
            </div>
          </div>

          {results.length > 0 && (
            <div className="dashSection recentResults">
              <h3>Recent Results</h3>
              <div className="resultsList">
                {results.map((r) => (
                  <div key={r.id} className="resultRow">
                    <div className="resultLeft">
                      <span className="resultDate">{new Date(r.createdAt).toLocaleDateString()}</span>
                      <span className="resultMeta">{r.correctAnswers}/{r.totalQuestions} correct</span>
                    </div>
                    <div className="resultRight">
                      <div className="scoreBar">
                        <div
                          className={`scoreFill ${r.percentage >= 70 ? "high" : r.percentage >= 40 ? "mid" : "low"}`}
                          style={{ width: `${r.percentage}%` }}
                        />
                      </div>
                      <span className={`resultPct ${r.percentage >= 70 ? "high" : r.percentage >= 40 ? "mid" : "low"}`}>
                        {Math.round(r.percentage)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
