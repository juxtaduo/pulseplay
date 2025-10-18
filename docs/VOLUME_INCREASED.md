# Audio Volume Increased - Test Instructions

## ✅ Changes Made

### 1. **Baseline Volume Increased to 50%** (Your Request)

**Modified Files**:
- `src/hooks/useAudioEngine.ts` - Default volume now 50% (was 50%, confirmed)
- `src/services/audioService.ts` - All mood configs now 50% volume

**New Volume Levels**:
```typescript
deep-focus:       50% (was 30%)  ← +67% increase
creative-flow:    50% (was 40%)  ← +25% increase
calm-reading:     50% (was 25%)  ← +100% increase (2x louder!)
energized-coding: 50% (was 45%)  ← +11% increase
```

**Result**: All moods now start at **50% volume** by default.

---

### 2. **Added Audio Diagnostic Test Component** 🔧

**New Component**: `src/components/AudioTest.tsx`

**What it does**:
- Tests Web Audio API directly with a 440Hz tone
- Shows real-time console logs
- Helps diagnose if the issue is browser vs. app
- Displays detailed audio troubleshooting steps

**Location**: Shows on the home page when no session is playing

---

## 🧪 Testing Instructions

### Step 1: Reload Browser
```bash
Press Ctrl + Shift + R (hard refresh)
```

### Step 2: Use Audio Diagnostic Test

**You should now see a yellow diagnostic box** at the top of the page that says:
```
🔧 Audio Diagnostic Test
Can't hear PulsePlay audio? Test your browser's Web Audio API directly.
```

**Click "Play Test Tone (3 sec)"**

**Expected Results**:

#### ✅ If You Hear a 3-Second Beep:
```
✅ SUCCESS: AudioContext is running!
If you heard the tone, Web Audio API works.
```

**This means**:
- Your browser audio works
- Your system audio works
- Web Audio API is functional
- **The issue is in PulsePlay's audio code**

**Next step**: Share the diagnostic logs with me so I can fix the PulsePlay-specific issue.

#### ❌ If You DON'T Hear the Beep:

**Check These**:
1. **System Volume**: Not muted, turned up
2. **Browser Tab**: No mute icon (🔇) in the tab title
3. **Audio Output Device**: Correct speakers/headphones selected
4. **Browser Permissions**: Audio allowed for localhost

**In the diagnostic logs**, you should see:
```
[timestamp] 🔊 Starting direct audio test...
[timestamp] AudioContext created, state: suspended
[timestamp] AudioContext is suspended, resuming...
[timestamp] Resumed! New state: running  ← CRITICAL LINE
[timestamp] ✅ Oscillator started! You should hear a tone.
```

If you see `state: running` but still no sound, it's a system audio issue.

---

### Step 3: Test PulsePlay Audio (50% Volume)

After testing the diagnostic:

