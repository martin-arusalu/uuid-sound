const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
// C3 - C6
// https://pages.mtu.edu/~suits/notefreqs.html
const sounds = [
  130.81,
  146.83,
  164.81,
  174.61,
  196.00,
  220.00,
  246.94,
  261.63,
  293.66,
  329.63,
  349.23,
  392.0,
  440.0,
  493.88,
  523.25,
  587.33,
  659.25,
  698.46,
  783.99,
  880.0,
  987.77,
  1046.5,
];
let selectedUuid;
const attackTime = 0.05;
const releaseTime = 0.01;
const bassNotes = 6;
const finalNoteLength = 0.5;
const nthNotes = 8;

function generateNew() {
  selectedUuid = uuid.v4();
  document.getElementById("uuidDisplay").innerHTML = selectedUuid;
}

function parseToIntArray(uuid) {
  const arr = [];
  for (let char of uuid) {
    if (char === "-") continue;
    switch (char) {
      case "a":
        arr.push(10);
        break;
      case "b":
        arr.push(11);
        break;
      case "c":
        arr.push(12);
        break;
      case "d":
        arr.push(13);
        break;
      case "e":
        arr.push(14);
        break;
      case "f":
        arr.push(15);
        break;
      default:
        arr.push(+char);
        break;
    }
  }

  return arr;
}

function parseToNotes(arr, melody) {
  let notes = [];

  if (melody) {
    let melodyPointer = 0;
    arr.forEach((note, i) => {
      const pitch = sounds[note];
      const duration = melody[melodyPointer].duration +
        melody[melodyPointer + 1].duration;
      melodyPointer += 2;
  
      notes.push({ pitch, duration });
    });
    notes.push({ pitch: sounds[7], duration: melody[melodyPointer].duration });
    notes.push({ pitch: sounds[7], duration: finalNoteLength });
  } else {
    let noteSplit = arr.slice(0, arr.length / 2);
    let durationSplit = arr.slice(arr.length / 2);

    noteSplit.forEach((note, i) => {
      const pitch = sounds[note + 6];
      const duration = (1 + durationSplit[i] % 4) / nthNotes;
  
      notes.push({ pitch, duration });
    });
    notes.push({ pitch: sounds[0], duration: finalNoteLength });
  }

  return notes;
}

function runBass(arr, melody) {
  const notes = parseToNotes(arr.slice(0, bassNotes), melody);
  const sine = audioCtx.createOscillator();
  const volume = audioCtx.createGain();
  let totalTime = audioCtx.currentTime;

  sine.connect(volume).connect(audioCtx.destination);
  volume.gain.linearRampToValueAtTime(0.1, totalTime);

  for (note of notes) {
    sine.frequency.setValueAtTime(note.pitch, totalTime);
    volume.gain.linearRampToValueAtTime(0.2, totalTime + attackTime);
    volume.gain.linearRampToValueAtTime(
      0,
      totalTime + note.duration - releaseTime
    );
    totalTime += note.duration;
  }

  sine.start();
  sine.stop(totalTime);
}

function runMelody(arr) {
  const notes = parseToNotes(arr.slice(bassNotes));
  console.log(notes);
  const sine = audioCtx.createOscillator();
  const volume = audioCtx.createGain();
  let totalTime = audioCtx.currentTime;

  sine.connect(volume).connect(audioCtx.destination);
  volume.gain.linearRampToValueAtTime(0.3, totalTime);

  for (note of notes) {
    sine.frequency.setValueAtTime(note.pitch, totalTime);
    volume.gain.linearRampToValueAtTime(0.7, totalTime + attackTime);
    volume.gain.linearRampToValueAtTime(
      0,
      totalTime + note.duration - releaseTime
    );
    totalTime += note.duration;
  }

  sine.start();
  sine.stop(totalTime);

  return notes;
}

function playSound() {
  const arr = parseToIntArray(selectedUuid);
  const melody = runMelody(arr);
  runBass(arr, melody);
}

generateNew();
