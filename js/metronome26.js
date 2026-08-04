class CallableMetronome {
  constructor(bpm = 120, pattern = "1222", tickCallback = null) {
    this.bpm = bpm;
    this.pattern = pattern;
    this.meter = pattern.length;
    this.tickCallback = tickCallback; 
    
    // Web Audio API context for precise timing
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    this.nextNoteTime = 0.0;
    this.lookahead = 25.0;      // How often we check for notes (ms)
    this.scheduleAheadTime = 0.1; // How far ahead we schedule audio (sec)
    this.intervalId = null;
    this.isPlaying = false;
    this.counter = 0;
    this.downBeat = 700;
    this.secondary = 600;
    this.offBeat = 500;
    this.visual = "";
  }

  // Calculate the time length of one beat
  getSecondsPerBeat() {
    return 60.0 / this.bpm;
  }

  // Calculate the time length of one beat
  getBeatNumber() {
    return this.counter % this.meter;
  }
  // Schedule an exact sound to play in the future
  scheduleNote(time) {
    const osc = this.audioCtx.createOscillator();
    const gainNode = this.audioCtx.createGain();

    osc.connect(gainNode);
    gainNode.connect(this.audioCtx.destination);
    // Make a sharp 'click' sound
    // osc.frequency.setValueAtTime(1000, time);
    let beatNumber = this.getBeatNumber();
    if (beatNumber == 0) {
      osc.frequency.setValueAtTime(this.downBeat, time);
      this.visual = "🔴";
    } else if (this.pattern.substring(beatNumber, beatNumber + 1) == "1") {
      osc.frequency.setValueAtTime(this.secondary, time);
      this.visual += " ⭕";
    } else {
      this.visual += " 🟢";
      osc.frequency.setValueAtTime(this.offBeat, time);
    }
    // console.log(this.visual);
    // gainNode.gain.setValueAtTime(1, time);
    gainNode.gain.setValueAtTime(3, time);
    gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.05);

    osc.start(time);
    osc.stop(time + 0.05);

    // Execute the user-defined callable function (e.g. flashing UI)
    if (this.tickCallback) {
      this.tickCallback();
    }
  }

  // Keep scheduling notes if it is time to do so
  scheduler() {
    while (this.nextNoteTime < this.audioCtx.currentTime + this.scheduleAheadTime) {
      this.scheduleNote(this.nextNoteTime);
      this.nextNoteTime += this.getSecondsPerBeat();
      this.counter +=1;
    }
  }

  start() {
    if (this.isPlaying) return;
    
    this.isPlaying = true;
    this.audioCtx.resume();
    this.nextNoteTime = this.audioCtx.currentTime;
    
    // Loop to keep scheduling ahead
    this.intervalId = setInterval(() => this.scheduler(), this.lookahead);
  }

  stop() {
    this.isPlaying = false;
    clearInterval(this.intervalId);
  }
}

// EXAMPLE USAGE:
// 1. Create your callable function (for UI, DOM updates, etc.)
// function metronome() {
//   console.log("Tick!");
// }

// 2. Instantiate the metronome
// const myMetronome = new CallableMetronome(120, metronome);

// 3. Start it
// myMetronome.start();
