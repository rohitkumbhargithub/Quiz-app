import { useEffect, useMemo, useState, useRef } from "react";
import { Link } from "react-router-dom";
import Timer from "./Timer";
import Trivia from "./Trivia";

export default function Quiz({ user, token, logout }) {
  const [timeOut, setTimeOut] = useState(false);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [data, setData] = useState([]);
  const [answered, setAnswered] = useState(false);
  const submittedRef = useRef(false);
  const progressLoadedRef = useRef(false);

  useEffect(() => {
    fetch("/api/questions")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then(setData)
      .catch(() => {});
  }, []);

  const pointPyramid = useMemo(
    () =>
      [10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((p, i) => ({
        id: i + 1,
        point: p,
      })),
    []
  );

  useEffect(() => {
    if (questionNumber > 1) {
      const pts =
        pointPyramid.find((m) => m.id === questionNumber - 1)?.point || 0;
      setScore((prev) => prev + Number(pts));
    }
  }, [questionNumber, pointPyramid]);

  useEffect(() => {
    if (timeOut && !submittedRef.current && user) {
      submittedRef.current = true;
      fetch("/api/results", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          score,
          totalQuestions: data.length,
          correctAnswers: correctCount,
          wrongAnswers: wrongCount,
        }),
      }).catch(console.error);
    }
  }, [timeOut, user, token]);

  useEffect(() => {
    if (timeOut && user) {
      fetch("/api/progress", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
  }, [timeOut, user]);

  useEffect(() => {
    if (user && data.length > 0 && !progressLoadedRef.current) {
      progressLoadedRef.current = true;
      fetch("/api/progress", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error("No progress");
          return res.json();
        })
        .then((progress) => {
          if (
            progress.questionNumber > 1 &&
            progress.questionNumber <= data.length
          ) {
            setQuestionNumber(progress.questionNumber);
            setScore(progress.score || 0);
            setCorrectCount(progress.correctCount || 0);
            setWrongCount(progress.wrongCount || 0);
          }
        })
        .catch(() => {});
    }
  }, [user, data]);

  useEffect(() => {
    if (user && questionNumber > 1 && !timeOut) {
      fetch("/api/progress", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          questionNumber,
          score,
          correctCount,
          wrongCount,
        }),
      }).catch(() => {});
    }
  }, [questionNumber, user, timeOut]);

  useEffect(() => {
    setAnswered(false);
  }, [questionNumber]);

  useEffect(() => {
    if (questionNumber > data.length && data.length > 0) {
      setTimeOut(true);
    }
  }, [questionNumber, data.length]);

  const handleRestart = () => {
    window.location.reload();
  };

  return (
    <div className="quizLayout">
      <div className="quizMain">
        <div className="quizTopBar">
          <div className="quizBrand">
            <span className="brandIcon">⚡</span>
            <h1>FlashQuiz</h1>
          </div>
          <div className="quizTopRight">
            <span className="userBadge">👤 {user?.name}</span>
            <Link to="/" className="navBtn">
              🏠 Dashboard
            </Link>
            <button onClick={logout} className="navBtn logoutBtn">
              🚪 Logout
            </button>
          </div>
        </div>

        {timeOut ? (
          <div className="resultScreen">
            <div className="resultCard">
              <div className="resultIcon">🏆</div>
              <h2>Quiz Complete!</h2>
              <div className="resultStats">
                <div className="resultStatItem">
                  <span className="rsLabel">Score</span>
                  <span className="rsValue">{score}</span>
                </div>
                <div className="resultStatItem">
                  <span className="rsLabel">Correct</span>
                  <span className="rsValue correct">{correctCount}</span>
                </div>
                <div className="resultStatItem">
                  <span className="rsLabel">Wrong</span>
                  <span className="rsValue wrong">{wrongCount}</span>
                </div>
                <div className="resultStatItem">
                  <span className="rsLabel">Accuracy</span>
                  <span className="rsValue">
                    {data.length > 0
                      ? Math.round((correctCount / data.length) * 100)
                      : 0}
                    %
                  </span>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  justifyContent: "center",
                }}
              >
                <button className="primaryBtn" onClick={handleRestart}>
                  Play Again
                </button>
                <Link to="/" className="secondaryBtn">
                  Dashboard
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="quizContent">
            <div className="timerSection">
              <Timer
                setTimeOut={setTimeOut}
                questionNumber={questionNumber}
                stopped={answered}
              />
              <div className="questionProgress">
                Question {questionNumber} of {data.length}
              </div>
            </div>
            <Trivia
              data={data}
              questionNumber={questionNumber}
              setQuestionNumber={setQuestionNumber}
              setTimeOut={setTimeOut}
              setCorrectCount={setCorrectCount}
              setWrongCount={setWrongCount}
              onAnswered={() => setAnswered(true)}
            />
          </div>
        )}
      </div>
      <div className="quizSidebar">
        <div className="sidebarHeader">Progress</div>
        <div className="progressList">
          {pointPyramid.map((m) => (
            <div
              key={m.id}
              className={`progressItem ${questionNumber === m.id ? "active" : ""} ${questionNumber > m.id ? "completed" : ""}`}
            >
              <span className="progressNum">{m.id}</span>
              <span className="progressPoint">{m.point} pts</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
