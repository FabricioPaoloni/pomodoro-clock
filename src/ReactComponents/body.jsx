import { useEffect, useState, useRef } from 'react';


const Clock = () => {

  //state declaration.
  const [clockData, setClockData] = useState({
    sessionTime: 25,
    breakTime: 5,
    timerLabel: "WELCOME",
  });
  const [currentState, setCurrentState] = useState("pause");
  const [intervalId, setIntervalId] = useState(0);
  const [timerBackColor, setTimerBackColor] = useState("clock--background-color-gray");
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);

  //used as reference to invoke the beep audio
  const audio = document.getElementById("beep");

  //function to assign break and session times by clicking de arrow up/down buttons. Each arrow button calls this function with de arguments "variable" and "estado", this way I unified 4 actions in only one function.
  const handleIncrementAndDecrementTime = (variable, estado) => {
    //only works if the clock is uninitialized
    if (clockData.timerLabel === "WELCOME") {

      switch (estado) {

        case "breakTime":
          switch (variable) {
            case "increment":
              if (clockData.breakTime < 60) {
                setClockData(prevClockData => ({
                  ...prevClockData, breakTime: prevClockData.breakTime + 1
                }));
              };
              break;

            case "decrement":
              if (clockData.breakTime > 1) {
                setClockData(prevClockData => ({
                  ...prevClockData, breakTime: prevClockData.breakTime - 1
                }));
              };
              break;

            default: return;
          };
          break;

        case "sessionTime":
          switch (variable) {
            case "increment":
              if (clockData.sessionTime < 60) {
                let aux = clockData.sessionTime;
                setClockData(prevClockData => ({
                  ...prevClockData, sessionTime: prevClockData.sessionTime + 1
                }));
                if (clockData.timerLabel === "WELCOME") {
                  setMinutes(prevMinutes => aux + 1);
                }
              };
              break;
            case "decrement":
              if (clockData.sessionTime > 1) {
                let aux = clockData.sessionTime;
                setClockData(prevClockData => ({
                  ...prevClockData, sessionTime: prevClockData.sessionTime - 1
                }));
                if (clockData.timerLabel === "WELCOME") {
                  setMinutes(prevMinutes => aux - 1);
                }
              };
              break;
            default: return;
          }
          break;
        default: break;
      }
    }
  }

  //this function changes the break time with the input value
  const handleBreakChange = (event) => {
    if (clockData.timerLabel === "WELCOME") {
      if (Number(event.target.value) <= 60 && Number(event.target.value) > 0) {
        setClockData({ ...clockData, breakTime: Number(event.target.value) });
        return;
      } else {
        alert("El tiempo debe estar entre 1 y 60 minutos");
        setClockData({ ...clockData, breakTime: 5 });
        return;
      }
    }
  }

  //this function changes the session time with the input value
  const handleSessionChange = (event) => {
    if (clockData.timerLabel === "WELCOME") {
      if (Number(event.target.value) <= 60 && Number(event.target.value) > 0) {
        setClockData({ ...clockData, sessionTime: Number(event.target.value) });
        if (clockData.timerLabel === "WELCOME") {
          setMinutes(prevMinutes => Number(event.target.value));
        }
        return;
      } else {
        alert("El tiempo debe estar entre 1 y 60 minutos");
        setClockData({ ...clockData, sessionTime: 25 });
        setMinutes(prevMinutes => 25);
        return;
      }
    }
  }

  //beeper manages the beep audio
  const beeper = () => {
    audio.currentTime = 0;
    audio.play();
  }

  const discountMinute = () => {
    setMinutes(prevMinutes => {
      const modifiedMinutes = prevMinutes - 1;
      return modifiedMinutes;
    });
    setSeconds(prevSeconds => 59);
    if (minutes < 5) {

    }
  }
  const discountSecond = () => {
    setSeconds(prevSeconds => {
      let modifiedSeconds = prevSeconds - 1;
      return modifiedSeconds;
    });
  }
  const updateTimer = () => {
    let newTimeoutId = setTimeout(() => {
      //only works if the state is "play"
      if (currentState === "play") {
        if (seconds === 0) {
          discountMinute();
        } else {
          discountSecond();
        }
      }
    }, 1000);
    setIntervalId(newTimeoutId);
  }


  //useEffect was needed to run the time interval (setInterval doesn't work with react state unless you use useRef) or timeout. It depends on the "seconds" and "currentState" states; each time seconds or currentState change its value, useEffect re-run the code inside to keep discounting time, change de session tipe or pause the clock.
  useEffect(() => {
    if (minutes === 0 && seconds === 0) {
      //when the clock reach 00:00 the beep audio is reproduced and the state is changed.
      audio.volume = "0.2";
      audio.currentTime = 0;
      audio.play();
      setTimeout(() => {

        //switch between states "BREAK" and "SESSION"
        switch (clockData.timerLabel) {
          case "SESSION":
            setClockData(prevClockData => ({
              ...prevClockData, timerLabel: "BREAK"
            }));
            setMinutes(clockData.breakTime);
            setSeconds(0);
            setTimerBackColor("clock--background-color-orange");
            break;
          case "BREAK":
            setClockData(prevClockData => ({
              ...prevClockData, timerLabel: "SESSION"
            }));
            setMinutes(clockData.sessionTime);
            setSeconds(0);
            setTimerBackColor("clock--background-color-green");
            break;
        }
      }, 1000)
    }

    if (currentState === "play") {
      updateTimer();
    }

    return () => clearInterval(intervalId);
  }, [seconds, currentState])



  //manage the init of the clock and the pause/play actions.
  function play() {
    if (clockData.timerLabel === "WELCOME") {
      setClockData(prevClockData => ({
        ...prevClockData, timerLabel: "SESSION"
      }))
      setTimerBackColor("clock--background-color-green");

    }
    if (currentState === "pause") {
      setCurrentState("play");

    } else {
      setCurrentState("pause");
      clearInterval(intervalId);
      setIntervalId(0);
      return;
    }

  }

  //reset the clock to default values
  function reset() {
    setClockData(prevClockData => ({
      sessionTime: 25,
      breakTime: 5,
      timerLabel: "WELCOME",
    }));
    setCurrentState("pause");
    setMinutes(25);
    setSeconds(0);
    clearInterval(intervalId);
    setIntervalId(0);
    setTimerBackColor("clock--background-color-gray");
    audio.pause();
    audio.currentTime = 0;
  }

  //changes the pause/play button logo
  function playPauseLogoChanger() {
    return currentState === "play" ? "fa fa-pause controls__start-reset" : "fa fa-play controls__start-reset";
  }

  return (
    <div className="App">
      <section className="configuration">
        <div class="configuration__block configuration__block--less-margin">
          <p id="break-label" className="configuration__break-label">Break Length</p>
          <p id="session-label" className="configuration__session-label">Session Length</p>
        </div>
        <div class="configuration__block">
          <input id="break-length" className="configuration__break-length" value={clockData.breakTime} onChange={handleBreakChange}></input>
          <input id="session-length" className="configuration__session-length" value={clockData.sessionTime} onChange={handleSessionChange}></input>
        </div>
        <div class="configuration__block">
          <button id="break-increment" className="fa fa-arrow-up configuration__break-up --no-background" onClick={() => handleIncrementAndDecrementTime("increment", "breakTime")} />
          <button id="break-decrement" className="fa fa-arrow-down configuration__break-down --no-background" onClick={() => handleIncrementAndDecrementTime("decrement", "breakTime")} />
          <button id="session-increment" className="fa fa-arrow-up configuration__session-up --no-background" onClick={() => handleIncrementAndDecrementTime("increment", "sessionTime")} />
          <button id="session-decrement" className="fa fa-arrow-down configuration__session-down --no-background" onClick={() => handleIncrementAndDecrementTime("decrement", "sessionTime")} />
        </div>
      </section>

      <section id="clock" className={timerBackColor + " clock"}>
        <p id="timer-label" className="clock__timer-label --noShadow">{clockData.timerLabel}</p>
        <h2 id="time-left" className="clock__time-left noShadow">{(minutes > 9 ? minutes : "0" + minutes) + ":" + (seconds > 9 ? seconds : "0" + seconds)}</h2>
      </section>

      <section className="controls">
        <button id="start-stop" className={playPauseLogoChanger()} onClick={play}></button>
        <button id="reset" className="fa fa-refresh  controls__start-reset" onClick={reset}></button>
      </section>

      <audio id="beep" src="https://raw.githubusercontent.com/freeCodeCamp/cdn/master/build/testable-projects-fcc/audio/BeepSound.wav" type="audio/wav">
      </audio>

    </div>
  );

}
export default Clock;