# Gurenge Mood Implementation

## Overview
**Gurenge** (紅蓮華) - The opening theme from the anime "Demon Slayer: Kimetsu no Yaiba" by LiSA. This is a fast-paced, energetic anime opening integrated as the 7th mood in PulsePlay AI.

**Status**: ✅ **Fully Implemented**
**Implementation Date**: October 19, 2025
**MIDI Source**: Demon Slayer - Gurenge.mid (Korean piano arrangement)

---

## Technical Specifications

### Audio Characteristics
- **Tempo**: 135 BPM (fastest mood in the system)
- **Character**: Energetic, dynamic anime opening theme
- **Key Center**: C4 (262 Hz)
- **Duration**: ~231 seconds (3 minutes 51 seconds)
- **Time Signature**: 4/4
- **Waveform**: Sine wave (piano-like tone)
- **Volume**: 45% (0.45)

### MIDI Data Statistics
- **Total Notes**: 2,700 notes (largest MIDI file in PulsePlay)
- **Background Notes (< C4)**: 1,158 notes (43%)
  - **Frequency Range**: 61.74 Hz (B1) - 246.94 Hz (B3)
  - **Purpose**: Continuous bass rhythm foundation
- **Melody Notes (≥ C4)**: 1,542 notes (57%)
  - **Frequency Range**: 261.63 Hz (C4) - 1567.98 Hz (G6)
  - **Purpose**: Keystroke and mouse-triggered melodic responses

### Comparison with Other Moods
| Mood | BPM | Total Notes | Background | Melody | Tempo Style |
|------|-----|-------------|------------|--------|-------------|
| Kiss The Rain | 58 | 1,104 | 341 (31%) | 763 (69%) | Slow, emotional |
| River Flows | 65 | 840 | 211 (25%) | 629 (75%) | Slow, flowing |
| A Thousand Years | 75 | 892 | 614 (69%) | 278 (31%) | Romantic ballad |
| **Gurenge** | **135** | **2,700** | **1,158 (43%)** | **1,542 (57%)** | **Fast, energetic** |

---

## Implementation Details

### 1. MIDI Parsing
**Script**: `scripts/parseGurenge.js`
- Uses `@tonejs/midi` v2.0.28 to parse MIDI file
- Separates notes at C4 threshold (261.63 Hz, MIDI note 60)
- Converts MIDI note numbers to frequencies using formula: `freq = 440 × 2^((midi - 69) / 12)`

### 2. Frequency Arrays
**File**: `src/services/audioService.ts`

```typescript
// Background bass (< C4) - 1,158 frequencies
private readonly gurengeBass = [130.81, 196, 130.81, 146.83, 220, ...];

// Melody notes (≥ C4) - 1,542 frequencies
private readonly gurengeMelody = [783.99, 523.25, 659.26, 261.63, ...];
```

### 3. Mood Configuration
```typescript
'gurenge': {
  baseFrequency: 262, // Hz - C4 (Demon Slayer key)
  tempo: 135, // BPM - fast, energetic anime opening (from MIDI)
  volume: 0.45, // 45% volume - dynamic anime theme
  waveform: 'sine',
}
```

### 4. Audio Engine Integration
**Method: `startMidiBass`**
```typescript
else if (mood === 'gurenge') {
  bassNotes = this.gurengeBass;
}
```

**Method: `getNextMidiNote`**
```typescript
else if (this.currentMood === 'gurenge') {
  melodyNotes = this.gurengeMelody;
}
```

### 5. UI Integration
**Control Panel** (`src/components/ControlPanel.tsx`):
```typescript
{ 
  value: 'gurenge', 
  label: 'Gurenge', 
  description: 'Demon Slayer opening, 135 BPM' 
}
```

**Session History** (`src/pages/SessionHistory.tsx`):
```typescript
'gurenge': 'bg-orange-500/20 text-orange-400 border-orange-500/30'
```

