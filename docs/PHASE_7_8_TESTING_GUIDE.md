# Phase 7 & 8 Testing Guide
**PulsePlay AI - Manual Testing Checklist**

## Prerequisites

### 1. Start Both Servers
```bash
# Terminal 1: Frontend (Vite)
cd /home/rl/Desktop/pulseplay-ai
npm run dev

# Terminal 2: Backend (Node.js + MongoDB)
cd /home/rl/Desktop/pulseplay-ai
npm run dev:backend
```

**Verify servers are running:**
- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- MongoDB: mongodb://localhost:27017

### 2. Set Environment Variables
Make sure you have a `.env` file in the root with:
```
GEMINI_API_KEY=your_google_gemini_api_key_here
AUTH0_DOMAIN=your_auth0_domain
AUTH0_CLIENT_ID=your_auth0_client_id
AUTH0_CLIENT_SECRET=your_auth0_client_secret
```

---

## Phase 7: AI Mood Recommendations

### Test Case 1: 10-Minute Threshold (T117)
**Goal**: Verify AI insights only show for sessions ≥10 minutes

**Steps:**
1. Open http://localhost:5173
2. Click "Sign In" (use Auth0 credentials)
3. Select mood: "Energized Coding"
4. Click "Start Focus Session"
5. **Type quickly** (aim for 100+ keys/min) for **5 minutes**
6. Click "Stop Session"

**Expected Result:**
- ❌ No "AI Mood Insights" component appears
- Session saved to database but no recommendation

**Steps (10+ minutes):**
1. Start a new session with "Energized Coding"
2. **Type quickly and steadily** for **10+ minutes** (set a timer!)
3. Click "Stop Session"

**Expected Result:**
- ✅ "AI Mood Insights" component appears below SessionStats
- Shows suggested mood, rationale, confidence score
- "Powered by Gemini" branding visible

---

### Test Case 2: Fast Steady Typing → Energized Coding (T111, T113)
**Goal**: Test session pattern analysis and Gemini API

**Steps:**
1. Start session with "Deep Focus" mood
2. **Type at 100+ keys/min consistently** for **15 minutes**
   - Suggested: Open a text editor and copy-paste Lorem Ipsum repeatedly
   - Use online typing speed test to maintain tempo
3. Click "Stop Session"
4. Wait 2-3 seconds for AI to generate recommendation

**Expected Result:**
- ✅ Suggested mood: "Energized Coding" or "Creative Flow"
- ✅ Rationale mentions: "consistent high-speed rhythm", "strong focus momentum"
- ✅ Confidence: 0.75-0.95 (75-95%)
- ✅ Timestamp shows "Generated just now"

**Check backend logs:**
```bash
# In backend terminal, look for:
{
  "level": "info",
  "msg": "gemini_mood_recommendation",
  "prompt_hash": "a3f5c8d2",
  "suggested_mood": "energized-coding",
  "confidence": 0.85,
  "latency_ms": 1234
}
```

---

### Test Case 3: Slow Erratic Typing → Calm Reading (T111, T113)
**Goal**: Test session pattern detection (erratic rhythm)

**Steps:**
1. Start session with "Energized Coding" mood
2. **Type slowly (~30 keys/min) with long pauses (10-20 seconds)** for **12 minutes**
   - Type a sentence, pause 15 seconds, type another sentence, etc.
3. Click "Stop Session"

**Expected Result:**
- ✅ Suggested mood: "Calm Reading" or "Deep Focus"
- ✅ Rationale mentions: "slower, thoughtful rhythm", "deliberate pace"
- ✅ Confidence: 0.65-0.85
- ✅ Rhythm pattern classified as "erratic"

---

### Test Case 4: Graceful Fallback (T115)
**Goal**: Test error handling when Gemini API fails

**Steps:**
1. **Stop backend server** (Ctrl+C in backend terminal)
2. Edit `backend/.env` and set: `GEMINI_API_KEY=invalid_key_12345`
3. **Restart backend server**: `npm run dev:backend`
4. Complete a 10+ minute session
5. Click "Stop Session"

**Expected Result:**
- ✅ AI Insights component still appears (no crash)
- ✅ Error message: "AI insights temporarily unavailable"
- ✅ Fallback suggestion: "Deep Focus" mode
- ✅ Confidence: 0.5 (50%)

