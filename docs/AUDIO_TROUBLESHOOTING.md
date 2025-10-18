# Audio Troubleshooting Guide - Deep Dive

## Changes Made

### 1. Fixed Audio Graph Connections ✅
**File**: `src/services/audioService.ts`
- Fixed gain node connections in audio graph
- Added comprehensive console logging throughout audio pipeline

### 2. Updated Rhythm Score Threshold ✅
**File**: `src/hooks/useRhythmDetection.ts`
- **50 keys/min = MEDIUM** intensity (was 40)
- **80+ keys/min = HIGH** intensity (was 70)
- **<50 keys/min = LOW** intensity

New thresholds:
```
LOW:    0-49 keys/min
MEDIUM: 50-79 keys/min  ← You requested this change
HIGH:   80+ keys/min
```

### 3. Enhanced Audio Logging ✅
Added detailed console logs to track audio initialization and playback.

---

## Diagnostic Steps

### Step 1: Check Browser Console

**Open DevTools** (F12) and look for these messages:

#### ✅ Success Pattern:
```
[AudioContext] Created new AudioContext
[AudioEngine] Constructor - AudioContext state: suspended
[AudioEngine] Constructor - Master gain connected to destination
[useAudioEngine] Audio engine initialized
[useAudioEngine] Starting audio for mood: deep-focus
[AudioEngine] Start called - AudioContext state: suspended
[AudioEngine] Resuming suspended AudioContext...
[AudioEngine] AudioContext resumed, state: running
[AudioEngine] Config for mood: deep-focus { baseFrequency: 160, ... }
[AudioEngine] Master gain ramping from 0 to 0.3 over 1 second
[AudioEngine] Started oscillator 1: sine 160Hz
[AudioEngine] Started oscillator 2: sine 240Hz
[AudioEngine] Started oscillator 3: sine 80Hz
[AudioEngine] ✅ Started ambient music for mood: deep-focus
[AudioEngine] Total oscillators: 3
[AudioEngine] AudioContext state: running
[useAudioEngine] Setting volume after start: 0.5
[AudioEngine] Volume set to 50%
[useAudioEngine] ✅ Started audio for mood: deep-focus
```

#### ❌ Error Patterns to Look For:

**Pattern 1: AudioContext Not Allowed**
```
DOMException: The AudioContext was not allowed to start
```
**Fix**: This is browser autoplay policy. Click "Start Focus Session" again.

**Pattern 2: AudioContext Suspended**
```
[AudioEngine] AudioContext state: suspended
```
(without "Resuming suspended AudioContext" message)
**Fix**: Browser blocked auto-resume. Manually call `resume()` in console:
```javascript
// In browser console:
(async () => {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  console.log('Before resume:', ctx.state);
  await ctx.resume();
  console.log('After resume:', ctx.state);
})();
```

**Pattern 3: No Oscillators Started**
```
[AudioEngine] Total oscillators: 0
```
**Fix**: Critical bug - oscillators not being created. Report this issue.

**Pattern 4: Master Gain Stuck at 0**
```
[AudioEngine] Current master gain value: 0
```
(and stays at 0 even after ramp)
**Fix**: Timing issue with AudioContext. Try stopping and starting again.

---

### Step 2: Manual Audio Test

Copy and paste this into the browser console:

```javascript
// Test 1: Create AudioContext
const ctx = new (window.AudioContext || window.webkitAudioContext)();
console.log('AudioContext state:', ctx.state);

// Test 2: Resume if suspended
if (ctx.state === 'suspended') {
  await ctx.resume();
  console.log('Resumed, new state:', ctx.state);
}

// Test 3: Create simple oscillator
const osc = ctx.createOscillator();
const gain = ctx.createGain();
osc.connect(gain);
gain.connect(ctx.destination);

// Test 4: Set gain and start
gain.gain.setValueAtTime(0.3, ctx.currentTime);
osc.frequency.setValueAtTime(440, ctx.currentTime); // A4 note
osc.type = 'sine';
osc.start();

// You should hear a 440Hz sine wave (musical note A)
// If you hear this, Web Audio API works!

// Test 5: Stop after 2 seconds
setTimeout(() => {
  osc.stop();
  console.log('✅ Audio test complete - you should have heard a tone!');
}, 2000);
```

**Expected**: You should hear a 2-second pure tone at 440Hz.

**If you hear the test tone**: Web Audio API works, bug is in PulsePlay code.
**If you don't hear the test tone**: Browser/system audio issue.

---

### Step 3: Check System Audio

#### Windows:
1. Right-click speaker icon in taskbar
2. Open Volume Mixer
3. Check if browser is muted
4. Verify output device is correct

#### Mac:
1. System Preferences → Sound → Output
2. Check output device (internal speakers / headphones)
3. Test with test sound

#### Linux:
1. Check PulseAudio: `pactl info`
2. Check ALSA: `alsamixer`
3. Test audio: `speaker-test -t wav -c 2`

---

### Step 4: Browser-Specific Checks

#### Chrome / Edge:
1. Go to `chrome://settings/content/sound`
2. Make sure "Sites can play sound" is enabled
3. Check site-specific permissions: `chrome://settings/content/all?search=localhost`

#### Firefox:
1. Go to `about:preferences#privacy`
2. Under "Autoplay", set to "Allow Audio and Video"
3. Or set "Block audio" → "Allow for localhost"

#### Safari:
1. Safari → Settings → Websites → Auto-Play
2. Set "Allow All Auto-Play" for localhost