### 6. Backend Type System
**Files Updated**:
- `backend/src/types/index.ts`: Added `'gurenge'` to `Mood` type
- `backend/src/models/FocusSession.ts`: Added to mood enum
- `backend/src/models/WeeklySummary.ts`: Added to dominantMood enum

---

## User Experience

### Behavior
1. **Bass Layer**: Plays continuous, energetic bass rhythm from `gurengeBass` array at 135 BPM
2. **Melody Layer**: Each keystroke or mouse click triggers next note from `gurengeMelody` array
3. **Rhythm Pattern**: Fast tempo creates driving, motivational atmosphere
4. **Visual Feedback**: Orange color scheme in UI indicates energetic character

### Use Cases
- **High-energy coding sessions**: Fast tempo boosts energy and focus
- **Anime fans**: Nostalgic connection to Demon Slayer series
- **Motivation boost**: Uplifting melody fights coding fatigue
- **Flow state**: Consistent rhythm helps maintain concentration

---

## Sample Note Sequences

### Background Bass Pattern (First 20 notes)
```
C3 (130.81Hz), G3 (196Hz), C3, D3 (146.83Hz), A3 (220Hz), D3, 
E3 (164.81Hz), B3 (246.94Hz), E3, D3, A3, C2 (65.41Hz), C3, C3, 
G3, B3, D3, A3, F#2 (82.41Hz), E3
```

### Melody Pattern (First 20 notes)
```
G5 (783.99Hz), C5 (523.25Hz), E5 (659.26Hz), C4 (261.63Hz), 
F#5 (739.99Hz), G5, C4, E4 (329.63Hz), G5, A4 (440Hz), 
D5 (587.33Hz), D4 (293.66Hz), F#5, G5, D4, F#4 (369.99Hz), 
B4 (493.88Hz), G5, G4 (392Hz), B4
```

---

## Testing

### Manual Testing Checklist
- [ ] Gurenge appears in mood selection dropdown
- [ ] Bass layer plays continuously at 135 BPM (fast tempo)
- [ ] Each keystroke triggers melody note from correct array
- [ ] Orange color displays in session history
- [ ] Audio maintains balance between bass and melody
- [ ] No audio glitches or stuttering at fast tempo
- [ ] Mood switches properly from other moods to Gurenge

### Performance Considerations
- **Large Array Size**: 2,700 notes is the largest dataset, but arrays are pre-loaded
- **Memory Impact**: ~21KB for both arrays combined (negligible)
- **Fast Tempo**: 135 BPM requires precise timing intervals
- **Audio Buffer**: Web Audio API handles scheduling efficiently

---

## Future Enhancements

### Potential Improvements
1. **Dynamic Volume**: Adjust volume based on melody note range
2. **Percussion Layer**: Add drum samples for authentic anime opening feel
3. **Tempo Variations**: Implement tempo changes from original song
4. **Visual Effects**: Sync visual animations with 135 BPM rhythm
5. **Extended Arrangement**: Parse full 4-minute version with vocals removed

### Other Anime Themes to Consider
- "Unravel" (Tokyo Ghoul) - 145 BPM
- "Silhouette" (Naruto Shippuden) - 152 BPM
- "Again" (Fullmetal Alchemist) - 160 BPM
- "The Day" (My Hero Academia) - 128 BPM

---

## Related Documentation
- [MIDI Mood Architecture](./MIDI_MOOD_ARCHITECTURE.md)
- [Audio Service API](./AUDIO_SERVICE_API.md)
- [MIDI Parsing Guide](./MIDI_PARSING_GUIDE.md)

---

## Credits
- **Original Song**: "紅蓮華" (Gurenge) by LiSA
- **Anime**: Demon Slayer: Kimetsu no Yaiba (鬼滅の刃)
- **MIDI Arrangement**: Piano arrangement (피아노, RH)
- **Implementation**: PulsePlay AI Development Team
- **Integration Date**: October 19, 2025
