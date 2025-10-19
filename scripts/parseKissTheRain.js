import pkg from '@tonejs/midi';
const { Midi } = pkg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MIDI note number to frequency conversion
// Formula: freq = 440 × 2^((midi - 69) / 12)
// Where MIDI 69 = A4 = 440 Hz
function midiToFrequency(midiNote) {
  return 440 * Math.pow(2, (midiNote - 69) / 12);
}

// C4 threshold: MIDI note 60 = 261.63 Hz
const C4_MIDI = 60;
const C4_FREQUENCY = midiToFrequency(C4_MIDI);

// Parse the Kiss The Rain MIDI file
const midiPath = path.join(__dirname, '../src/assets/midi/Yiruma - Kiss The Rain.mid');
const midiBuffer = fs.readFileSync(midiPath);
const midi = new Midi(midiBuffer);

console.log('=== MIDI File Analysis ===');
console.log(`Name: ${midi.name}`);
console.log(`Duration: ${midi.duration.toFixed(2)} seconds`);
console.log(`Tempo: ${midi.header.tempos[0]?.bpm || 'N/A'} BPM`);
console.log(`Time Signature: ${midi.header.timeSignatures[0]?.timeSignature.join('/') || 'N/A'}`);
console.log(`Number of tracks: ${midi.tracks.length}`);

// Extract all notes from all tracks
const allNotes = [];
midi.tracks.forEach((track, trackIndex) => {
  console.log(`Track ${trackIndex}: ${track.name || 'Unnamed'} - ${track.notes.length} notes`);
  track.notes.forEach(note => {
    const frequency = midiToFrequency(note.midi);
    allNotes.push({
      midi: note.midi,
      frequency: frequency,
      time: note.time,
      duration: note.duration,
      velocity: note.velocity,
      name: note.name
    });
  });
});

// Sort by time
allNotes.sort((a, b) => a.time - b.time);

console.log(`\n=== Total Notes: ${allNotes.length} ===`);

// Separate notes by C4 threshold
const backgroundNotes = allNotes.filter(note => note.frequency < C4_FREQUENCY);
const melodyNotes = allNotes.filter(note => note.frequency >= C4_FREQUENCY);

console.log(`\n=== Note Separation (C4 threshold = ${C4_FREQUENCY.toFixed(2)} Hz) ===`);
console.log(`Background notes (< C4): ${backgroundNotes.length}`);
console.log(`Melody notes (>= C4): ${melodyNotes.length}`);

// Extract frequency arrays
const backgroundFrequencies = backgroundNotes.map(note => parseFloat(note.frequency.toFixed(2)));
const melodyFrequencies = melodyNotes.map(note => parseFloat(note.frequency.toFixed(2)));

// Show frequency ranges
if (backgroundNotes.length > 0) {
  const minBg = Math.min(...backgroundFrequencies);
  const maxBg = Math.max(...backgroundFrequencies);
  console.log(`Background frequency range: ${minBg.toFixed(2)} Hz - ${maxBg.toFixed(2)} Hz`);
}

if (melodyNotes.length > 0) {
  const minMel = Math.min(...melodyFrequencies);
  const maxMel = Math.max(...melodyFrequencies);
  console.log(`Melody frequency range: ${minMel.toFixed(2)} Hz - ${maxMel.toFixed(2)} Hz`);
}

// Show sample notes
console.log(`\n=== Sample Background Notes (first 10) ===`);
backgroundNotes.slice(0, 10).forEach(note => {
  console.log(`${note.name} (MIDI ${note.midi}): ${note.frequency.toFixed(2)} Hz at ${note.time.toFixed(2)}s`);
});

console.log(`\n=== Sample Melody Notes (first 10) ===`);
melodyNotes.slice(0, 10).forEach(note => {
  console.log(`${note.name} (MIDI ${note.midi}): ${note.frequency.toFixed(2)} Hz at ${note.time.toFixed(2)}s`);
});

// Save parsed data to JSON file
const outputData = {
  metadata: {
    name: midi.name,
    duration: midi.duration,
    tempo: midi.header.tempos[0]?.bpm || null,
    timeSignature: midi.header.timeSignatures[0]?.timeSignature || null,
    totalNotes: allNotes.length,
    backgroundNotes: backgroundNotes.length,
    melodyNotes: melodyNotes.length,
    c4Threshold: C4_FREQUENCY
  },
  allNotes: allNotes,
  backgroundFrequencies: backgroundFrequencies,
  melodyFrequencies: melodyFrequencies
};

const outputPath = path.join(__dirname, '../src/assets/midi/parsed-kiss-the-rain.json');
fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));
console.log(`\n=== Parsed data saved to: ${outputPath} ===`);

// Output arrays for easy copy-paste into audioService.ts
console.log(`\n=== Array Outputs for audioService.ts ===`);
console.log(`\nprivate readonly kissTheRainBass = [${backgroundFrequencies.join(', ')}];`);
console.log(`\nprivate readonly kissTheRainMelody = [${melodyFrequencies.join(', ')}];`);
