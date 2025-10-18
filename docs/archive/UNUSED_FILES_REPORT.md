# 🗑️ Unused Files Analysis

**Analysis Date**: October 19, 2025  
**Branch**: 1.2.0

This document lists all unused files and folders from various tech stacks that are currently not being used in the PulsePlay AI codebase.

---

## 📊 Summary

| Category | Unused Files/Folders | Status |
|----------|---------------------|--------|
| **Testing Infrastructure** | vitest.config.ts, test setup | ❌ Not in use |
| **ESLint** | eslint.config.js | ❌ Using Biome instead |
| **Bolt.new Scaffolding** | .bolt/ folder | ❌ Initial template files |
| **Specify/SpecKit** | .specify/ folder | ⚠️ Project management templates |
| **Test Scripts** | test-phase-7-8.sh | ⚠️ Legacy test script |
| **Console Log** | console.log file | ❌ Debug output file |
| **Specs Folder** | specs/ folder | ⚠️ Legacy specifications |
| **MIDI Scripts** | scripts/categorizeMidiNotes.js, separateRiversFlowNotes.js | ✅ One-time use |
| **WebSocket Server** | backend/src/websocket/server.ts | ❌ Not imported anywhere |

---

## 🔍 Detailed Analysis

### 1. Testing Infrastructure (UNUSED)

#### Files:
- **`vitest.config.ts`** - Vitest configuration file
- **`src/test/setup.ts`** - Referenced but doesn't exist

#### Dependencies in package.json:
```json
"vitest": "^3.2.4",
"@vitest/ui": "^3.2.4",
"@testing-library/jest-dom": "^6.9.1",
"@testing-library/react": "^16.3.0",
"@testing-library/user-event": "^14.6.1"
```

#### Evidence:
- ✅ No test files exist (`*.test.*` or `*.spec.*`)
- ✅ `src/test/` directory doesn't exist
- ✅ No imports of vitest in source code
- ✅ Scripts defined but never used: `npm test`, `npm run test:ui`

#### Recommendation:
**DELETE** - Remove vitest config and uninstall testing dependencies if not planning to write tests soon.

---

### 2. ESLint Configuration (UNUSED)

#### Files:
- **`eslint.config.js`** - ESLint configuration

#### Dependencies:
```json
"@eslint/js": "^9.9.1",
"eslint-plugin-react-hooks": "^5.0.0",
"eslint-plugin-react-refresh": "^0.4.12",
"globals": "^15.9.0",
"typescript-eslint": "^8.8.1"
```

#### Evidence:
- ✅ Project uses **Biome** for linting (biome.json exists)
- ✅ No `eslint` command in package.json scripts
- ✅ Linting done via: `npm run lint` → `biome check`

#### Current Linting:
```json
"lint": "npx @biomejs/biome check .",
"lint:fix": "npx @biomejs/biome check --write ."
```

#### Recommendation:
**DELETE** - Remove eslint.config.js and uninstall ESLint dependencies. Biome is the active linter.

---

### 3. Bolt.new Template Files (UNUSED)

#### Folder:
- **`.bolt/`**
  - `config.json` - Template identifier
  - `prompt` - Initial prompt

#### Evidence:
- ✅ Leftover from initial project scaffolding
- ✅ Contains: `{"template": "bolt-vite-react-ts"}`
- ✅ Not referenced anywhere in the codebase

#### Recommendation:
**DELETE** - Safe to remove, just initial template metadata.

---

### 4. Specify/SpecKit Files (OPTIONAL)

#### Folder:
- **`.specify/`**
  - `templates/` - Markdown templates for specs, plans, tasks
  - `scripts/bash/` - Shell scripts for feature creation
  - `memory/constitution.md` - Project constitution

#### Evidence:
- ⚠️ Project management and specification tool
- ⚠️ Not used in runtime, only for development planning
- ⚠️ GitHub prompts reference it (`.github/prompts/speckit.*.prompt.md`)

#### Recommendation:
**KEEP IF USED** - Only delete if you're not using SpecKit for project planning. Otherwise, archive or keep.

---

### 5. Test Script (LEGACY)

#### File:
- **`test-phase-7-8.sh`** - Legacy test script

#### Evidence:
- ✅ Shell script for testing phase 7-8
- ✅ Not referenced in package.json
- ✅ Phases 7-8 are complete (see archive docs)

#### Recommendation:
**MOVE TO ARCHIVE** or **DELETE** - Legacy testing script from old development phases.

---

### 6. Console Log File (DEBUG OUTPUT)

#### File:
- **`console.log`** - Debug output file

#### Contents:
```
AudioTest.tsx:15 🔊 Starting direct audio test...
AudioTest.tsx:15 AudioContext created, state: running
...
```

#### Evidence:
- ✅ Appears to be redirected console output
- ✅ Should be in .gitignore but isn't
- ✅ Not needed for production

#### Recommendation:
**DELETE** and add `console.log` to `.gitignore`.

---

### 7. Specs Folder (LEGACY)

