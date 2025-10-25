<!--
Sync Impact Report:
- Version change: 2.1.0 → 2.2.0
- Version bump rationale: MINOR - Replaced ESLint + Prettier with Biome.js for unified linting and formatting
- Core principles: No changes (5 principles remain unchanged)
- Modified sections:
  * Code Quality Without Bureaucracy (Principle V): Replaced ESLint + Prettier with Biome.js
  * Frontend Stack → Code Quality: Updated tooling from ESLint 9.17.0+ and Prettier 3+ to Biome 1.9.0+
- Technology changes:
  * Linting: ESLint 9.17.0+ → Biome 1.9.0+ (unified linter and formatter)
  * Formatting: Prettier 3+ → Biome 1.9.0+ (built-in formatter, no separate tool)
  * Performance: Single tool instead of two, faster execution (~25x faster than ESLint)
  * Configuration: biome.json replaces .eslintrc.* and .prettierrc.* files
- Rationale for change:
  * Biome.js is a fast, all-in-one toolchain (linting + formatting + import sorting)
  * Written in Rust, significantly faster than ESLint/Prettier (~25x faster linting, ~10x faster formatting)
  * Zero config needed for TypeScript/JSX/TSX (sensible defaults out of the box)
  * Drop-in replacement with migration tool (npx @biomejs/biome migrate eslint --write)
  * Aligns with Principle V (Simplicity): One tool instead of two, less configuration overhead
  * Maintained by active open source community, compatible with VS Code, CI/CD
- Templates status:
  ✅ plan-template.md - No changes needed (principles unchanged)
  ✅ spec-template.md - No changes needed (principles unchanged)
  ✅ tasks-template.md - No changes needed (principles unchanged)
  ✅ checklist-template.md - No changes needed (principles unchanged)
  ✅ agent-file-template.md - No changes needed (principles unchanged)
- Follow-up TODOs:
  * Remove ESLint and Prettier from package.json devDependencies
  * Install Biome: npm install --save-dev @biomejs/biome
  * Generate biome.json: npx @biomejs/biome init
  * Migrate existing ESLint config: npx @biomejs/biome migrate eslint --write
  * Update pre-commit hooks (Husky + lint-staged) to run biome check --write instead of eslint + prettier
  * Update package.json scripts: "lint": "biome check .", "format": "biome format --write ."
  * Update CI/CD workflows to run biome ci instead of eslint + prettier
  * Add biome.json to version control
  * Update DEVELOPER_GUIDE.md with Biome.js setup and usage
  * Update VS Code settings.json to use Biome extension instead of ESLint + Prettier extensions
- Migration guide: https://biomejs.dev/guides/migrate-eslint-prettier/
- Non-breaking changes: Tooling change only, code style and linting rules can be configured to match previous behavior
-->

# PulsePlay Constitution

## Project Context

**Project Name**: PulsePlay  
**Mission**: Transform typing rhythm and mouse activity into personalized, adaptive focus music powered by AI-augmented creativity  
**Target Users**: Developers, writers, designers, neurodiverse professionals, and productivity-focused individuals seeking intelligent, emotionally resonant ambient soundscapes  
**Core Technology**: Real-time audio synthesis via Web Audio API, rhythm detection from user input patterns, AI-powered music generation via Gemini API and Gradient AI

**Key Differentiators**:
- **AI-augmented creativity**: Gemini API and Gradient AI generate intelligent, context-aware music feedback
- **Real-time audio generation**: No pre-recorded loops, pure synthesis
- **Adaptive tempo**: Music responds to user activity patterns in real-time
- **Experience-first design**: Distraction-free, intuitive interface with seamless audio-visual synchronization
- **Data-respectful architecture**: Minimal data collection, MongoDB anonymization, user control
- **Open source integrity**: Educational clarity, transparent workflow, community-driven development
- **Neurodiverse inclusivity**: Accessibility mode, sensory-friendly features, WCAG 2.1 AA compliance

