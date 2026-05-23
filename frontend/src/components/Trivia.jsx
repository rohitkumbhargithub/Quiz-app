import { useEffect, useState } from "react";

export default function Trivia({
  data,
  questionNumber,
  setQuestionNumber,
  setTimeOut,
  setCorrectCount,
  setWrongCount,
}) {
  const [question, setQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [className, setClassName] = useState("answer");

  useEffect(() => {
    setQuestion(data[questionNumber - 1]);
    setSelectedAnswer(null);
    setClassName("answer");
  }, [data, questionNumber]);

  const delay = (duration, callback) => {
    setTimeout(() => { callback(); }, duration);
  };

  const handleClick = (a) => {
    setSelectedAnswer(a);

    if (a.correct) {
      setCorrectCount((prev) => prev + 1);
      setClassName("answer correct");
      delay(1500, () => {
        setQuestionNumber((prev) => prev + 1);
      });
    } else {
      setWrongCount((prev) => prev + 1);
      setClassName("answer wrong");
      delay(1500, () => {
        setTimeOut(true);
      });
    }
  };

  return (
    <div className="trivia">
      <div className="question">{question?.question}</div>
      <div className="answers">
        {question?.answers.map((a) => (
          <div
            key={a.text}
            className={selectedAnswer === a ? className : "answer"}
            onClick={() => !selectedAnswer && handleClick(a)}
          >
            {a.text}
          </div>
        ))}
      </div>
    </div>
  );
}
