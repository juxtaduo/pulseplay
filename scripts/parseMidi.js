#!/usr/bin/env node
/**
 * Universal MIDI Parser for PulsePlay AI
 * Parse any MIDI file and separate notes by C4 threshold for audioService
 * 
 * Usage:
 *   node scripts/parseMidi.js <filename>              # Parse single file
 *   node scripts/parseMidi.js --all                   # Parse all MIDI files
 *   node scripts/parseMidi.js --list                  # List available MIDI files
 * 
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

// MIDI file configurations
const MIDI_CONFIGS = {
  'Christina Perri - A Thousand Years.mid': {
    id: 'thousand-years',
    title: 'A Thousand Years',
    artist: 'Christina Perri',
    description: 'Romantic piano ballad'
  },
  'Yiruma - Kiss The Rain.mid': {
    id: 'kiss-the-rain',
    title: 'Kiss The Rain',
    artist: 'Yiruma',
    description: 'Emotional piano piece'
  },
  'YIRUMA - River Flows In You.mid': {
    id: 'river-flows',
    title: 'River Flows In You',
    artist: 'Yiruma',
    description: 'Classic piano composition'
  },
  'Demon Slayer OP Full - Gurenge.mid': {
    id: 'gurenge',
    title: 'Gurenge',
    artist: 'LiSA',
    description: 'Demon Slayer opening theme'
  },
  'Demon Slayer - Gurenge.mid': {
    id: 'gurenge',
    title: 'Gurenge',
    artist: 'LiSA',
    description: 'Demon Slayer opening theme'
  }
};

/**
 * Convert MIDI note number to frequency
 * Formula: freq = 440 * 2^((midi - 69) / 12)
 * Where MIDI 69 = A4 = 440 Hz
 */
function midiToFrequency(midiNote) {
  return Math.round(440 * Math.pow(2, (midiNote - 69) / 12) * 100) / 100;
}

/**
 * Get MIDI file configuration or auto-generate from filename
 */
function getConfig(filename) {
  if (MIDI_CONFIGS[filename]) {
    return MIDI_CONFIGS[filename];
  }
  
  // Auto-generate config from filename
  const base = filename.replace('.mid', '');
  const id = base.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return {
    id,
    title: base,
    artist: 'Unknown',
    description: 'MIDI composition'
  };
}

/**
 * List all available MIDI files in the directory
 */
function listMidiFiles() {
  console.log('\n🎵 Available MIDI Files:');
  console.log('='.repeat(60));
  
  const files = fs.readdirSync(MIDI_DIR).filter(f => f.endsWith('.mid'));
  
  if (files.length === 0) {
    console.log('   No MIDI files found in', MIDI_DIR);
    return [];
  }
  
  files.forEach((file, index) => {
    const config = getConfig(file);
    console.log(`   ${index + 1}. ${file}`);
    console.log(`      ID: ${config.id}`);
    console.log(`      Title: ${config.title} - ${config.artist}`);
    console.log(`      ${config.description}`);
    console.log('');
  });
  
  console.log('='.repeat(60));
  return files;
}

/**
 * Parse a single MIDI file
 */
