const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
// B3 - C6
// https://pages.mtu.edu/~suits/notefreqs.html
const sounds = [
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

function parseToNotes(arr) {
  let notes = [];

  let noteSplit = arr.slice(0, 16);
  let durationSplit = arr.slice(16);

  noteSplit.forEach((note, i) => {
    notes.push({
      pitch: sounds[note],
      duration: 0.125 + durationSplit[i] / 32,
    });
  });

  notes.push({ pitch: sounds[1], duration: 0.5 });

  return notes;
}

function convertUuid(uuid) {
  const arr = parseToIntArray(uuid);
  const notes = parseToNotes(arr);

  return notes;
}

function playSound() {
  const sine = audioCtx.createOscillator();
  const volume = audioCtx.createGain();
  sine.connect(volume).connect(audioCtx.destination);

  const notes = convertUuid(selectedUuid);
  let totalTime = audioCtx.currentTime;

  volume.gain.linearRampToValueAtTime(0.5, totalTime);
  for (note of notes) {
    sine.frequency.setValueAtTime(note.pitch, totalTime);
    volume.gain.linearRampToValueAtTime(1, totalTime + attackTime);
    volume.gain.linearRampToValueAtTime(
      0,
      totalTime + note.duration - releaseTime
    );
    totalTime += note.duration;
  }

  sine.start();
  sine.stop(totalTime);
}

generateNew();
