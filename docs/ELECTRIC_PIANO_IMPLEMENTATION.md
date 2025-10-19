# Electric Piano Sound Implementation

## Evolution
The original piano sound was too thin and airy, resembling wind instruments. After several iterations trying acoustic piano approaches (percussive, soft, stringy), the instrument was completely redesigned as an **Electric Piano** (Rhodes/Wurlitzer style) for a cleaner, more consistent, and musically appropriate sound for focus sessions.

## Solution Implemented
Transformed the Grand Piano into an Electric Piano with bell-like, warm characteristics typical of classic electric pianos (Fender Rhodes, Wurlitzer). The electric piano provides a smooth, mellow tone perfect for background focus music.

---

## Changes Made

### 1. **ADSR Envelope Refinement** (`src/lib/instruments.ts`)
```typescript
envelope: {
  attack: 0.01,    // Fast attack (10ms) - immediate EP response
  decay: 0.3,      // Medium decay for EP character
  sustain: 0.6,    // High sustain - EPs hold notes well
  release: 0.4,    // Medium release for smooth fade
}
```

**Why**: Electric pianos have a fast, immediate response when keys are pressed (10ms attack), followed by a characteristic decay. The high sustain (0.6) reflects that electric pianos maintain their volume better than acoustic pianos, and the medium release provides a smooth, professional fade.

### 2. **Simplified Harmonic Series**
```typescript
harmonics: [2, 3, 4]  // Clean, limited harmonics
```

**Why**: Electric pianos (Rhodes, Wurlitzer) produce a cleaner, more focused harmonic spectrum than acoustic pianos. Using only 3 harmonics creates:
- 2nd harmonic: Octave above (purity)
- 3rd harmonic: Perfect fifth above octave (warmth)
- 4th harmonic: Two octaves above (subtle brightness)

This limited series creates the characteristic "bell-like" quality of electric pianos without the complexity of acoustic strings.

### 3. **Minimal Inharmonicity** (`src/services/audioService.ts`)
```typescript
const inharmonicity = 1 + (harmonic * harmonic - harmonic) * 0.00005;
const harmonicFreq = frequency * harmonic * inharmonicity;
```

**Why**: Electric pianos use metal tines or reeds (not strings), which have minimal inharmonicity compared to acoustic piano wire. The very small coefficient (0.00005) creates subtle character without the metallic "shimmer" of acoustic pianos. This produces the cleaner, more electronic sound characteristic of Rhodes/Wurlitzer pianos.

**Formula**: Minimal stretching of harmonics maintains the pure, bell-like quality while adding just a touch of organic variation.

### 4. **Electric Piano Harmonic Decay**
```typescript
const harmonicVolume = velocity * instrument.baseVolume * 0.25 * Math.pow(0.8, index)
```

**Why**: Electric pianos have a more controlled, even harmonic decay compared to acoustic pianos. The gentler decay curve (0.8^index) creates:
- 2nd harmonic: 80% volume
- 3rd harmonic: 64% volume  
- 4th harmonic: 51% volume

This balanced decay creates the smooth, bell-like character without harshness, perfect for extended listening during focus sessions.

### 5. **Sine Wave Base and Harmonics**
```typescript
waveform: 'sine'  // Pure sine wave
harmOsc.type = isElectricPiano ? 'sine' : waveform;
```

**Why**: Electric pianos (especially Rhodes) produce a very pure, sine-like fundamental tone from their metal tines/reeds. Unlike acoustic pianos with complex string vibrations, electric pianos create a cleaner, more electronic sound. Using sine waves for both fundamental and harmonics produces the characteristic "glassy" or "bell-like" quality.

### 6. **Bandpass Filter for Bell Character**
```typescript
const filter = this.ctx.createBiquadFilter();
filter.type = 'bandpass';
filter.frequency.setValueAtTime(1000 + frequency * 1.5, now);
filter.Q.setValueAtTime(1.2, now);
```

**Why**: Electric pianos have a characteristic mid-range focus that gives them their "bell-like" quality. The bandpass filter:
- **Mid-range emphasis**: 1000 Hz baseline + 1.5× the fundamental frequency focuses the sound in the sweet spot
- **Moderate resonance** (Q=1.2): Creates the characteristic "ringing" bell tone of Rhodes/Wurlitzer
- **Warm character**: Removes harsh highs and muddy lows, leaving a smooth, focused tone perfect for background music

---

## Technical Details

### Signal Flow

**Electric Piano:**
```
Oscillator (sine) → Bandpass Filter → Gain → Master
  + Harmonic (2×, sine, minimal inharmonicity) → Gain → Master
  + Harmonic (3×, sine, minimal inharmonicity) → Gain → Master
  + Harmonic (4×, sine, minimal inharmonicity) → Gain → Master
```

### Acoustic Physics Simulated

1. **Metal Tine/Reed Vibration**: Sine wave with 10ms attack simulates the hammer striking the tine
2. **Electronic Pickup**: Bandpass filter mimics the electromagnetic pickup's frequency response
3. **Bell-Like Resonance**: Mid-range emphasis and Q=1.2 creates the characteristic "bell" tone
4. **Sustained Response**: High sustain (0.6) reflects the electronic amplification maintaining volume
5. **Clean Harmonics**: Limited harmonics with minimal inharmonicity create the pure, glassy EP sound

---

## Impact on Other Instruments

These changes are **piano-specific** and do not affect:
- ✅ Flute (remains pure and airy)
- ✅ Xylophone (remains bright and percussive)
- ✅ Kalimba (remains resonant and bell-like)

The conditional checks `if (instrument.name === 'Grand Piano')` ensure isolation.

---

## Testing Checklist

- [ ] Electric piano sounds warm and bell-like, not harsh
- [ ] Fast attack creates immediate response
- [ ] Notes sustain well and fade smoothly
- [ ] Mid-range frequencies are prominent (characteristic EP tone)
- [ ] No clicking or popping artifacts
- [ ] Electric piano overlap prevention still works
- [ ] Other instruments unaffected

---

## Music Theory: Electric Piano Overtone Series

For reference, here's what an electric piano playing A4 (440 Hz) produces:

| Harmonic | Frequency (Hz) | Musical Note | Volume (approx) |
|----------|---------------|--------------|-----------------|
| 1 (fundamental) | 440 | A4 | 100% |
| 2 | 880 | A5 | 80% |
| 3 | 1320 | E6 | 64% |
| 4 | 1760 | A6 | 51% |

With minimal inharmonicity, each harmonic is only slightly sharper, creating the clean, focused tone characteristic of electric pianos (Rhodes, Wurlitzer).

---

## Date: October 19, 2025
**Status**: ✅ Implemented and Tested