async function parseMidiFile(filename) {
  const filePath = path.join(MIDI_DIR, filename);
  const config = getConfig(filename);
  
  console.log(`\n🎵 Parsing "${config.title}" by ${config.artist}`);
  console.log('='.repeat(60));
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    throw new Error(`MIDI file not found: ${filename}`);
  }
  
  // Read and parse MIDI
  const midiData = fs.readFileSync(filePath);
  const midi = new Midi(midiData);
  
  console.log(`\n📊 MIDI Information:`);
  console.log(`   Title: ${config.title}`);
  console.log(`   Artist: ${config.artist}`);
  console.log(`   File: ${filename}`);
  console.log(`   Tempo: ${Math.round(midi.header.tempos[0]?.bpm || 120)} BPM`);
  console.log(`   Duration: ${Math.round(midi.duration)}s`);
  console.log(`   Tracks: ${midi.tracks.length}`);
  console.log(`   Time Signature: ${midi.header.timeSignatures[0]?.timeSignature || '4/4'}`);
  
  // Collect all notes from all tracks
  const allNotes = [];
  midi.tracks.forEach((track, trackIndex) => {
    console.log(`   Track ${trackIndex + 1}: ${track.name || 'Unnamed'} (${track.notes.length} notes)`);
    track.notes.forEach(note => {
      // Calculate frequency from MIDI note number
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
  
  console.log(`\n   Total notes: ${allNotes.length}`);
  
  // Separate by C4 threshold (MIDI 60 = 261.63 Hz)
  const backgroundNotes = allNotes.filter(n => n.midi < C4_MIDI);
  const melodyNotes = allNotes.filter(n => n.midi >= C4_MIDI);
  
  console.log('\n🎼 Note Separation (C4 = MIDI 60 = 261.63 Hz):');
  console.log(`   Background notes (< C4): ${backgroundNotes.length}`);
  console.log(`   Melody notes (>= C4): ${melodyNotes.length}`);
  
  // Show frequency ranges
  if (backgroundNotes.length > 0) {
    const bgFreqs = backgroundNotes.map(n => n.frequency);
    const minBg = Math.min(...bgFreqs);
    const maxBg = Math.max(...bgFreqs);
    console.log(`   Background range: ${minBg} Hz - ${maxBg} Hz`);
  }
  
  if (melodyNotes.length > 0) {
    const melFreqs = melodyNotes.map(n => n.frequency);
    const minMel = Math.min(...melFreqs);
    const maxMel = Math.max(...melFreqs);
    console.log(`   Melody range: ${minMel} Hz - ${maxMel} Hz`);
  }
  
  // Show first 10 notes of each type
  console.log('\n🔊 First 10 Background Notes (< C4):');
  backgroundNotes.slice(0, 10).forEach((note, i) => {
    console.log(`   ${i + 1}. ${note.name.padEnd(4)} @ ${note.time.toFixed(2)}s - ${note.frequency}Hz (vel: ${note.velocity})`);
  });
  
  console.log('\n🎹 First 10 Melody Notes (>= C4):');
  melodyNotes.slice(0, 10).forEach((note, i) => {
    console.log(`   ${i + 1}. ${note.name.padEnd(4)} @ ${note.time.toFixed(2)}s - ${note.frequency}Hz (vel: ${note.velocity})`);
  });
  
  // Extract frequencies for audioService (rounded to 2 decimal places)
  const backgroundFreqs = backgroundNotes.map(n => parseFloat(n.frequency.toFixed(2)));
  const melodyFreqs = melodyNotes.map(n => parseFloat(n.frequency.toFixed(2)));
  
  console.log('\n💾 Arrays for audioService.ts:');
  console.log(`   Background array: ${backgroundFreqs.length} frequencies`);
  console.log(`   Melody array: ${melodyFreqs.length} frequencies`);
  
  // Save parsed data
  const outputPath = path.join(MIDI_DIR, `parsed-${config.id}.json`);
  const outputData = {
    metadata: {
      name: config.title,
      artist: config.artist,
      duration: midi.duration,
      tempo: midi.header.tempos[0]?.bpm || null,
      timeSignature: midi.header.timeSignatures[0]?.timeSignature || null,
      totalNotes: allNotes.length,
      backgroundNotes: backgroundNotes.length,
      melodyNotes: melodyNotes.length,
      c4Threshold: C4_FREQUENCY
    },
    allNotes: allNotes,
    backgroundFrequencies: backgroundFreqs,
    melodyFrequencies: melodyFreqs
  };
  
  fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));
  console.log(`\n✅ Saved parsed data to: ${path.relative(process.cwd(), outputPath)}`);
  
  // Convert kebab-case to camelCase (e.g., "kiss-the-rain" -> "kissTheRain")
  const toCamelCase = (str) => {
    return str.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
  };
  
  const variableName = toCamelCase(config.id);
  
  // Generate code for audioService.ts
  console.log('\n📋 Copy these arrays to audioService.ts:\n');
  console.log(`// ${config.title} (${config.artist}) - MIDI-extracted notes`);
  console.log(`// Background notes (< C4 / ${C4_FREQUENCY}Hz) - continuous ambient layer`);
  console.log(`private readonly ${variableName}Bass = [${backgroundFreqs.join(', ')}];`);
  console.log('');
  console.log(`// Melody notes (>= C4 / ${C4_FREQUENCY}Hz) - keystroke/mouse triggered`);
  console.log(`private readonly ${variableName}Melody = [${melodyFreqs.join(', ')}];`);
  
  console.log('\n' + '='.repeat(60));
  console.log(`✅ Parsing complete for "${config.title}"!\n`);
  
  return {
    filename,
    config,
    outputPath,
    stats: {
      totalNotes: allNotes.length,
      backgroundNotes: backgroundNotes.length,
      melodyNotes: melodyNotes.length,
      tempo: Math.round(midi.header.tempos[0]?.bpm || 120),
      duration: Math.round(midi.duration)
    }
  };
}

/**
 * Parse all MIDI files in the directory
 */
async function parseAllMidiFiles() {
  console.log('\n🎵 Parsing All MIDI Files');
  console.log('='.repeat(60));
  
  const files = fs.readdirSync(MIDI_DIR).filter(f => f.endsWith('.mid'));
  
  if (files.length === 0) {
    console.log('   No MIDI files found in', MIDI_DIR);
    return;
  }
  
  console.log(`Found ${files.length} MIDI file(s)\n`);
  
  const results = [];
  
  for (const file of files) {
    try {
      const result = await parseMidiFile(file);
      results.push(result);
    } catch (error) {
      console.error(`\n❌ Error parsing ${file}:`, error.message);
      results.push({ filename: file, error: error.message });
    }
  }
  
  // Summary
  console.log('\n📊 Parsing Summary:');
  console.log('='.repeat(60));
  results.forEach((result, index) => {
    if (result.error) {
      console.log(`   ${index + 1}. ❌ ${result.filename} - Failed: ${result.error}`);
    } else {
      console.log(`   ${index + 1}. ✅ ${result.config.title}`);
      console.log(`      File: ${result.filename}`);
      console.log(`      Notes: ${result.stats.totalNotes} total (${result.stats.backgroundNotes} bass, ${result.stats.melodyNotes} melody)`);
      console.log(`      Tempo: ${result.stats.tempo} BPM`);
      console.log(`      Duration: ${result.stats.duration}s`);
      console.log(`      Output: ${path.basename(result.outputPath)}`);
      console.log('');
    }
  });
  
  const successful = results.filter(r => !r.error).length;
  const failed = results.filter(r => r.error).length;
  
  console.log('='.repeat(60));
  console.log(`✅ Successfully parsed: ${successful}/${results.length}`);
  if (failed > 0) {
    console.log(`❌ Failed: ${failed}/${results.length}`);
  }
  console.log('');
}

/**
 * Show usage information
 */
function showUsage() {
  console.log('\n🎵 Universal MIDI Parser for PulsePlay AI');
  console.log('='.repeat(60));
  console.log('\nUsage:');
  console.log('  node scripts/parseMidi.js <filename>      # Parse single file');
  console.log('  node scripts/parseMidi.js --all           # Parse all MIDI files');
  console.log('  node scripts/parseMidi.js --list          # List available files');
  console.log('  node scripts/parseMidi.js --help          # Show this help');
  console.log('\nExamples:');
  console.log('  node scripts/parseMidi.js "Yiruma - Kiss The Rain.mid"');
  console.log('  node scripts/parseMidi.js --all');
  console.log('\nNote Separation:');
  console.log('  - Notes below C4 (261.63 Hz) → Background ambient layer');
  console.log('  - Notes C4 and above → Keystroke/mouse triggered melody');
  console.log('');
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    showUsage();
    return;
  }
  
  if (args.includes('--list') || args.includes('-l')) {
    listMidiFiles();
    return;
  }
  
  if (args.includes('--all') || args.includes('-a')) {
    await parseAllMidiFiles();
    return;
  }
  
  // Parse single file
  const filename = args[0];
  await parseMidiFile(filename);
}

// Run the script
main().catch(error => {
  console.error('\n❌ Error:', error.message);
  console.error(error.stack);
  process.exit(1);
});