**Check backend logs:**
```bash
{
  "level": "error",
  "msg": "gemini_mood_recommendation_error",
  "error": "API key invalid"
}
```

**Restore:** Reset `GEMINI_API_KEY` to valid value and restart backend.

---

### Test Case 5: Weekly Focus Summary (T118)
**Goal**: Test weekly aggregation endpoint

**Prerequisites:**
- Complete 5+ sessions over the last 7 days (or use test data)

**Steps:**
1. Use curl or Postman to call:
```bash
curl -X GET http://localhost:3001/api/ai/weekly-summary \
  -H "Authorization: Bearer YOUR_AUTH0_TOKEN"
```

**Expected Result:**
```json
{
  "summary": "You completed 7 focus sessions this week, totaling 185 minutes of focused work. Your average tempo of 92 keys/min shows strong productivity momentum. Consider balancing your energized-coding sessions (5) with more calm-reading time to prevent burnout."
}
```

**Verify:**
- ✅ Mentions total sessions count
- ✅ Mentions total focused time
- ✅ Mentions average tempo
- ✅ Personalized advice based on mood patterns

---

## Phase 8: Session Statistics & History

### Test Case 6: Real-Time Session Stats (T130-T131)
**Goal**: Verify stats update in real-time

**Steps:**
1. Start a new session (any mood)
2. Watch the "Session Stats" component
3. **Type and click** while observing metrics

**Expected Result:**
- ✅ **Duration**: Updates every second (MM:SS format, then HH:MM:SS after 1 hour)
- ✅ **Keystrokes**: Increments with each keystroke
- ✅ **Keys/Min**: Updates dynamically (should be 40-120 range for normal typing)
- ✅ **Mouse Clicks**: Increments with each mouse click
- ✅ **Live indicator**: Green pulsing dot visible
- ✅ **Rhythm Score**: Bar animates based on typing consistency

**Test calculations:**
- Type 100 keys in 60 seconds → Keys/Min should show ~100
- Stop typing → Keys/Min should gradually decrease

---

### Test Case 7: Session History Page (T135)
**Goal**: Navigate to session history and view past sessions

**Steps:**
1. Complete 3-5 sessions with different moods (2-15 min each)
2. Click **"Session History"** in the navigation bar
3. Verify page loads

**Expected Result:**
- ✅ Page title: "Session History"
- ✅ Subtitle: "View and manage your past focus sessions (N total)"
- ✅ Session cards displayed in grid (2 cols mobile, 4 cols desktop)
- ✅ Each card shows:
  - Mood badge (colored: blue/purple/green/orange)
  - Relative time ("2 hours ago")
  - Duration (HH:MM:SS)
  - Tempo (keys/min)
  - Rhythm type (steady/energetic/calm)
  - Status (completed/abandoned)

---

### Test Case 8: Mood Filtering (T136)
**Goal**: Filter sessions by mood

**Steps:**
1. On Session History page, click **"Filter by Mood"** dropdown
2. Select "Energized Coding"
3. Verify filtering

**Expected Result:**
- ✅ Only "Energized Coding" sessions displayed
- ✅ Total count updates: "Showing 5 of 12 sessions"
- ✅ Pagination resets to page 1
- ✅ URL updates: `?mood=energized-coding`

**Test all moods:**
- [ ] Deep Focus
- [ ] Creative Flow
- [ ] Calm Reading
- [ ] Energized Coding
- [ ] All Moods (reset)

---

### Test Case 9: Data Export (T133, T137)
**Goal**: Export session data as JSON

**Steps:**
1. On Session History page, click **"Export Data"** button
2. Verify file downloads

**Expected Result:**
- ✅ Browser downloads file: `pulseplay-sessions-[timestamp].json`
- ✅ File contains:
```json
{
  "exportedAt": "2025-10-18T08:00:00.000Z",
  "totalSessions": 12,
  "sessions": [
    {
      "sessionId": "507f1f77bcf86cd799439011",
      "mood": "energized-coding",
      "startTime": "2025-10-18T07:00:00.000Z",
      "endTime": "2025-10-18T07:25:00.000Z",
      "totalDurationMinutes": 25,
      "rhythmData": {
        "averageKeysPerMinute": 95,
        "rhythmType": "energetic"
      },
      "state": "completed"
    }
  ]
}
```

