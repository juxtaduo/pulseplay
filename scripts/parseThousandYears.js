#!/usr/bin/env node
/**
 * Parse "A Thousand Years" MIDI file and separate notes by C4 threshold
 * Notes below C4 (261.63Hz, MIDI 60) = background ambient layer
 * Notes C4 and above = keystroke/mouse input triggered notes
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pkg from '@tonejs/midi';
const { Midi } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const C4_MIDI = 60; // MIDI note 60 = C4 (261.63 Hz)
const C4_FREQUENCY = 261.63;
const MIDI_DIR = path.join(__dirname, '../src/assets/midi');
const MIDI_FILE = 'Christina Perri - A Thousand Years.mid';

async function parseThousandYears() {
  const filePath = path.join(MIDI_DIR, MIDI_FILE);
  
  console.log('\n🎵 Parsing "A Thousand Years" by Christina Perri');
  console.log('=' .repeat(60));
  
  // Read and parse MIDI
  const midiData = fs.readFileSync(filePath);
  const midi = new Midi(midiData);
  
  console.log(`\n📊 MIDI Information:`);
  console.log(`   Title: ${midi.header.name || 'A Thousand Years'}`);
  console.log(`   Tempo: ${Math.round(midi.header.tempos[0]?.bpm || 120)} BPM`);
  console.log(`   Duration: ${Math.round(midi.duration)}s`);
  console.log(`   Tracks: ${midi.tracks.length}`);
  console.log(`   Time Signature: ${midi.header.timeSignatures[0]?.timeSignature || '4/4'}`);
  
  // Helper function to convert MIDI note to frequency
  // Formula: freq = 440 * 2^((midi - 69) / 12)
  // Where MIDI 69 = A4 = 440 Hz
  const midiToFrequency = (midi) => {
    return Math.round(440 * Math.pow(2, (midi - 69) / 12) * 100) / 100;
  };
  
  // Collect all notes from all tracks
  const allNotes = [];
  midi.tracks.forEach((track, trackIndex) => {
    console.log(`   Track ${trackIndex + 1}: ${track.name || 'Unnamed'} (${track.notes.length} notes)`);
    track.notes.forEach(note => {
      // Calculate frequency from MIDI note number if not provided
      const frequency = note.frequency || midiToFrequency(note.midi);
      allNotes.push({
        frequency: Math.round(frequency * 100) / 100,
        time: Math.round(note.time * 1000) / 1000,
        duration: Math.round(note.duration * 1000) / 1000,
        velocity: Math.round(note.velocity * 100) / 100,
        name: note.name,
        midi: note.midi,
        trackIndex
      });
    });
  });
  
  // Sort by time
  allNotes.sort((a, b) => a.time - b.time);
  
  console.log(`\n   Total notes: ${allNotes.length}`);
  
  // Separate by C4 threshold (MIDI 60 = 261.63 Hz)
  const backgroundNotes = allNotes.filter(n => n.midi < C4_MIDI);
  const melodyNotes = allNotes.filter(n => n.midi >= C4_MIDI);
  
  console.log('\n🎼 Note Separation (C4 = MIDI 60 = 261.63 Hz):');
  console.log(`   Background notes (< C4): ${backgroundNotes.length}`);
  console.log(`   Melody notes (>= C4): ${melodyNotes.length}`);
  
  // Show first 10 notes of each type
  console.log('\n🔊 First 10 Background Notes (< C4):');
  backgroundNotes.slice(0, 10).forEach((note, i) => {
    console.log(`   ${i + 1}. ${note.name.padEnd(4)} @ ${note.time.toFixed(2)}s - ${note.frequency}Hz (vel: ${note.velocity})`);
  });
  
  console.log('\n🎹 First 10 Melody Notes (>= C4):');
  melodyNotes.slice(0, 10).forEach((note, i) => {
    console.log(`   ${i + 1}. ${note.name.padEnd(4)} @ ${note.time.toFixed(2)}s - ${note.frequency}Hz (vel: ${note.velocity})`);
  });
  
  // Extract frequencies for audioService
  const backgroundFreqs = backgroundNotes.map(n => n.frequency);
  const melodyFreqs = melodyNotes.map(n => n.frequency);
  
  console.log('\n💾 Arrays for audioService.ts:');
  console.log(`   Background array: ${backgroundFreqs.length} frequencies`);
  console.log(`   Melody array: ${melodyFreqs.length} frequencies`);
  
  // Save parsed data
  const outputPath = path.join(MIDI_DIR, 'parsed-thousand-years.json');
  const outputData = {
    metadata: {
      title: 'A Thousand Years',
      artist: 'Christina Perri',
      originalFile: MIDI_FILE,
      duration: Math.round(midi.duration * 100) / 100,
      tempo: Math.round(midi.header.tempos[0]?.bpm || 120),
      timeSignature: midi.header.timeSignatures[0]?.timeSignature || [4, 4],
      trackCount: midi.tracks.length,
      totalNotes: allNotes.length
    },
    separation: {
      threshold: `C4 (MIDI ${C4_MIDI}, ${C4_FREQUENCY} Hz)`,
      backgroundCount: backgroundNotes.length,
      melodyCount: melodyNotes.length
    },
    backgroundNotes,
    melodyNotes,
    backgroundFrequencies: backgroundFreqs,
    melodyFrequencies: melodyFreqs
  };
  
  fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));
  console.log(`\n✅ Saved parsed data to: ${path.relative(process.cwd(), outputPath)}`);
  
  // Generate code for audioService.ts
  console.log('\n📋 Copy these arrays to audioService.ts:\n');
  console.log('// A Thousand Years (Christina Perri) - MIDI-extracted notes');
  console.log(`// Background notes (< C4 / ${C4_FREQUENCY}Hz) - continuous ambient layer`);
  console.log(`private readonly thousandYearsBass = [${backgroundFreqs.join(', ')}];`);
  console.log('');
  console.log(`// Melody notes (>= C4 / ${C4_FREQUENCY}Hz) - keystroke/mouse triggered`);
  console.log(`private readonly thousandYearsMelody = [${melodyFreqs.join(', ')}];`);
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ Parsing complete!\n');
}

parseThousandYears().catch(error => {
  console.error('\n❌ Error parsing MIDI file:', error.message);
  console.error(error.stack);
  process.exit(1);
});
