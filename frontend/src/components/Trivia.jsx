import { useEffect, useState } from "react";

export default function Trivia({
  data,
  questionNumber,
  setQuestionNumber,
  setTimeOut,
  setCorrectCount,
  setWrongCount,
  onAnswered,
}) {
  const [question, setQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answerState, setAnswerState] = useState(null);

  useEffect(() => {
    setQuestion(data[questionNumber - 1]);
    setSelectedAnswer(null);
    setAnswerState(null);
  }, [data, questionNumber]);

  const delay = (duration) =>
    new Promise((resolve) => setTimeout(resolve, duration));

  const handleClick = async (a) => {
    if (answerState) return;

    setSelectedAnswer(a);
    setAnswerState("selected");

    await delay(400);

    if (a.correct) {
      setCorrectCount((prev) => prev + 1);
      setAnswerState("correct");
    } else {
      setWrongCount((prev) => prev + 1);
      setAnswerState("wrong");
    }
    onAnswered?.();
  };

  const handleNext = () => {
    if (answerState === "wrong") {
      setTimeOut(true);
    } else {
      setQuestionNumber((prev) => prev + 1);
    }
  };

  const getClassName = (a) => {
    if (answerState === "selected" && selectedAnswer === a) return "answer selected";
    if (answerState === "correct" && selectedAnswer === a) return "answer correct";
    if (answerState === "wrong" && selectedAnswer === a) return "answer wrong";
    if (answerState) return "answer disabled";
    return "answer";
  };

  return (
    <div className="trivia">
      <div className="question">{question?.question}</div>
      <div className="answers">
        {question?.answers.map((a) => (
          <div
            key={a.text}
            className={getClassName(a)}
            onClick={() => !answerState && handleClick(a)}
          >
            {a.text}
          </div>
        ))}
      </div>
      {answerState && answerState !== "selected" && (
        <div className="triviaFooter">
          <button className="nextBtn" onClick={handleNext}>
            {answerState === "wrong" || questionNumber >= data.length
              ? "Finish Quiz"
              : "Next Question"}
          </button>
        </div>
      )}
    </div>
  );
}