---

### Step 5: Check Audio Routing

Sometimes audio gets routed to the wrong device:

```javascript
// In browser console - check available audio outputs
navigator.mediaDevices.enumerateDevices().then(devices => {
  const audioOutputs = devices.filter(d => d.kind === 'audiooutput');
  console.log('Available audio outputs:', audioOutputs);
  audioOutputs.forEach((device, i) => {
    console.log(`${i}: ${device.label} (${device.deviceId})`);
  });
});
```

---

## Common Issues & Solutions

### Issue 1: "I see console logs but no sound"

**Cause**: AudioContext is running, oscillators are started, but:
- Volume might be ramping up too slowly
- Master gain might be stuck at 0
- Audio output device might be wrong

**Fix**:
```javascript
// In browser console while session is playing:
// Get the AudioContext
const ctx = new AudioContext();
console.log('Current time:', ctx.currentTime);
console.log('State:', ctx.state);

// Check destination (speakers)
console.log('Destination:', ctx.destination);
console.log('Max channels:', ctx.destination.maxChannelCount);
```

### Issue 2: "AudioContext state is 'suspended'"

**Cause**: Browser autoplay policy blocking audio

**Fix**:
1. Stop the session
2. Click "Start Focus Session" again (user gesture required)
3. If still suspended, manually resume:
```javascript
// In browser console:
const ctx = new (window.AudioContext || window.webkitAudioContext)();
await ctx.resume();
console.log('Resumed to state:', ctx.state);
```

### Issue 3: "Oscillators start but volume is 0"

**Cause**: Master gain not ramping up correctly

**Fix**:
```javascript
// While session is playing, force set volume in console:
// (This is a workaround, not a permanent fix)
const ctx = new AudioContext();
const gain = ctx.createGain();
gain.connect(ctx.destination);
gain.gain.setValueAtTime(0.5, ctx.currentTime);
```

### Issue 4: "Console shows 'running' but still no sound"

**Possible causes**:
1. Audio routing to wrong device (Bluetooth headphones disconnected?)
2. Browser tab muted (check speaker icon in tab)
3. System audio muted
4. Audio driver issue

**Fix**: Try the manual audio test from Step 2 above.

---

## Advanced Debugging

### Check Web Audio API Support

```javascript
// Check if Web Audio API is supported
if (window.AudioContext || window.webkitAudioContext) {
  console.log('✅ Web Audio API supported');
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  console.log('Sample rate:', ctx.sampleRate, 'Hz');
  console.log('Base latency:', ctx.baseLatency, 'seconds');
  console.log('Output latency:', ctx.outputLatency, 'seconds');
} else {
  console.log('❌ Web Audio API NOT supported');
}
```

### Inspect Audio Graph

```javascript
// While session is playing, inspect the audio graph:
// (This requires access to the AudioEngine instance)
// You can add this as a temporary method in audioService.ts:

public debugAudioGraph() {
  console.log('=== Audio Graph Debug ===');
  console.log('AudioContext state:', this.ctx.state);
  console.log('Master gain value:', this.masterGain.gain.value);
  console.log('Master gain connected:', this.masterGain.numberOfOutputs > 0);
  console.log('Total oscillators:', this.oscillators.length);
  console.log('Total filters:', this.filters.length);
  console.log('Is playing:', this.isPlaying);
  console.log('Current mood:', this.currentMood);
  
  this.oscillators.forEach((osc, i) => {
    console.log(`Oscillator ${i}:`, {
      type: osc.type,
      frequency: osc.frequency.value,
      // @ts-ignore
      gainValue: osc._gainNode?.gain.value
    });
  });
}
```

---

## Workaround: Force Louder Volume

If audio is playing but too quiet, try this:

### Option 1: Increase Config Volume
Edit `src/services/audioService.ts`:

```typescript
const MOOD_CONFIGS: Record<Mood, AudioConfig> = {
  'deep-focus': {
    baseFrequency: 160,
    tempo: 60,
    volume: 0.8, // ← Changed from 0.3 to 0.8
    waveform: 'sine',
  },
  // ... repeat for all moods
};
```

### Option 2: Boost Master Gain
Edit `src/services/audioService.ts` in the `start()` method:

```typescript
// Change this line:
this.masterGain.gain.linearRampToValueAtTime(
  config.volume * 2, // ← Multiply by 2 for 2x volume boost
  now + 1,
);
```

---

## Report Issue

If none of these steps work, please provide:

1. **Browser**: Name and version (e.g., Chrome 118, Firefox 119)
2. **OS**: Windows 11, macOS 14, Ubuntu 22.04, etc.
3. **Console logs**: Copy all `[AudioEngine]` and `[useAudioEngine]` messages
4. **Manual test result**: Did the 440Hz test tone work? (Yes/No)
5. **AudioContext state**: Run this in console and share output:
```javascript
const ctx = new (window.AudioContext || window.webkitAudioContext)();
console.log({
  state: ctx.state,
  sampleRate: ctx.sampleRate,
  baseLatency: ctx.baseLatency,
  currentTime: ctx.currentTime
});
```

---

## Next Steps

1. **Reload the browser** (Ctrl+Shift+R)
2. **Open DevTools** (F12) → Console tab
3. **Start a focus session** and watch the console logs
4. **Share the console output** if you still don't hear sound

The extensive logging I added will help us identify exactly where the audio pipeline is breaking!