1. Select a mood (try "Energized Coding" - it's the loudest)
2. Click "Start Focus Session"
3. **Volume slider should be at 50%** by default
4. Wait 1 second for fade-in

**Expected**: You should hear ambient music at 50% volume (much louder than before!)

**If you still don't hear PulsePlay audio**:
- Open Browser Console (F12)
- Look for `[AudioEngine]` messages
- Copy and share them with me

---

## 📊 Volume Comparison

### Before (Old Volumes):
```
Deep Focus:       30% 🔉
Creative Flow:    40% 🔉🔉
Calm Reading:     25% 🔉
Energized Coding: 45% 🔉🔉
```

### After (New Volumes):
```
Deep Focus:       50% 🔊🔊🔊  ← 67% LOUDER
Creative Flow:    50% 🔊🔊🔊  ← 25% LOUDER
Calm Reading:     50% 🔊🔊🔊  ← 100% LOUDER (2x!)
Energized Coding: 50% 🔊🔊🔊  ← 11% LOUDER
```

All moods are now **significantly louder** by default!

---

## 🔍 What the Diagnostic Test Shows

The test logs will show:
```
[time] 🔊 Starting direct audio test...
[time] AudioContext created, state: suspended
[time] AudioContext is suspended, resuming...
[time] Resumed! New state: running
[time] Created oscillator and gain nodes
[time] Connected: Oscillator → Gain → Destination
[time] Set frequency: 440Hz (A4), volume: 50%
[time] ✅ Oscillator started! You should hear a tone.
[time] 🎵 Playing 440Hz sine wave for 3 seconds...
[time] ⏹️ Stopped. Test complete!
[time] ✅ SUCCESS: AudioContext is running!
[time] If you heard the tone, Web Audio API works.
[time] If not, check system audio settings.
```

**Key indicators**:
- ✅ `state: running` = AudioContext working
- ✅ `Oscillator started` = Audio generation working
- ✅ `SUCCESS: AudioContext is running` = All systems go

---

## 🐛 Troubleshooting

### Issue 1: Diagnostic test plays sound, but PulsePlay doesn't

**Diagnosis**: Bug in PulsePlay's audio graph connections

**Fix**: Share the browser console logs showing:
```
[AudioEngine] Started oscillator 1: ...
[AudioEngine] Started oscillator 2: ...
[AudioEngine] Started oscillator 3: ...
[AudioEngine] Total oscillators: ...
```

I'll identify the specific connection issue.

---

### Issue 2: No sound from diagnostic test

**Diagnosis**: Browser or system audio issue

**Fix Checklist**:
- [ ] System volume > 0 and not muted
- [ ] Correct audio output device selected
- [ ] Browser tab not muted (check tab icon)
- [ ] Try headphones if speakers don't work
- [ ] Test with YouTube video (should play sound)
- [ ] Restart browser
- [ ] Check browser audio permissions

**Linux-specific**:
```bash
# Check PulseAudio
pactl info

# Check ALSA
alsamixer

# Test speakers
speaker-test -t wav -c 2
```

**Windows-specific**:
- Right-click speaker icon → Volume Mixer
- Check if browser is muted
- Check "Sounds" → Playback devices

**Mac-specific**:
- System Preferences → Sound → Output
- Test with system sound

---

### Issue 3: Diagnostic test shows "AudioContext state: suspended"

**Cause**: Browser autoplay policy

**Fix**:
1. The diagnostic test should auto-resume
2. If it doesn't, click the test button again
3. Or manually resume in console:
```javascript
const ctx = new (window.AudioContext || window.webkitAudioContext)();
await ctx.resume();
console.log('State:', ctx.state); // Should be 'running'
```

---

## 📋 What to Share With Me

If audio still doesn't work, please share:

### 1. Diagnostic Test Results
- Did you hear the 440Hz beep? (Yes/No)
- Copy the diagnostic logs (the text in the gray box)

### 2. Browser Console Logs
Open Console (F12) and copy all messages starting with:
```
[AudioContext]
[AudioEngine]
[useAudioEngine]
```

### 3. System Info
```javascript
// Run this in console and share output:
console.log({
  browser: navigator.userAgent,
  audioContext: typeof AudioContext !== 'undefined',
  webkitAudioContext: typeof webkitAudioContext !== 'undefined',
});
```

### 4. AudioContext State
```javascript
// Run this in console and share output:
const ctx = new (window.AudioContext || window.webkitAudioContext)();
console.log({
  state: ctx.state,
  sampleRate: ctx.sampleRate,
  currentTime: ctx.currentTime,
  destination: {
    maxChannelCount: ctx.destination.maxChannelCount,
    numberOfInputs: ctx.destination.numberOfInputs,
    numberOfOutputs: ctx.destination.numberOfOutputs
  }
});
```

---

## ✨ Summary

**What Changed**:
1. ✅ All moods now play at **50% volume** by default (was 25-45%)
2. ✅ Added **Audio Diagnostic Test** component to isolate issues
3. ✅ Enhanced logging throughout audio pipeline

**Next Steps**:
1. **Reload browser** (Ctrl+Shift+R)
2. **Click "Play Test Tone"** in the yellow diagnostic box
3. **Report results**: Did you hear the beep?
4. **Share logs** if still no sound

The diagnostic test will definitively tell us if the issue is:
- ❌ System/browser audio (if test fails)
- ❌ PulsePlay code (if test works but app doesn't)

Let me know what you see! 🎵
