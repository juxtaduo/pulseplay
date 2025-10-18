# 🔍 Debugging: No Mood/Instrument Sounds

## ✅ What We Know
- **Test tone works** (440Hz sine wave plays perfectly)
- **Web Audio API is functional**
- **AudioContext can resume and play sound**
- **Problem**: Mood-based ambient music and instrument sounds not playing

## 🎯 Root Cause Investigation

I've added **extensive logging** throughout the audio pipeline to diagnose exactly where the audio is failing.

---

## 📋 Debugging Steps

### Step 1: Reload Browser
```bash
Ctrl + Shift + R  (hard refresh)
```

### Step 2: Open Console
```bash
F12 → Console tab
```

### Step 3: Start a Session

1. Select "Deep Focus" mood
2. Click "Start Focus Session"
3. **Watch the console logs carefully**

---

## 🔎 Expected Console Logs

### Part 1: Session Start (Ambient Music)

You should see these messages when clicking "Start Focus Session":

```javascript
// Audio engine initialization
[AudioEngine] Start called - AudioContext state: suspended
[AudioEngine] Resuming suspended AudioContext...
[AudioEngine] AudioContext resumed, state: running  ← MUST BE "running"
[AudioEngine] Config for mood: deep-focus { baseFrequency: 440, volume: 1, ... }

// Oscillator creation
[AudioEngine] createOscillator: 440Hz sine wave, gain=0.3
[AudioEngine] Stored gain node reference on oscillator
[AudioEngine] Created base oscillator: 440Hz

[AudioEngine] createOscillator: 660Hz sine wave, gain=0.2
[AudioEngine] Stored gain node reference on oscillator
[AudioEngine] Created harmony oscillator: 660Hz

[AudioEngine] createOscillator: 220Hz sine wave, gain=0.15
[AudioEngine] Stored gain node reference on oscillator
[AudioEngine] Created bass oscillator: 220Hz

// Filter creation
[AudioEngine] Created lowpass filter at 800Hz

// Audio graph connections (CRITICAL!)
[AudioEngine] Oscillator 1 - gainNode exists: true  ← MUST BE true
[AudioEngine] ✅ Connected oscillator 1 gain → filter
[AudioEngine] Oscillator 2 - gainNode exists: true  ← MUST BE true
[AudioEngine] ✅ Connected oscillator 2 gain → filter
[AudioEngine] Oscillator 3 - gainNode exists: true  ← MUST BE true
[AudioEngine] ✅ Connected oscillator 3 gain → filter
[AudioEngine] Total connections: 3/3  ← MUST BE 3/3
[AudioEngine] ✅ Connected filter → master gain → destination

// Volume ramp
[AudioEngine] Master gain ramping from 0 to 1 over 1 second
[AudioEngine] Current master gain value: 0

// Oscillator start
[AudioEngine] Started oscillator 1: sine 440Hz
[AudioEngine] Started oscillator 2: sine 660Hz
[AudioEngine] Started oscillator 3: sine 220Hz
[AudioEngine] ✅ Started ambient music for mood: deep-focus
[AudioEngine] Total oscillators: 3
[AudioEngine] AudioContext state: running
```

### Part 2: Typing (Instrument Sounds)

After starting the session, **type on your keyboard**. You should see:

```javascript
// Every keystroke
[useRhythmDetection] Keystroke detected, total: 1
[useRhythmDetection] Instrumental sounds enabled, instruments: ['piano', 'bass']  ← Your selected instruments
[useRhythmDetection] Playing instrument: piano, freq=440Hz, vel=0.7

// AudioEngine plays the note
[AudioEngine] playInstrumentNote called: Piano, 440Hz, vel=0.7, dur=1.1s
[AudioEngine] Created instrument oscillator: sine at 440Hz
[AudioEngine] ✅ Connected instrument: oscillator → gain → masterGain
[AudioEngine] ✅ Instrument note playing for 1.20s
[AudioEngine] Started 2 harmonic oscillators
```

---

## 🚨 Problem Scenarios

### Scenario 1: No Logs at All

**If you see NO console logs** when starting a session:

**Diagnosis**: JavaScript not loading or error earlier in code

**Check**:
1. Browser console for red error messages
2. Network tab for failed file loads
3. Try hard refresh (Ctrl+Shift+R)

---

### Scenario 2: `gainNode exists: false`

**If you see**:
```javascript
[AudioEngine] Oscillator 1 - gainNode exists: false  ← ❌
```

**Diagnosis**: TypeScript `@ts-ignore` not working, custom property lost

**This means**: The `_gainNode` property isn't being attached to the oscillator

