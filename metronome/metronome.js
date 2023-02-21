var audioContext = null
var unlocked = false
var isPlaying = false // Are we currently playing?
var startTime // The start time of the entire sequence.
var current16thNote // What note is currently last scheduled?
var tempo = 120.0 // tempo (in beats per minute)
var lookahead = 25.0 // How frequently to call scheduling function
//(in milliseconds)
var scheduleAheadTime = 0.1 // How far ahead to schedule audio (sec)
// This is calculated from lookahead, and overlaps
// with next interval (in case the timer is late)
var nextNoteTime = 0.0 // when the next note is due.
var noteResolution = 2 // 0 == 16th, 1 == 8th, 2 == quarter note
var noteLength = 0.05 // length of "beep" (in seconds)
var canvas, // the canvas element
  canvasContext // canvasContext is the canvas' context 2D
var last16thNoteDrawn = -1 // the last "box" we drew on the screen
var notesInQueue = [] // the notes that have been put into the web audio,
// and may or may not have played yet. {note, time}
var timerWorker = null // The Web Worker used to fire timer messages
let sample
let meter       // number of 16th notes in each measure

// First, let's shim the requestAnimationFrame API, with a setTimeout fallback
window.requestAnimFrame = (function () {
  return (
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function (callback) {
      window.setTimeout(callback, 1000 / 60)
    }
  )
})()

function nextNote() {
  // Advance current note and time by a 16th note...
  var secondsPerBeat = 60.0 / tempo // Notice this picks up the CURRENT
  // tempo value to calculate beat length.
  nextNoteTime += 0.25 * secondsPerBeat // Add beat length to last beat time

  current16thNote++ // Advance the beat number, wrap to zero
  if (current16thNote == meter) {
    current16thNote = 0
  }
}

function scheduleNote(beatNumber, time) {
  // push the note on the queue, even if we're not playing.
  notesInQueue.push({ note: beatNumber, time: time })
  // console.log("in scheduleNote: beatNumber is " + beatNumber + ", currentNote is " + last16thNoteDrawn);
  if (noteResolution == 1 && beatNumber % 2) return // we're not playing non-8th 16th notes
  if (noteResolution == 2 && beatNumber % 4) return // we're not playing non-quarter 8th notes

// create an oscillator
//   var osc = audioContext.createOscillator()
//   osc.connect(audioContext.destination)
//   

  let osc = audioContext.createBufferSource()
  osc.buffer = sample
  osc.connect(audioContext.destination)
    // console.log(beatNumber)
  if (beatNumber % meter === 0)       // this is the first beat of the measure
      // beat 0 == high pitch
      osc.detune.value = 0
    else if (beatNumber % 4 === 0)    // this is a quarter note
      // quarter notes = medium pitch
      // osc.detune.value = -1200
      osc.detune.value = -600
    // other 16th notes = low pitch
    else {
        osc.detune.value = -1200
    } 

  osc.start(time)
}

function scheduler() {
  // while there are notes that will need to play before the next interval,
  // schedule them and advance the pointer.
  while (nextNoteTime < audioContext.currentTime + scheduleAheadTime) {
    scheduleNote(current16thNote, nextNoteTime)
    nextNote()
  }
}

function play() {
    alert("called play");
    if (!unlocked) {
    // play silent buffer to unlock the audio
    var buffer = audioContext.createBuffer(1, 1, 22050)
    var node = audioContext.createBufferSource()
    node.buffer = buffer
    node.start(0)
    unlocked = true
  }
  isPlaying = !isPlaying
  if (isPlaying) {
    // start playing
    current16thNote = 0
    nextNoteTime = audioContext.currentTime
    timerWorker.postMessage("start")
    // console.log("metronome is playing, returning on")
    return "on"
  } else {
    timerWorker.postMessage("stop")
    // console.log("metronome is NOT playing, returning off")
    return "off"
  }
}

function resetCanvas(e) {
  // resize the canvas - but remember - this clears the canvas too.
  canvas.width = window.innerWidth/2
  canvas.height = 60          // put back to 40
  
  //make sure we scroll to the top left.
  window.scrollTo(0, 0)
}

function draw() {
  var currentNote = last16thNoteDrawn
  var currentTime = audioContext.currentTime

  while (notesInQueue.length && notesInQueue[0].time < currentTime) {
    currentNote = notesInQueue[0].note
    notesInQueue.splice(0, 1) // remove note from queue
  }

  // We only need to draw if the note has moved.
  if (last16thNoteDrawn != currentNote) {
    // var x = Math.floor(canvas.width / 18)
    var x = Math.floor(canvas.width / 60)
    canvasContext.clearRect(0, 0, canvas.width, canvas.height)
    for (var i = 0; i < meter; i++) {
      canvasContext.fillStyle = (currentNote == i) ? ((currentNote % 4 === 0) ? "red" : "blue") : "black";
      canvasContext.fillRect(x * (i + 1), x, x / 2, x / 2);
    }
    // alert("drawing, note is " + currentNote);
    last16thNoteDrawn = currentNote
  }
  // set up to draw again
  requestAnimFrame(draw)
}

async function init() {

  // NOTE: THIS RELIES ON THE MONKEYPATCH LIBRARY BEING LOADED FROM
  // Http://cwilso.github.io/AudioContext-MonkeyPatch/AudioContextMonkeyPatch.js
  // TO WORK ON CURRENT CHROME!!  But this means our code can be properly
  // spec-compliant, and work on Chrome, Safari and Firefox.

  audioContext = new AudioContext()
  // console.log("init, container " + container);
  // if we wanted to load audio files, etc., this is where we should do it.

  let request = await fetch("../metronome/clave.mp3")
  
  //   let data = await reader.read()
  //     console.log(data)

    sample = await request.arrayBuffer()
    sample = await audioContext.decodeAudioData(sample)
    let temp = new URLSearchParams(window.location.search)
    // tempo = parseFloat(temp.get("bpm"))
    // meter = parseInt(temp.get("meter")) * 4

    // console.log(sample)
  window.onorientationchange = resetCanvas
  window.onresize = resetCanvas

  requestAnimFrame(draw) // start the drawing loop.

timerWorker = new Worker("../metronome/metronomeworker.js")
 // timerWorker = new Worker("js/metronomeworker.js")

timerWorker.onmessage = function (e) {
    if (e.data == "tick") {
      // console.log("tick!");
      scheduler()
    } //else console.log("message: " + e.data)
  }
  timerWorker.postMessage({ interval: lookahead })
}
// window.addEventListener("load", init)
// console.log("init ran, audioContext is " + audioContext)