**Verify data privacy:**
- ✅ No PII: userIdHash is SHA-256 hashed
- ✅ No keystroke content
- ✅ Only aggregated metrics

---

### Test Case 10: Pagination (T132)
**Goal**: Test session history pagination

**Prerequisites:**
- Create 25+ sessions (use a script or complete many short sessions)

**Steps:**
1. Navigate to Session History
2. Verify page shows "Page 1 of 2" (20 sessions per page)
3. Click **"Next"** button
4. Verify page 2 loads with remaining sessions
5. Click **"Previous"** button
6. Verify page 1 reloads

**Expected Result:**
- ✅ Pagination controls visible
- ✅ Page number updates
- ✅ URL updates: `?page=2`
- ✅ Previous button disabled on page 1
- ✅ Next button disabled on last page
- ✅ Sessions change on page navigation

---

### Test Case 11: Delete All Sessions (T134)
**Goal**: Test "Right to be Forgotten" functionality

**Steps:**
1. On Session History page, click **"Delete All"** button
2. Confirm deletion in alert dialog
3. Wait for deletion to complete

**Expected Result:**
- ✅ Confirmation dialog appears: "Are you sure you want to delete all 12 sessions?"
- ✅ On confirm, loading indicator shows
- ✅ Success message: "Successfully deleted 12 sessions"
- ✅ Session History page shows empty state
- ✅ Message: "No sessions found. Start a focus session to see it here!"

**Verify backend:**
```bash
# Check MongoDB directly
mongosh
use pulseplay
db.focussessions.find({ userIdHash: "YOUR_HASH" }).count()
# Should return 0
```

---

### Test Case 12: Time Formatting (T139)
**Goal**: Verify time formatting utilities work correctly

**Test formatDuration():**
- 65 seconds → "1:05" ✅
- 3665 seconds → "1:01:05" ✅
- 0 seconds → "0:00" ✅
- 86400 seconds (24 hours) → "24:00:00" ✅

**Test formatRelativeTime():**
- 30 seconds ago → "just now" ✅
- 2 hours ago → "2 hours ago" ✅
- 3 days ago → "3 days ago" ✅
- 10 days ago → "Oct 8, 2025" ✅

**Where to verify:**
- Session History cards (relative time)
- Session Stats component (duration)
- AI Insights timestamp ("Generated just now")

---

## Integration Tests

### Test Case 13: End-to-End Flow
**Goal**: Test complete user journey from session start to AI recommendation

**Steps:**
1. Sign in with Auth0
2. Select "Deep Focus" mood
3. Start session
4. Type steadily at 80 keys/min for 12 minutes
5. Click 50 times during session
6. Stop session
7. View AI recommendation
8. Navigate to Session History
9. Find completed session in history
10. Export data
11. Verify session appears in exported JSON

**Expected Result:**
- ✅ All features work end-to-end
- ✅ Session persists to database
- ✅ AI recommendation appears (suggested mood + rationale)
- ✅ Session visible in history with correct stats
- ✅ Export includes the session

---

## Bug Reports

If you find any issues, document them:

### Template
```
**Bug**: [Short description]
**Steps to Reproduce**:
1. 
2. 
3. 

**Expected**: [What should happen]
**Actual**: [What actually happened]
**Logs**: [Backend logs if available]
**Screenshot**: [If applicable]
```

---

## Performance Benchmarks

### Phase 7
- ✅ AI recommendation generation: <3 seconds
- ✅ Prompt logging: <50ms overhead
- ✅ Graceful fallback: <100ms

### Phase 8
- ✅ Session history load: <500ms for 100 sessions
- ✅ Real-time stats update: <100ms latency
- ✅ Export download: <1 second for 1000 sessions
- ✅ Pagination: Instant page navigation

---

## Next Steps After Testing

1. ✅ Document all bugs found
2. ✅ Create GitHub issues for critical bugs
3. ✅ Move to Phase 9: Polish & Constitution Compliance
4. ✅ Run WCAG 2.1 AA accessibility audit
5. ✅ Add JSDoc coverage (>90% target)
6. ✅ Write unit tests (70%+ coverage)
7. ✅ Production build & deployment
