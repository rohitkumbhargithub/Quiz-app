import { useEffect, useState } from "react";

export default function Timer({ setTimeOut, questionNumber, stopped }) {
  const [timer, setTimer] = useState(30);

  useEffect(() => {
    if (stopped) return;
    if (timer === 0) return setTimeOut(true);
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer, setTimeOut, stopped]);

  useEffect(() => {
    setTimer(30);
  }, [questionNumber]);
  return timer;
}