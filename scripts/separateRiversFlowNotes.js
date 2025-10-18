import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the parsed MIDI file
const midiFilePath = path.join(__dirname, '../src/assets/midi/parsed-rivers-flow.json');
const midiData = JSON.parse(fs.readFileSync(midiFilePath, 'utf-8'));

// C3 is MIDI note 48 (130.81 Hz)
const C3_MIDI = 48;
const C3_FREQUENCY = 130.81;

// Separate notes into bass (< C3) and treble (>= C3)
const bassNotes = [];
const trebleNotes = [];

midiData.tracks.forEach((track) => {
  track.notes.forEach((note) => {
    if (note.midi < C3_MIDI) {
      // Bass notes (background)
      bassNotes.push({
        frequency: note.frequency,
        time: note.time,
        duration: note.duration,
        velocity: note.velocity,
        name: note.name,
        midi: note.midi
      });
    } else {
      // Treble notes (keystroke-triggered)
      trebleNotes.push({
        frequency: note.frequency,
        time: note.time,
        duration: note.duration,
        velocity: note.velocity,
        name: note.name,
        midi: note.midi
      });
    }
  });
});

// Sort by time
bassNotes.sort((a, b) => a.time - b.time);
trebleNotes.sort((a, b) => a.time - b.time);

console.log('\n📊 Rivers Flow Note Separation:\n');
console.log(`  Total notes: ${midiData.tracks[0].notes.length}`);
console.log(`  Bass notes (< C3 / ${C3_FREQUENCY}Hz): ${bassNotes.length}`);
console.log(`  Treble notes (>= C3 / ${C3_FREQUENCY}Hz): ${trebleNotes.length}`);

console.log('\n🎵 First 10 Bass Notes (Background):');
bassNotes.slice(0, 10).forEach((note, i) => {
  console.log(`  ${i + 1}. ${note.name.padEnd(4)} @ ${note.time.toFixed(2)}s (${note.frequency}Hz, vel: ${note.velocity.toFixed(2)})`);
});

console.log('\n🎹 First 10 Treble Notes (Keystroke):');
trebleNotes.slice(0, 10).forEach((note, i) => {
  console.log(`  ${i + 1}. ${note.name.padEnd(4)} @ ${note.time.toFixed(2)}s (${note.frequency}Hz, vel: ${note.velocity.toFixed(2)})`);
});

// Extract frequencies for use in audio service
const bassFrequencies = bassNotes.map(n => n.frequency);
const trebleFrequencies = trebleNotes.map(n => n.frequency);

// Limit to reasonable arrays for hardcoding
const bassFreqsLimited = bassFrequencies.slice(0, 100); // Use first 100 bass notes
const trebleFreqsLimited = trebleFrequencies.slice(0, 100); // Use first 100 treble notes

console.log('\n💾 Arrays for Audio Service:');
console.log(`  Bass array: ${bassFreqsLimited.length} frequencies`);
console.log(`  Treble array: ${trebleFreqsLimited.length} frequencies`);

// Output to console for easy copy-paste
console.log('\n📋 Copy this to audioService.ts:\n');
console.log('// Bass notes (< C3) - background layer');
console.log(`private readonly riversFlowBass = [${bassFreqsLimited.join(', ')}];\n`);
console.log('// Treble notes (>= C3) - keystroke-triggered melody');
console.log(`private readonly riversFlowMelody = [${trebleFreqsLimited.join(', ')}];`);

// Save to file for reference
const outputPath = path.join(__dirname, '../src/assets/midi/rivers-flow-separated.json');
fs.writeFileSync(outputPath, JSON.stringify({
  metadata: midiData.metadata,
  separation: {
    threshold: `C3 (MIDI ${C3_MIDI}, ${C3_FREQUENCY}Hz)`,
    bassCount: bassNotes.length,
    trebleCount: trebleNotes.length
  },
  bassNotes: bassNotes,
  trebleNotes: trebleNotes,
  bassFrequencies: bassFreqsLimited,
  trebleFrequencies: trebleFreqsLimited
}, null, 2));

console.log(`\n✅ Saved separated notes to: ${outputPath}\n`);
