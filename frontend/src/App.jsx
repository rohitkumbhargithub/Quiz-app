import "./App.css";
import { Routes, Route, Link } from "react-router-dom";
import { useAuth } from "./AuthContext";
import Start from "./components/Start";
import Quiz from "./components/Quiz";
import Admin from "./components/Admin";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import Register from "./components/Register";
import AdminLogin from "./components/AdminLogin";

function App() {
  const { user, token, logout } = useAuth();

  return (
    <div className="app">
      <Routes>
        <Route path="/" element={user ? <Dashboard /> : <Start />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            user?.role === "admin" ? (
              <Admin />
            ) : (
              <div className="unauthorized">
                <div className="unauthorizedCard">
                  <span className="lockIcon">🔒</span>
                  <h2>Access Denied</h2>
                  <p>Admin privileges required</p>
                  <Link to="/admin/login" className="primaryBtn">
                    Admin Login
                  </Link>
                </div>
              </div>
            )
          }
        />
        <Route
          path="/quiz"
          element={user ? <Quiz user={user} token={token} logout={logout} /> : <Start />}
        />
      </Routes>
    </div>
  );
}

export default App;