**Fix**: The oscillator is being created but the gain node reference is lost. This is a critical bug I need to fix.

---

### Scenario 3: `Total connections: 0/3`

**If you see**:
```javascript
[AudioEngine] Total connections: 0/3  ← ❌
```

**Diagnosis**: Gain nodes not connecting to filter

**This means**: Audio graph is broken, no sound will play

---

### Scenario 4: `AudioContext state: suspended`

**If you see**:
```javascript
[AudioEngine] AudioContext state: suspended  ← STAYS SUSPENDED
```

**Diagnosis**: Browser blocked auto-resume

**Fix**: Manually resume in console:
```javascript
const ctx = new (window.AudioContext || window.webkitAudioContext)();
await ctx.resume();
console.log('State:', ctx.state);  // Should be 'running'
```

---

### Scenario 5: All Logs Present, But No Sound

**If you see**:
- ✅ `AudioContext state: running`
- ✅ `Total connections: 3/3`
- ✅ `Started oscillator 1/2/3`
- ✅ `Master gain ramping from 0 to 1`

**But still no sound**...

**Diagnosis**: This is bizarre. The audio graph is complete and running.

**Possible causes**:
1. **Master gain stuck at 0**: Check the actual gain value after 2 seconds:
   ```javascript
   // Run in console after session starts:
   setTimeout(() => {
     const ctx = new (window.AudioContext || window.webkitAudioContext)();
     // We need access to the AudioEngine instance to check masterGain
     console.log('AudioContext time:', ctx.currentTime);
   }, 2000);
   ```

2. **Filter cutting all frequencies**: 800Hz lowpass might be too aggressive
   
3. **Oscillators not actually starting**: Rare Web Audio API bug

---

### Scenario 6: No Instrument Logs When Typing

**If you type but see NO instrument logs**:

**Check these messages**:
```javascript
[useRhythmDetection] Keystroke detected, total: X  ← Should appear
[useRhythmDetection] Instrumental sounds DISABLED  ← If you see this
[useRhythmDetection] No instruments selected  ← Or this
```

**Diagnosis**:
- `Instrumental sounds DISABLED`: You haven't selected any instruments
- `No instruments selected`: You need to toggle instruments in the UI

**Fix**:
1. Click on instrument buttons (Piano, Bass, Hi-Hat, Snare)
2. They should turn blue/highlighted when selected
3. Try typing again

---

## 🐛 Common Issues

### Issue 1: "Skipped note (throttled)"

**If you see**:
```javascript
[useRhythmDetection] Skipped note (throttled)
```

**Diagnosis**: You're typing too fast (< 50ms between keystrokes)

**This is normal**: Rapid typing throttling prevents audio glitches

**Try**: Type slower (one key every ~100ms)

---

### Issue 2: Instrument Logs But No Sound

**If you see**:
```javascript
[AudioEngine] playInstrumentNote called: Piano, 440Hz, ...
[AudioEngine] ✅ Instrument note playing for 1.20s
```

**But no sound...**

**Diagnosis**: Instrument gain is too low OR master gain is 0

**Check**: Verify master gain is ramping up:
```javascript
// After 2 seconds, master gain should be at 1.0 (100%)
[AudioEngine] Master gain ramping from 0 to 1 over 1 second
```

---

## 📊 What to Share

Please copy and paste **ALL console logs** starting from when you click "Start Focus Session" and share them.

### Critical Info Needed:

1. **Session Start Logs**:
   - AudioContext state (running vs suspended)?
   - gainNode exists: true or false?
   - Total connections: X/3?

2. **Typing Logs** (if applicable):
   - Keystroke detected?
   - Instrumental sounds enabled?
   - playInstrumentNote called?

3. **Any Error Messages** (red text in console)

---

## 🔧 Temporary Workarounds

### Workaround 1: Remove Filter (Test)

If you want to test without the lowpass filter, try this in console:

```javascript
// This bypasses the filter to test if it's blocking sound
// (Cannot do this easily without modifying code)
```

### Workaround 2: Force Higher Gain

If master gain seems too low, we can boost it:
```typescript
// In audioService.ts, change:
gain.gain.setValueAtTime(gainValue, this.ctx.currentTime);
// To:
gain.gain.setValueAtTime(gainValue * 3, this.ctx.currentTime);  // 3x boost
```

---

## 🎯 Next Steps

1. **Reload browser** (Ctrl+Shift+R)
2. **Open console** (F12)
3. **Start session** → watch logs
4. **Type** (if instruments selected) → watch logs
5. **Copy ALL logs** and share them with me

The logs will reveal exactly where the audio pipeline is breaking! 🔍