## Core Principles

### I. Experience-First Design

PulsePlay prioritizes user experience above all else. Every feature MUST enhance the user's ability to focus, flow, and feel immersed in the adaptive music environment.

**Interface Requirements:**
- **Intuitive**: New users should understand core functionality within 30 seconds
- **Distraction-free**: Zero visual clutter, essential controls only, hidden complexity
- **Aesthetically consistent**: TailwindCSS design system, cohesive color palette (slate-900 to slate-700, blue-500 accents), smooth transitions
- **Responsive**: Mobile-first approach, breakpoints at sm:640px, md:768px, lg:1024px, xl:1280px

**Audio-Visual Synchronization:**
- Visualizer MUST pulse in sync with generated audio (60fps canvas animation)
- Volume slider MUST reflect actual audio gain in real-time
- Mood transitions MUST be smooth (crossfade between states, no abrupt changes)
- Loading states MUST provide meaningful feedback ("Generating AI insights...")

**Accessibility & Neurodiverse Inclusivity (NON-NEGOTIABLE):**
- **WCAG 2.1 AA compliance**: Keyboard navigation, ARIA labels, focus indicators
- **Sensory-friendly mode**: Lower frequency ranges, reduced visual intensity, option to disable animations
- **Reduced motion support**: Respect `prefers-reduced-motion` media query
- **Color contrast**: Minimum 4.5:1 for text, 3:1 for interactive elements
- **Screen reader compatibility**: Descriptive labels for all audio controls and visualizer states

**User Testing:**
- Every major feature MUST be tested with at least one neurodiverse user before release
- Accessibility violations BLOCK PR merge
- User feedback MUST inform design iterations

**Rationale**: Focus tools live or die by their user experience. If the interface creates friction or the audio feels disconnected, users will abandon the tool. Neurodiverse inclusivity isn't a feature—it's fundamental to the mission of enhancing focus for all cognitive styles.

---

### II. AI-Augmented Creativity

PulsePlay integrates AI not as a gimmick but as a creative partner. Gemini API and Gradient AI services MUST **augment** user experience by generating intelligent, emotionally resonant music feedback.

**AI Integration Standards:**
- **Value-driven**: Every AI interaction MUST add measurable value (personalization, insight, adaptation)
- **Context-aware**: AI-generated content MUST align with user context (focus, calm, energy modes)
- **Transparent**: Gemini prompts MUST be logged for reproducibility and debugging
- **Fail-safe**: AI failures MUST degrade gracefully (fallback to rule-based synthesis)

**Gemini API Usage:**
- **Song insights**: Generate contextual feedback based on session metrics (rhythm patterns, duration, intensity)
- **Prompt engineering**: Use few-shot examples, clear instructions, structured outputs (JSON when possible)
- **Rate limiting**: Respect API limits, implement exponential backoff, cache responses where appropriate
- **Error handling**: Catch API errors, log failures, never block core audio functionality

**Gradient AI Services:**
- **Music personalization**: Generate adaptive audio parameters based on user preferences and historical data
- **Emotional resonance**: Map rhythm intensity to musical qualities (tempo, harmony, timbre)
- **Learning loop**: User feedback (explicit ratings or implicit session duration) MUST inform future generations

**AI Transparency Requirements:**
- Log all Gemini prompts and responses (sanitized, no PII) for reproducibility
- Display AI-generated insights with clear attribution ("AI-generated based on your focus pattern")
- Provide opt-out option for users who prefer non-AI experience
- Document AI decision-making logic in `AI_ARCHITECTURE.md`

