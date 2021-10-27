import './App.css';
import React from 'react';

const TIMER_LOWERBOUND = 1, TIMER_UPPERBOUND = 60;
const BREAK_DEFAULT = 5, SESSION_DEFAULT = 25;
const SESSION_LABEL = 'Session', BREAK_LABEL = 'Break';
const ONE_SECOND = 1000;
const BEEP_PATH = './media/single-beep_C_major.wav'
const LOOP_LENGTH = 1.2 * 1000 * 4; // sample length * miliseconds * repeats
const ICON_CLASS_SIZE = 'material-icons md-36'
const SHOW_SOCIAL = true;

const accurateInterval = function (fn, time) {
  var cancel, nextAt, timeout, wrapper;
  nextAt = new Date().getTime() + time;
  timeout = null;
  wrapper = function () {
    nextAt += time;
    timeout = setTimeout(wrapper, nextAt - new Date().getTime());
    return fn();
  };
  cancel = function () {
    return clearTimeout(timeout);
  };
  timeout = setTimeout(wrapper, nextAt - new Date().getTime());
  return {
    cancel: cancel
  };
};

function Break(props) {
  return(
    <div id="break-container">
      <p id="break-label">Break Length</p>
      <button 
        id="break-decrement"
        onClick={() => props.breakChange(-1)}
        >
          <i className={ICON_CLASS_SIZE}>remove</i>
        </button>
      <span class="number" id="break-length">{props.breakLength}</span>
      <button 
        id="break-increment"
        onClick={() => props.breakChange(1)}
        >
          <i className={ICON_CLASS_SIZE}>add</i>
        </button>
    </div>
  );
}

function Session(props) {
  return(
    <div id="session-container">
      <p id="session-label">Session Length</p>
      <button 
        id="session-decrement"
        onClick={() => props.sessionChange(-1)}
        >
          <i className={ICON_CLASS_SIZE}>remove</i>
        </button>
      <span class="number" id="session-length">{props.sessionLength}</span>
      <button 
        id="session-increment"
        onClick={() => props.sessionChange(1)}
        >
          <i className={ICON_CLASS_SIZE}>add</i>
        </button>
    </div>
  );
}

function Timer(props) {
  const playpauseIcon = props.timerRunning
                          ? <i className={ICON_CLASS_SIZE}>pause_circle_filled</i>
                          : <i className={ICON_CLASS_SIZE}>play_circle_filled</i>
  return(
    <div id="timer-container">
      <p>Currently on:</p> 
      <p id="timer-label">{props.timerState}</p>
      <p class="number" id="time-left">{props.time}</p>
      <button 
        id="start_stop"
        onClick={props.timerStartStop}
        >
          {playpauseIcon}
      </button>
      <button 
        id="reset"
        onClick={props.timerReset}
        >
          <i className={ICON_CLASS_SIZE}>refresh</i>
      </button>
    </div>
  );
}

