#!/usr/bin/env node
/**
 * Parse all MIDI files and separate notes for audioService
 * Notes below C4 (261.63Hz) = background ambient layer
 * Notes C4 and above = keystroke/mouse input triggered notes
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Midi } from '@tonejs/midi';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const C4_MIDI = 60; // MIDI note 60 = C4 (261.63 Hz)
const MIDI_DIR = path.join(__dirname, '../src/assets/midi');

// MIDI files to process
const midiFiles = [
  'Christina Perri - A Thousand Years.mid',
  'Yiruma - Kiss The Rain.mid',
  'YIRUMA - River Flows In You.mid'
];

// Convert MIDI file name to mood ID
function getMoodId(filename) {
  const base = filename.replace('.mid', '');
  if (base.includes('Thousand Years')) return 'thousand-years';
  if (base.includes('Kiss The Rain')) return 'kiss-the-rain';
  if (base.includes('River Flows')) return 'river-flows';
  return base.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

// Convert MIDI file name to display label
function getMoodLabel(filename) {
  const base = filename.replace('.mid', '');
  if (base.includes('Thousand Years')) return 'A Thousand Years';
  if (base.includes('Kiss The Rain')) return 'Kiss The Rain';
  if (base.includes('River Flows')) return 'River Flows In You';
  return base;
}

async function parseMidiFile(filename) {
  const filePath = path.join(MIDI_DIR, filename);
  
  console.log(`\n📄 Processing: ${filename}`);
  
  // Read and parse MIDI
  const midiData = fs.readFileSync(filePath);
  const midi = new Midi(midiData);
  
  console.log(`   Title: ${midi.header.name || 'Untitled'}`);
  console.log(`   Tempo: ${Math.round(midi.header.tempos[0]?.bpm || 120)} BPM`);
  console.log(`   Duration: ${Math.round(midi.duration)}s`);
  console.log(`   Tracks: ${midi.tracks.length}`);
  
  // Collect all notes from all tracks
  const allNotes = [];
  midi.tracks.forEach((track, trackIndex) => {
    track.notes.forEach(note => {
      allNotes.push({
        frequency: note.frequency,
        time: note.time,
        duration: note.duration,
        velocity: note.velocity,
        name: note.name,
        midi: note.midi,
        trackIndex
      });
    });
  });
  
  // Sort by time
  allNotes.sort((a, b) => a.time - b.time);
  
  // Separate by C4 threshold
  const backgroundNotes = allNotes.filter(n => n.midi < C4_MIDI);
  const melodyNotes = allNotes.filter(n => n.midi >= C4_MIDI);
  
  console.log(`   Background notes (< C4): ${backgroundNotes.length}`);
  console.log(`   Melody notes (>= C4): ${melodyNotes.length}`);
  
  // Extract just frequencies for audioService
  const backgroundFreqs = backgroundNotes.map(n => Math.round(n.frequency * 100) / 100);
  const melodyFreqs = melodyNotes.map(n => Math.round(n.frequency * 100) / 100);
  
  return {
    moodId: getMoodId(filename),
    label: getMoodLabel(filename),
    artist: filename.split(' - ')[0],
    title: midi.header.name || getMoodLabel(filename),
    tempo: Math.round(midi.header.tempos[0]?.bpm || 120),
    duration: Math.round(midi.duration),
    trackCount: midi.tracks.length,
    backgroundNotes: backgroundFreqs,
    melodyNotes: melodyFreqs,
    stats: {
      totalNotes: allNotes.length,
      backgroundCount: backgroundFreqs.length,
      melodyCount: melodyFreqs.length
    }
  };
}

// Main execution
async function main() {
  console.log('🎵 MIDI Parser - Separating Background & Melody Notes');
  console.log('=' .repeat(60));
  
  const results = {};
  
  for (const filename of midiFiles) {
    try {
      const parsed = await parseMidiFile(filename);
      results[parsed.moodId] = parsed;
    } catch (error) {
      console.error(`❌ Error parsing ${filename}:`, error.message);
    }
  }
  
  // Save results
  const outputPath = path.join(MIDI_DIR, 'parsed-moods.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  
  console.log('\n' + '='.repeat(60));
  console.log(`✅ Parsed ${Object.keys(results).length} MIDI files`);
  console.log(`📁 Saved to: ${path.relative(process.cwd(), outputPath)}`);
  
  // Generate TypeScript code snippets
  console.log('\n📝 Mood IDs for TypeScript types:');
  Object.keys(results).forEach(id => {
    console.log(`   '${id}'`);
  });
  
  console.log('\n📝 Mood config entries:');
  Object.values(results).forEach(mood => {
    console.log(`\n   '${mood.moodId}': {`);
    console.log(`      baseFrequency: 262, // C4`);
    console.log(`      tempo: ${mood.tempo}, // BPM from MIDI`);
    console.log(`      volume: 0.45,`);
    console.log(`      waveform: 'sine',`);
    console.log(`   },`);
  });
}

main().catch(console.error);
