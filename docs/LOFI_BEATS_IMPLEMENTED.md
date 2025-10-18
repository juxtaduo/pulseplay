# 🎵 Lofi Hip-Hop Beats Implementation

## Overview
Replaced simple ambient oscillators with a full lofi hip-hop beat engine inspired by classic lofi study music (like the YouTube link provided).

---

## 🎹 Features Implemented

### 1. **Drum Loop**
- **Kick Drum**: Deep sine wave (60Hz → 40Hz) on beats 1 and 3
- **Snare Drum**: White noise + tonal component (200Hz) on beats 2 and 4
- **Hi-Hat**: Filtered white noise (7kHz highpass) on every beat
- **Pattern**: Classic 4/4 hip-hop drum pattern

### 2. **Jazz Chord Progression**
- **Chords**: Cm7 → Fm7 → Bbmaj7 → Ebmaj7 (C minor key)
- **Voicing**: 4-note jazz chords with warm triangle waves
- **Filtering**: 800Hz lowpass for lofi warmth
- **Duration**: 4 beats per chord (matches tempo)

### 3. **Walking Bass Line**
- **Notes**: C2 → F2 → Bb1 → Eb2 (following chord progression)
- **Sound**: Deep sine wave with plucky envelope
- **Duration**: 2 beats per note

### 4. **Vinyl Crackle**
- **Type**: Pink noise (1/f noise) for authentic vinyl texture
- **Filtering**: 3kHz lowpass to remove harsh highs
- **Volume**: Very subtle (2% gain) for background texture

---

## 🎛️ Audio Signal Flow

```
Kick/Snare/HiHat → masterGain → destination
Chords → lowpass filter (800Hz) → masterGain → destination
Bass → masterGain → destination
Vinyl Noise → lowpass filter (3kHz) → masterGain → destination
```

---

## 🎚️ Tempo-Based Timing

Each mood has different tempo (BPM):
- **Deep Focus**: 60 BPM (slow, meditative)
- **Creative Flow**: 80 BPM (moderate, flowing)
- **Calm Reading**: 50 BPM (very slow)
- **Energized Coding**: 100 BPM (faster, driving)

All elements sync to the tempo:
- Drum beats: Every beat (4/4 time)
- Chords: Every 4 beats
- Bass notes: Every 2 beats

---

## 🔧 Technical Implementation

### Audio Synthesis
- **Kick**: Exponential frequency sweep (60Hz → 40Hz)
- **Snare**: White noise + triangle wave (200Hz)
- **Hi-Hat**: Highpass filtered white noise
- **Chords**: Triangle wave oscillators with soft attack/release
- **Bass**: Sine wave with plucky envelope

### Scheduling
- **Drum Loop**: `setInterval` for recurring beats
- **Chords/Bass**: Recursive `setTimeout` for overlapping notes

### Cleanup
- Stop drum interval on session end
- Stop vinyl noise buffer
- Proper fadeout on all elements

---

## 🎨 Lofi Aesthetic

**Characteristics**:
- ✅ Warm, filtered sound (lowpass filters)
- ✅ Jazz chord progressions
- ✅ Hip-hop drum patterns
- ✅ Deep bass lines
- ✅ Vinyl crackle texture
- ✅ Tempo variations by mood

**NOT Implemented** (too complex for Web Audio API):
- ❌ Audio samples (would need .mp3 files)
- ❌ Vinyl wow/flutter (pitch modulation)
- ❌ Tape saturation/distortion
- ❌ Reverb (would add complexity)

---

## 🧪 Testing

1. **Reload page**
2. **Select any mood** (each has different tempo)
3. **Listen for**:
   - Kick/snare/hi-hat drum pattern
   - Jazz chords changing every 4 beats
   - Deep bass line
   - Subtle vinyl crackle

**Expected Sound**: Similar to classic lofi hip-hop study beats, with warm, filtered tones and relaxed drum patterns.

---

## 📊 Volume Levels

- **Kick**: 80% gain (punchy but not overpowering)
- **Snare**: 30% noise + 10% tone
- **Hi-Hat**: 15% gain (subtle, crisp)
- **Chords**: 8% gain per note (soft, atmospheric)
- **Bass**: 15% gain (present but not boomy)
- **Vinyl Noise**: 2% gain (barely noticeable texture)

All controlled by master gain (40-60% depending on mood).

---

## 🚀 Next Steps (Optional Enhancements)

1. **Add more chord progressions** (vary by mood)
2. **Randomize drum patterns** (add variation)
3. **Add swing** (delay hi-hats slightly for groove)
4. **Add lead melodies** (simple pentatonic scales)
5. **Add pitch wobble** (vinyl flutter effect)

---

## 🐛 Known Limitations

- **CPU Usage**: More intensive than simple oscillators
- **Timing**: JavaScript timing not perfect (small drift over time)
- **No Samples**: All sounds are synthesized (no real drum samples)
- **No Effects**: No reverb, delay, or compression

---

## ✅ Fixed Issues

**Critical Bug Fixed**: `masterGain` was not properly connected to `ctx.destination`. Now we force a reconnection at the start of each session:

```typescript
this.masterGain.disconnect();
this.masterGain.connect(this.ctx.destination);
```

This ensures audio always flows through the master gain to the speakers!