**Prohibited AI Practices:**
- AI as a black box (all prompts must be auditable)
- AI replacing human creativity (AI assists, doesn't automate away artistry)
- AI collecting sensitive data without explicit consent
- AI hallucinations presented as facts (validate outputs, acknowledge uncertainty)

**Rationale**: AI should amplify human creativity and focus, not replace it. Gemini and Gradient AI enable PulsePlay to be more than a synthesizer—it becomes an intelligent companion that understands and adapts to individual work patterns. Transparency builds trust; value builds retention.

---

### III. Data-Respectful Architecture

User data (typing rhythm, focus sessions, preferences) MUST be handled with the utmost care. PulsePlay is built on data ethics, not data exploitation.

**Minimal Data Collection:**
- **Client-side processing**: Rhythm detection (keystrokes, mouse movements) NEVER leaves the browser
- **Aggregated storage**: Database stores session summaries only (duration, keystroke count, rhythm metrics)
- **No raw data**: Actual keystroke content, mouse coordinates, or audio waveforms NEVER stored
- **User control**: Users can delete all data at any time (right to be forgotten)

**MongoDB Schema Principles:**
- **Anonymization**: Use hashed user IDs where possible, avoid storing identifiable information
- **Minimal retention**: Session data auto-deleted after 90 days unless user explicitly saves
- **Granular permissions**: Users control what data is collected (opt-in for rhythm tracking, AI insights)
- **Schema versioning**: MongoDB schemas documented in `DB_SCHEMA.md`, migrations tracked

**MongoDB Security Standards:**
- **Authentication**: Role-based access control (RBAC), least-privilege principle
- **Encryption**: Data encrypted at rest and in transit (TLS 1.3+)
- **Input validation**: Sanitize all inputs, use Mongoose schemas for type safety
- **Query safety**: Use parameterized queries, never string concatenation for query building

**Data Transparency:**
- **Privacy policy**: Clear, jargon-free explanation of what data is collected and why
- **Data export**: Users can download all their data in JSON format
- **Data dashboard**: Show users exactly what data PulsePlay has stored about them
- **Audit logs**: Track data access patterns, log anomalies

**Compliance Standards:**
- **Open data ethics**: Follow open source data principles (transparency, user control, minimal collection)
- **GDPR-aligned**: Right to access, right to deletion, right to portability (even if not legally required)
- **No third-party tracking**: No Google Analytics, Facebook Pixel, or other surveillance capitalism tools
- **Consent-driven**: Explicit opt-in for any data collection beyond core functionality

**Data Ethics Checklist:**
- [ ] Is this data necessary for core functionality?
- [ ] Can we aggregate or anonymize this data?
- [ ] Have we informed users why we collect this?
- [ ] Can users delete this data themselves?
- [ ] Is this data encrypted at rest and in transit?

**Rationale**: Users trust PulsePlay with intimate data about their work patterns and focus rhythms. This trust is sacred. Data-respectful architecture isn't about compliance—it's about treating users as humans, not data sources. MongoDB's flexibility enables privacy-by-design without sacrificing functionality.

---

### IV. Open Source Integrity

PulsePlay is built for the open source community. Every line of code, every design decision, every architectural choice MUST be transparent, documented, and welcoming to contributors.

**Code Documentation Standards:**
- **JSDoc required**: Every function, hook, component MUST have JSDoc with @param, @returns, @example
  ```typescript
  /**
   * Generates AI-powered song insights using Gemini API.
   * @param sessionMetrics - Aggregated session data (duration, keystrokes, rhythm)
   * @param userContext - User's selected mood (focus, calm, energy)
   * @returns Promise resolving to AI-generated insight text
   * @throws {GeminiAPIError} If API call fails after retries
   * @example
   * const insight = await generateMoodInsight(metrics, 'focus');
   * console.log(insight); // "Your steady rhythm suggests deep concentration..."
   */
  ```
- **README clarity**: Quick start in <5 minutes, feature list, troubleshooting, prerequisites
- **Architecture documentation**: `ARCHITECTURE.md` with ASCII diagrams, data flows, component hierarchy
- **API reference**: `API_REFERENCE.md` with all hooks, components, Gemini/Gradient AI integration patterns
- **Educational comments**: Explain "why" in code comments, not "what" (code should be self-documenting)

**Versioning & Change Management:**
- **Semantic versioning**: MAJOR.MINOR.PATCH (e.g., 2.1.3)
  - MAJOR: Breaking API changes, principle removals
  - MINOR: New features, backward-compatible enhancements
  - PATCH: Bug fixes, typos, clarifications
- **Changelog maintenance**: `CHANGELOG.md` updated with every release (Keep a Changelog format)
- **Git tagging**: Every release tagged in git (e.g., `v2.1.3`)
- **Migration guides**: Breaking changes MUST include migration documentation

**Contribution Workflow (Transparent & Welcoming):**
1. **Issue first**: Discuss features/bugs in GitHub issues before coding
2. **Fork & branch**: Fork repo, create descriptive branch (`feature/gemini-insights`, `fix/canvas-flicker`)
3. **Commit conventions**: Conventional Commits format (`feat(ai): add Gemini API song insights`)
4. **Pull request**: Clear description, link to issue, screenshots/videos for UI changes
5. **Code review**: Maintainers review within 48 hours, provide constructive feedback
6. **Merge & celebrate**: Merge to main, add contributor to `CONTRIBUTORS.md`, release notes credit

**Educational Clarity (Onboarding in 1 Hour):**
- **Setup script**: `npm run setup` automates environment configuration
- **Contributor guide**: `CONTRIBUTING.md` with step-by-step onboarding
- **Code tour**: `CODE_TOUR.md` explains project structure, key files, where to start
- **Beginner-friendly issues**: Label issues with `good first issue`, `help wanted`, `documentation`
- **Pair programming**: Offer live pairing sessions for new contributors (Discord/Zoom)

**Dependency Policy:**
- **Open source preferred**: Prioritize MIT, Apache 2.0, BSD licenses
- **No closed-source dependencies**: Unless absolutely necessary (e.g., Gemini API, Gradient AI APIs)
  - Exception justification MUST be documented in `DEPENDENCIES.md`
  - Fallback to open alternatives MUST be planned (e.g., local LLM for Gemini API)
- **License compatibility**: All dependencies MUST be compatible with project license (check with `license-checker`)

**Community Standards:**
- **Code of Conduct**: Welcoming, respectful, harassment-free environment (Contributor Covenant)
- **Inclusive language**: Use gender-neutral pronouns, avoid ableist terms, prioritize clarity
- **Credit attribution**: Credit all contributors in `CONTRIBUTORS.md`, release notes, documentation
- **Public roadmap**: Share project direction in GitHub projects, invite community input

**Rationale**: Open source thrives on transparency and accessibility. If a new contributor can't understand the codebase within an hour, we've failed. If a user can't see how their data is used, we've failed. Open source integrity means treating every contributor as a valued partner, not free labor.

---

### V. Simplicity and Observability

PulsePlay embraces simplicity, modularity, and measurable quality. Avoid over-engineering; follow YAGNI (You Aren't Gonna Need It) and KISS (Keep It Simple, Stupid) principles.

**Simplicity Principles:**
- **YAGNI**: Don't build features "for the future"—build what users need today
- **KISS**: Prefer simple solutions over clever ones (readable code > clever code)
- **Single Responsibility**: Each module, function, component does one thing well
- **Avoid premature optimization**: Optimize only when profiling identifies bottlenecks
- **Delete code**: Removing code is progress (eliminate dead code, unused dependencies)

**Modular Design:**
- **Loose coupling**: Modules communicate via clear interfaces, minimal dependencies
- **High cohesion**: Related functionality grouped together (e.g., all Gemini API logic in `services/geminiService.ts`)
- **Testability**: Every module MUST be testable in isolation (dependency injection, mocking)
- **Replaceability**: Swap implementations without rewriting dependents (e.g., replace Gemini with local LLM)

**Structured Logging:**
- **Rhythm analysis**: Log rhythm detection metrics (BPM, intensity, keystroke velocity) for debugging
  ```typescript
  logger.info('rhythm_detected', {
    bpm: 120,
    intensity: 0.75,
    keystroke_count: 45,
    session_duration_ms: 180000
  });
  ```
- **AI interactions**: Log Gemini API calls (prompts, responses, latency, errors)
  ```typescript
  logger.info('gemini_api_call', {
    prompt_hash: 'abc123',
    response_length: 256,
    latency_ms: 450,
    tokens_used: 128
  });
  ```
- **Audio engine performance**: Log audio node creation, cleanup, buffer underruns
  ```typescript
  logger.debug('audio_node_created', {
    type: 'OscillatorNode',
    frequency: 440,
    gain: 0.5,
    active_nodes_count: 12
  });
  ```
- **Structured format**: Use JSON logging (pino, winston) for machine-readable logs
- **Log levels**: DEBUG (development), INFO (production events), WARN (recoverable errors), ERROR (failures)

**Observability Standards:**
- **Metrics**: Track key performance indicators (session duration, AI insight generation time, audio latency)
- **Tracing**: Distributed tracing for AI API calls (Gemini, Gradient AI) to identify bottlenecks
- **Alerts**: Monitor critical failures (AI API downtime, audio engine crashes, database connection loss)
- **Dashboards**: Real-time observability dashboard (Grafana, custom React dashboard)

**Testing Strategy (Pragmatic, Not Dogmatic):**
- **Unit tests**: Test pure functions, utilities, hooks in isolation (Jest + React Testing Library)
- **Integration tests**: Test component interactions, API integrations, database operations
- **E2E tests**: Test critical user journeys (start session, generate AI insight, export data)
- **Performance tests**: Benchmark audio engine latency, rhythm detection speed, canvas rendering FPS
- **Coverage target**: 70%+ for critical paths (audio engine, AI integration, data persistence)
- **Test maintenance**: Delete tests for removed features, update tests with code changes

**Code Quality Without Bureaucracy:**
- **TypeScript strict mode**: Catch errors at compile time, not runtime
- **Biome.js**: All-in-one toolchain for linting, formatting, and import sorting (unified replacement for ESLint + Prettier)
- **Pre-commit hooks**: Run linting, formatting, type checking before commit (Husky + lint-staged)
- **CI/CD**: Automated checks on every PR (build, lint, format, test, type check)

**Debugging Efficiency:**
- **Error boundaries**: Catch React errors, display user-friendly fallback UI
- **Source maps**: Enable in production for better error stack traces
- **Reproducible bugs**: Logs MUST contain enough context to reproduce issues
- **Fail fast**: Detect errors early (assertions, type guards, runtime validation)

**Rationale**: Complexity is the enemy of reliability. Simple code is easier to understand, test, debug, and maintain. Observability turns PulsePlay from a black box into a transparent system where every behavior is measurable, every failure is traceable, and every performance issue is quantifiable. YAGNI and KISS keep development velocity high and technical debt low.

---

## Technology & Security Standards

### Technology Stack Overview

| Layer             | Technology                              | Responsibility                                    |
|-------------------|-----------------------------------------|---------------------------------------------------|
| **UI**            | React + Figma                           | Build and style interactive dashboard             |
| **Audio**         | Web Audio API                           | Generate dynamic focus music, rhythm detection    |
| **AI**            | Gemini API                              | Create moods, tempos, focus summaries             |
| **Auth**          | Auth0                                   | Handle secure user login, OAuth2 compliance       |
| **Storage**       | MongoDB Atlas                           | Store preferences and session data                |
| **Backend**       | Node.js + Express                       | AI prompt orchestration, data management          |
| **Optional AI**   | DigitalOcean Gradient™ AI / Snowflake   | Music generation (stretch) / analytics (optional) |
| **Docs**          | GitHub + README + Diagrams              | Public repo and documentation                     |

---

### Frontend Stack

**Core Framework:**
- **React 18.3.1+**: Hooks-only architecture (no class components), StrictMode enabled
- **TypeScript 5.5.3+**: Strict mode mandatory (`strict: true`, `noImplicitAny: true`)
- **Vite 5.4.20+**: Development server (HMR <100ms), build tool (Rollup-based)

**UI & Design:**
- **Figma**: Design system source of truth, component specifications, prototypes
- **TailwindCSS 3.4.17+**: Utility-first CSS, JIT compiler
- **Lucide React 0.468.0+**: Icon library (tree-shakable, import specific icons only)
- **PostCSS 8+**: CSS processing (autoprefixer for browser compatibility)

**Audio Processing:**
- **Web Audio API**: Native browser API (no external libraries like Tone.js or Howler.js)
  - AudioContext for audio graph management
  - OscillatorNode for tone generation
  - GainNode for volume control
  - BiquadFilterNode for frequency filtering
  - ConvolverNode for reverb effects
  - AnalyserNode for rhythm detection (FFT, time-domain analysis)

**Code Quality:**
- **Biome 1.9.0+**: All-in-one toolchain for linting, formatting, and import sorting
  - Replaces ESLint + Prettier with single fast tool (~25x faster than ESLint)
  - Configuration: biome.json in project root
  - VS Code integration: Biome extension for real-time feedback
  - CLI commands: `biome check .` (lint + format check), `biome check --write` (fix), `biome ci` (CI mode)

---

### Backend Stack

**Server Framework:**
- **Node.js 18+**: JavaScript runtime for backend services
- **Express 4+**: Web framework for API routes, middleware, AI prompt orchestration

**Database:**
- **MongoDB Atlas**: Managed MongoDB service (cloud-hosted, automatic backups)
  - Version: MongoDB 7+
  - Connection: mongoose ODM for schema validation, type safety
  - Collections: `users`, `focusSessions`, `aiInsights`, `userPreferences`

**AI Services:**
- **Gemini API (Google AI)**: Primary AI service for song insights, contextual feedback
  - Model: `gemini-2.5-flash` (fast responses) or `gemini-1.5-pro` (complex reasoning)
  - Use cases: Mood generation, tempo suggestions, focus session summaries
  - Rate limits: Respect API quotas, implement exponential backoff (1s, 2s, 4s, 8s)
  - Error handling: Graceful degradation to rule-based fallbacks
  - Context7 MCP: MUST consult for latest model versions and API changes

- **DigitalOcean Gradient™ AI** (Stretch Goal): On-demand music generation
  - Use case: Generate unique music snippets based on user rhythm patterns
  - Integration: RESTful API or SDK (check Context7 MCP for documentation)
  - Latency target: <2s for 30-second music generation
  - Fallback: Web Audio API synthesis if service unavailable
  - Cost management: Cache generated music, implement rate limiting

- **Snowflake API** (Optional): Analytics on aggregated focus data
  - Use case: Aggregate anonymous focus metrics across users for insights
  - Data flow: MongoDB → ETL pipeline → Snowflake data warehouse
  - Privacy: Only aggregated, anonymized data (no PII, no raw keystroke data)
  - Query patterns: Top focus times, average session duration, popular moods

**Authentication & Authorization:**
- **Auth0**: Secure authentication service, OAuth2 compliance
  - Flows: Authorization Code Flow with PKCE (web), Resource Owner Password (testing only)
  - Social logins: Google, GitHub (optional)
  - JWT tokens: Access tokens (15min expiry), refresh tokens (7 days)
  - Multi-factor authentication (MFA): Optional but recommended
  - Session management: Secure, httpOnly cookies for refresh tokens

---

### Development Tools

**Build & Dev:**
- **Node.js 18+**: Runtime for development tools and backend
- **npm 9+** or **pnpm 8+**: Package manager (pnpm preferred for speed)
- **Git 2+**: Version control
- **nodemon**: Auto-restart server on file changes (development)

**Testing:**
- **Jest 29+**: Test runner and assertion library
- **React Testing Library 14+**: Component testing utilities
- **Supertest**: HTTP assertions for Express API testing
- **@testing-library/user-event**: User interaction simulation
- **jest-environment-jsdom**: Browser environment mocking

**Logging & Observability:**
- **pino** or **winston**: Structured JSON logging
  - Log rhythm metrics: BPM, intensity, keystroke velocity
  - Log AI interactions: Gemini API calls, prompts, responses, latency
  - Log audio engine: Node creation, cleanup, buffer underruns
- **morgan**: HTTP request logging middleware for Express
- **Sentry** (optional): Error tracking and performance monitoring

**Performance & Quality Auditing:**
- **Lighthouse CLI**: Performance auditing (CI integration)
- **Chrome DevTools**: Profiling, network analysis, Web Audio Inspector
- **TypeScript Compiler**: Type checking (`tsc --noEmit`)

---

### Security Standards

**HTTPS Enforcement:**
- **HTTPS REQUIRED** for all environments (development, staging, production)
- Development: Use `mkcert` for local HTTPS certificates
- Production: Let's Encrypt, Cloudflare, or hosting provider SSL/TLS
- HSTS headers: `Strict-Transport-Security: max-age=31536000; includeSubDomains`

**Data Protection:**
- **No raw keystroke data storage**: Only rhythm metrics (BPM, intensity, event counts)
- **Client-side processing**: Rhythm detection entirely in browser (Web Audio API + AnalyserNode)
- **MongoDB encryption**: Data encrypted at rest (MongoDB Atlas default) and in transit (TLS 1.3)
- **Auth0 security**: Secure token storage (httpOnly cookies), automatic token refresh

**API Key Management:**
- **Environment variables**: All API keys stored in `.env` file (NEVER committed to git)
  ```bash
  # Required
  MONGODB_URI=mongodb+srv://...
  AUTH0_DOMAIN=your-domain.auth0.com
  AUTH0_CLIENT_ID=...
  AUTH0_CLIENT_SECRET=...
  GEMINI_API_KEY=...
  
  # Optional
  GRADIENT_AI_API_KEY=...
  SNOWFLAKE_ACCOUNT=...
  SENTRY_DSN=...
  ```
- **.gitignore**: `.env` MUST be gitignored, `.env.example` provided as template
- **Production secrets**: Use hosting provider secret management (Vercel Env Vars, AWS Secrets Manager, Railway Variables)

**Input Validation:**
- **Express middleware**: Use `express-validator` or `joi` for request validation
- **MongoDB**: Mongoose schemas enforce type safety and required fields
- **Sanitization**: Sanitize user inputs before database insertion (prevent NoSQL injection)
- **Rate limiting**: `express-rate-limit` to prevent API abuse (100 req/15min per IP)

**Authentication Security:**
- **Auth0 best practices**: Follow Auth0 security guidelines (PKCE flow, secure callbacks)
- **JWT validation**: Verify JWT signatures, expiration, audience claims on backend
- **Session security**: Secure, httpOnly, sameSite=strict cookies
- **Password requirements**: Enforced by Auth0 (8+ chars, uppercase, lowercase, number)

**Dependency Security:**
- **npm audit**: Run weekly (GitHub Actions scheduled job)
- **Dependabot**: Enable for automatic security patch PRs
- **Snyk** (optional): Continuous dependency vulnerability scanning
- **Security patches**: Apply within 7 days of disclosure

**Error Handling:**
- **No sensitive data leaks**: Error messages MUST NOT expose API keys, tokens, stack traces
- **User-facing errors**: Generic messages ("Authentication failed" not "Invalid API key for Gemini")
- **Logging**: Sanitize logs (redact tokens, API keys, passwords before logging)

**Security Audit Checklist:**
- [ ] `.env` file in `.gitignore`
- [ ] HTTPS enforced in production
- [ ] Auth0 configured with PKCE flow
- [ ] MongoDB Atlas IP whitelist configured
- [ ] API keys stored in environment variables only
- [ ] No console.log with sensitive data in production build
- [ ] Rate limiting enabled on all API endpoints
- [ ] npm audit clean (no high/critical vulnerabilities)

---

### Browser Compatibility

**Minimum Supported Browsers:**
- Chrome/Edge 90+
- Firefox 88+
- Safari 14.1+
- Opera 76+

**Required APIs:**
- Web Audio API (AudioContext, AnalyserNode support)
- ES2020+ features (optional chaining, nullish coalescing)
- Canvas API (2D context for visualizer)
- Fetch API (or axios for API calls)
- LocalStorage (for user preferences, non-sensitive data only)

---

### Prohibited Dependencies

**Do NOT use:**
- **jQuery**: React handles DOM manipulation
- **Moment.js**: Use native `Date` or `date-fns` if needed
- **Lodash**: Use native ES2020+ methods (map, filter, reduce)
- **External audio libraries**: Web Audio API is sufficient (Tone.js, Howler.js unnecessary)
- **CSS frameworks other than Tailwind**: Consistency requirement
- **Closed-source AI services without open fallbacks**: Always have rule-based alternatives

---

### Package Update Policy

- **Security patches**: Apply immediately (within 7 days)
- **Minor updates**: Review and apply monthly
- **Major updates**: Evaluate for breaking changes, test thoroughly, apply quarterly
- **Context7 MCP**: MUST be consulted before upgrading major versions (especially Gemini API, Gradient AI, MongoDB, Auth0)

## Development Workflow

**Branch Strategy:**
- `main` branch is production-ready
- Feature branches: `feature/description`
- Bug fixes: `fix/description`
- Documentation: `docs/description`

**Pull Request Requirements:**
- TypeScript compilation MUST succeed (`npm run typecheck`)
- Linting MUST pass with zero warnings (`npm run lint`)
- Build MUST succeed (`npm run build`)
- All tests MUST pass (when test suite implemented)
- Documentation MUST be updated if API changes
- PR description MUST reference related issues
- At least one approval REQUIRED before merge

**Commit Message Format:**
- Follow Conventional Commits specification
- Format: `type(scope): subject`
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`
- Examples: `feat(audio): add binaural beats support`, `fix(rhythm): prevent negative BPM`

**Code Review Standards:**
- Review for principle compliance (5 core principles)
- **Experience-First Design**: UX clarity, accessibility, audio-visual sync
- **AI-Augmented Creativity**: Gemini/Gradient AI integration quality, transparency
- **Data-Respectful Architecture**: MongoDB security, minimal data collection, user control
- **Open Source Integrity**: Documentation completeness, educational clarity
- **Simplicity and Observability**: YAGNI/KISS adherence, structured logging, testability

## Governance

This constitution supersedes all other development practices and guidelines. All contributors MUST adhere to these principles.

**Amendment Process:**
- Proposals MUST be documented in a GitHub issue
- Discussion period: minimum 7 days
- Approval requires consensus from project maintainers
- Changes MUST include migration plan if breaking
- Version bump according to semantic versioning

**Versioning Policy:**
- MAJOR: Breaking principle changes or removals
- MINOR: New principles or significant expansions
- PATCH: Clarifications, wording improvements, typo fixes

**Compliance Review:**
- Every PR MUST verify constitutional compliance
- Monthly audits of codebase against principles
- Violations MUST be addressed or explicitly justified
- Technical debt MUST be tracked and scheduled for resolution

**Runtime Guidance:**
- Use `DEVELOPER_GUIDE.md` for detailed development procedures
- Use `API_REFERENCE.md` for API contracts and interfaces
- Use `QUICK_REFERENCE.md` for common patterns and snippets
- Use Context7 MCP for retrieving latest package documentation

**Version**: 2.2.0 | **Ratified**: 2025-10-18 | **Last Amended**: 2025-10-18