#### Folder:
- **`specs/001-adaptive-focus-music/`**
  - `spec.md`, `plan.md`, `tasks.md`, `quickstart.md`
  - `contracts/sessions.openapi.yaml`
  - `checklists/requirements.md`

#### Evidence:
- ⚠️ Legacy project specifications
- ⚠️ Referenced in docs but not in runtime
- ⚠️ All phases complete (see PHASE_9_SUMMARY in archive)

#### Recommendation:
**MOVE TO docs/archive/** - Historical specs should be archived, not deleted.

---

### 8. MIDI Processing Scripts (ONE-TIME USE)

#### Files:
- **`scripts/categorizeMidiNotes.js`**
- **`scripts/separateRiversFlowNotes.js`**

#### Evidence:
- ✅ Used to process Rivers Flow MIDI file
- ✅ Output files exist: `rivers-flow-separated.json`, `categorized-rivers-flow.json`
- ✅ Not needed for runtime

#### Recommendation:
**KEEP** - Useful for future MIDI processing. Could be reused for adding more songs.

---

### 9. WebSocket Server (UNUSED)

#### File:
- **`backend/src/websocket/server.ts`**

#### Evidence:
```typescript
import { WebSocketServer, WebSocket } from 'ws';
import { logger } from '../config/logger.js';
```

#### Check:
- ❌ **Not imported** in `backend/src/server.ts`
- ❌ **Not initialized** anywhere
- ✅ **`ws` dependency** installed but unused

#### Code:
No references found in:
- `server.ts` - Main backend entry
- Any route files
- Any service files

#### Recommendation:
**DELETE** - WebSocket server is not being used. Remove file and `ws` dependency.

---

### 10. Context7 Setup Script (OPTIONAL)

#### File:
- **`scripts/setup-context7.sh`**

#### Evidence:
- ⚠️ Setup script for Context7 MCP server
- ⚠️ Documented in `docs/developer/CONTEXT7_SETUP.md`
- ⚠️ Optional development tool

#### Recommendation:
**KEEP** - Part of documented developer tooling for Context7 integration.

---

## 📋 Recommended Actions

### High Priority (DELETE)

```bash
# 1. Remove testing infrastructure (if not planning to write tests)
rm vitest.config.ts
npm uninstall vitest @vitest/ui @testing-library/jest-dom @testing-library/react @testing-library/user-event

# 2. Remove ESLint (using Biome instead)
rm eslint.config.js
npm uninstall @eslint/js eslint-plugin-react-hooks eslint-plugin-react-refresh globals typescript-eslint

# 3. Remove Bolt scaffolding
rm -rf .bolt

# 4. Remove debug log
rm console.log
echo "console.log" >> .gitignore

# 5. Remove unused WebSocket server
rm backend/src/websocket/server.ts
npm uninstall ws
npm uninstall -D @types/ws

# 6. Remove legacy test script
rm test-phase-7-8.sh
```

### Medium Priority (ARCHIVE)

```bash
# Move specs to documentation archive
mv specs docs/archive/specs
```

### Low Priority (KEEP OR OPTIONAL)

- **`.specify/`** - Keep if using SpecKit for planning
- **`scripts/categorizeMidiNotes.js`** - Keep for future MIDI processing
- **`scripts/setup-context7.sh`** - Keep as documented dev tool

---

## 💾 Dependencies to Remove

### Frontend (package.json)
```bash
# Testing
npm uninstall vitest @vitest/ui
npm uninstall @testing-library/jest-dom @testing-library/react @testing-library/user-event

# ESLint (replaced by Biome)
npm uninstall @eslint/js globals typescript-eslint
npm uninstall eslint-plugin-react-hooks eslint-plugin-react-refresh

# WebSocket
npm uninstall ws @types/ws
```

### Estimated Savings
- **~50 packages** removed from node_modules
- **~100MB** freed from disk space
- **Cleaner** package.json with only used dependencies

---

## ✅ Verification After Cleanup

```bash
# Check for broken imports
npm run typecheck

# Try building
npm run build

# Start dev server
npm run dev

# Backend build
cd backend && npm run build
```

---

## 📊 Summary Table

| File/Folder | Size | Status | Action |
|-------------|------|--------|--------|
| `vitest.config.ts` | 1KB | ❌ Unused | DELETE |
| `eslint.config.js` | 1KB | ❌ Unused | DELETE |
| `.bolt/` | <1KB | ❌ Template | DELETE |
| `console.log` | 1KB | ❌ Debug | DELETE |
| `test-phase-7-8.sh` | 5KB | ❌ Legacy | DELETE |
| `backend/src/websocket/server.ts` | 3KB | ❌ Unused | DELETE |
| `.specify/` | 50KB | ⚠️ Optional | KEEP/DELETE |
| `specs/` | 100KB | ⚠️ Legacy | ARCHIVE |
| `scripts/*.js` | 10KB | ✅ Useful | KEEP |
| `scripts/setup-context7.sh` | 2KB | ✅ Docs | KEEP |

**Total Waste**: ~15KB in unused code files  
**Total Savings (with deps)**: ~100MB with dependency removal

---

**Generated By**: GitHub Copilot  
**Review Status**: Pending manual verification