class Social extends React.Component {
  render() {
    if(!SHOW_SOCIAL) return (<div></div>);
    return(
        <div id="social-footer">
          <p>learning project by thebatzuk. </p>
          <a href="https://twitter.com/thebatzuk" target="_blank" rel="noreferrer">twitter</a>
          <span> - </span>
          <a href="https://github.com/thebatzuk" target="_blank" rel="noreferrer">github</a>
        </div>
    );
  }
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      breakLength: BREAK_DEFAULT,
      sessionLength: SESSION_DEFAULT,
      time: SESSION_DEFAULT * 60,
      timerRunning: false,
      timerLabel: SESSION_LABEL,
      intervalID: ''
    };

    this.breakChange = this.breakChange.bind(this);
    this.sessionChange = this.sessionChange.bind(this);
    this.timerStartStop = this.timerStartStop.bind(this);
    this.timerReset = this.timerReset.bind(this);
    this.startClockCountDown = this.startClockCountDown.bind(this);
    this.clockStateMgmt = this.clockStateMgmt.bind(this);
  }

  breakChange(increment = 0) {
    const {breakLength, timerLabel} = this.state;
    let updatedTime = breakLength + increment;
    this.setState({
      breakLength: updatedTime > TIMER_UPPERBOUND || updatedTime < TIMER_LOWERBOUND
                    ? breakLength
                    : updatedTime
    })
    if(timerLabel === BREAK_LABEL) {
      this.setState({
        time: updatedTime > TIMER_UPPERBOUND || updatedTime < TIMER_LOWERBOUND
                      ? breakLength * 60
                      : updatedTime * 60
      })
    }
  }

  sessionChange(increment = 0) {
    const {sessionLength, timerLabel} = this.state;
    let updatedTime = sessionLength + increment;
    this.setState({
      sessionLength: updatedTime > TIMER_UPPERBOUND || updatedTime < TIMER_LOWERBOUND
                    ? sessionLength
                    : updatedTime
    })
    if(timerLabel === SESSION_LABEL) {
      this.setState({
        time: updatedTime > TIMER_UPPERBOUND || updatedTime < TIMER_LOWERBOUND
                      ? sessionLength * 60
                      : updatedTime * 60
      })
    }
  }

  timerStartStop() {
    if(this.state.timerRunning === false) {
      //start clock
      this.startClockCountDown();
      this.setState({
        timerRunning: true
      });
    } else {
      //stop clock
      if(this.state.intervalID) {
        this.state.intervalID.cancel();
      }
      this.setState({
        timerRunning: false
      });
    }
  }

  startClockCountDown() {
    this.setState({
      intervalID: accurateInterval(() => {
        this.setState({time: this.state.time - 1});
        this.clockStateMgmt()
      }, ONE_SECOND)
    });
  }

  clockStateMgmt() {
    let {time, timerLabel, breakLength, sessionLength, intervalID} = this.state;
    if(time < 0) {
      //beep sound
      this.audioBeep.play();
      setTimeout( () => {
        this.audioBeep.pause();
        this.audioBeep.currentTime = 0;
      }, LOOP_LENGTH);
      //stop clock
      if(intervalID) {
        intervalID.cancel();
      }
      if(timerLabel === SESSION_LABEL) {
        this.setState({
          time: breakLength * 60,
          timerLabel: BREAK_LABEL,
        });
        this.startClockCountDown()
      } else {
        this.setState({
          time: sessionLength * 60,
          timerLabel: SESSION_LABEL,
        });
        this.startClockCountDown()
      }
    }
  }

  timerReset() {
    //state reset
    this.setState({
      breakLength: BREAK_DEFAULT,
      sessionLength: SESSION_DEFAULT,
      time: SESSION_DEFAULT * 60,
      timerRunning: false,
      timerLabel: SESSION_LABEL,
      intervalID: ''
    });
    //count reset
    if(this.state.intervalID) {
      this.state.intervalID.cancel();
    }
    //beep stop
    this.audioBeep.pause();
    this.audioBeep.currentTime = 0;
  }

  showTimeInFormat() {
    let minutes = Math.floor(this.state.time / 60);
    let seconds = this.state.time - minutes * 60;
    seconds = seconds < 10 
                ? '0' + seconds
                : seconds;
    minutes = minutes < 10 
                ? '0' + minutes
                : minutes;
    
    return minutes + ':' + seconds;    
  }

  render() {
    return(
      <div>
          <header>
            <h1>SESSION/BREAK CLOCK</h1>
            {/*<p>Take a break!</p>*/}
          </header>
        <div id="app-container">
          <div id="controls">
          <Session 
              sessionLength={this.state.sessionLength}
              sessionChange={this.sessionChange}
              />
            <Break 
              breakLength={this.state.breakLength}
              breakChange={this.breakChange}
            />
          </div>
          <div id="divider"></div>
          <Timer
            time={this.showTimeInFormat()}
            timerState={this.state.timerLabel}
            timerStartStop={this.timerStartStop}
            timerReset={this.timerReset}
            timerRunning={this.state.timerRunning} 
            />
          <div id="audio-container">
            <audio
              id="beep"
              preload="auto" 
              src={BEEP_PATH}
              ref={ (audio) => {this.audioBeep = audio;} } 
                loop />
          </div>
        </div>
        <Social />
      </div>
    );
  }
}

export default App;
