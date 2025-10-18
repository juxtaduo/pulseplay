# Rivers Flow MIDI Implementation

## Overview
The Rivers Flow mood implements Yiruma's "Rivers Flow In You" using MIDI data extracted from the original composition. Notes are separated into two layers based on their pitch.

## Note Separation Strategy

### Threshold: C3 (MIDI 48, 130.81 Hz)
- **Bass Notes (< C3)**: Played as continuous background layer
- **Treble Notes (>= C3)**: Triggered by user interactions (keystrokes, clicks, mouse moves, scrolls)

### From Original MIDI File
- **Total Notes**: 200 notes extracted from 800 in original MIDI
- **Bass Notes**: 7 notes (all A2 at 110Hz - pedal tones)
- **Treble Notes**: 100 notes (melody and harmony)
- **Tempo**: 65 BPM (slow, emotional)
- **Key**: A major / F# minor
- **Time Signature**: 4/4

## Implementation Details

### 1. MIDI Parsing & Separation
**Script**: `scripts/separateRiversFlowNotes.js`
```bash
node scripts/separateRiversFlowNotes.js
```

This script:
- Reads `parsed-rivers-flow.json` (output from `parseMidi.js`)
- Separates notes by MIDI number (< 48 vs >= 48)
- Outputs frequency arrays for direct use in audio service
- Saves detailed separation data to `rivers-flow-separated.json`

### 2. Audio Service Integration

**File**: `src/services/audioService.ts`

#### Bass Layer (Background)
```typescript
private readonly riversFlowBass = [110, 110, 110, 110, 110, 110, 110];
```
- **7 notes** (all A2 pedal tones)
- **Play continuously** in 8-beat intervals (2 measures)
- **Volume**: 0.12 (12% - subtle foundation)
- **Duration**: 8 beats each note
- **Method**: `startRiversFlowBass(tempo)`
- **Interval**: `riversFlowBassInterval`

#### Treble Melody (Keystroke-Triggered)
```typescript
private readonly riversFlowMelody = [
  880, 185, 830.61, 277.18, 880, 369.99, ... // 100 frequencies
];
```
- **100 notes** (melody and harmony)
- **Triggered by**: Keyboard, mouse clicks, moves, scrolls
- **Volume**: Determined by velocity (0.3-0.8)
- **Duration**: 0.6 seconds (configurable)
- **Method**: `getNextRiversFlowNote()`
- **Loops**: Automatically returns to start after 100 notes

### 3. Mood Configuration
```typescript
'rivers-flow': {
  baseFrequency: 440,  // A4 (key center)
  tempo: 65,           // BPM (from MIDI)
  volume: 0.45,        // 45% master volume
  waveform: 'sine',    // Pure piano-like tone
}
```

### 4. User Experience

When "Rivers Flow (Yiruma)" mood is selected:
1. **Background**: Continuous A2 bass pedal tones (every 8 beats)
2. **Interaction**: Each keystroke/click/move/scroll triggers next melody note
3. **No Drums**: Unlike lofi moods, no drum beats or vinyl crackle
4. **Pure Piano**: Clean sine wave synthesis for gentle piano-like sound
5. **100-note loop**: Melody cycles through Yiruma's original composition

## Technical Architecture

### Bass Background System
```
startRiversFlowBass(tempo) 
  ↓
Creates oscillator every 8 beats
  ↓
Plays A2 (110Hz) with ADSR envelope
  ↓
Loops through 7 bass notes
  ↓
Stopped by riversFlowBassInterval cleanup
```

### Treble Melody System
```
User Interaction (keystroke/click/etc)
  ↓
useRhythmDetection hook captures event
  ↓
Calls audioEngine.playInstrumentNote()
  ↓
Checks currentMood === 'rivers-flow'
  ↓
Calls getNextRiversFlowNote()
  ↓
Returns next frequency from 100-note array
  ↓
Plays note with selected instrument + ADSR
```

## File Structure

```
/scripts/
  parseMidi.js                    # Original MIDI → JSON parser
  separateRiversFlowNotes.js      # Bass/treble separator (NEW)

/src/assets/midi/
  Yiruma - Rivers Flow In You.mid # Original MIDI file
  parsed-rivers-flow.json         # Full MIDI data (1622 lines)
  rivers-flow-separated.json      # Separated bass/treble data (NEW)

/src/services/
  audioService.ts                 # Audio engine with Rivers Flow logic

/backend/src/
  types/index.ts                  # Mood type: added 'rivers-flow'
  models/FocusSession.ts          # Mood enum: added 'rivers-flow'
  models/WeeklySummary.ts         # dominantMood enum: added 'rivers-flow'
  services/sessionAnalyzer.ts     # suggestMoodFromPattern: added 'rivers-flow'

/src/components/
  ControlPanel.tsx                # UI: "Rivers Flow (Yiruma)" button
```

## Usage Instructions

### For Users
1. Click **"Rivers Flow (Yiruma)"** mood button
2. Start typing, clicking, or moving mouse
3. Each interaction plays the next note from Yiruma's melody
4. Background bass provides harmonic foundation
5. Enjoy contemplative, emotional piano atmosphere

### For Developers: Adding More MIDI Files

1. **Upload MIDI file** to `src/assets/midi/your-song.mid`

2. **Parse MIDI data**:
   ```bash
   # Edit scripts/parseMidi.js to point to new file
   npm run parse:midi
   ```

3. **Separate bass/treble**:
   ```bash
   # Edit scripts/separateRiversFlowNotes.js for new file
   node scripts/separateRiversFlowNotes.js
   ```

4. **Copy arrays** from terminal output to `audioService.ts`:
   ```typescript
   private readonly yourSongBass = [freq1, freq2, ...];
   private readonly yourSongMelody = [freq1, freq2, ...];
   ```

5. **Add mood config**:
   ```typescript
   'your-song-mood': {
     baseFrequency: 440,  // Adjust to song key
     tempo: 120,          // BPM from MIDI
     volume: 0.45,
     waveform: 'sine',
   }
   ```

6. **Update type definitions**:
   - `backend/src/types/index.ts`: Add to Mood type
   - `backend/src/models/FocusSession.ts`: Add to mood enum
   - `backend/src/models/WeeklySummary.ts`: Add to dominantMood enum

7. **Add UI button** in `src/components/ControlPanel.tsx`

## Benefits of Bass/Treble Separation

1. **Harmonic Foundation**: Bass provides tonal center and grounding
2. **Interactive Melody**: Treble notes respond to user's rhythm
3. **Authentic Composition**: Preserves original musical structure
4. **Emotional Depth**: Bass adds richness without overwhelming
5. **Customizable**: Users control melody pace through typing speed

## Performance Considerations

- **Bass oscillators**: 1 active at a time (8-beat duration)
- **Melody oscillators**: 1 per interaction (0.6s duration)
- **Memory**: 107 total frequencies (7 bass + 100 melody)
- **CPU**: Minimal - Web Audio API handles synthesis
- **Cleanup**: All intervals cleared in `stop()` method

## Future Enhancements

- [ ] Add velocity mapping from MIDI to note volume
- [ ] Implement timing data for auto-play mode
- [ ] Add more MIDI-based moods (classical, ambient, etc.)
- [ ] Support chord voicings for richer harmony
- [ ] Allow user tempo adjustment (stretch/compress MIDI timing)

---

**Implemented**: October 18, 2025
**MIDI Source**: Yiruma - "Rivers Flow In You"
**Separation Threshold**: C3 (MIDI 48, 130.81 Hz)
