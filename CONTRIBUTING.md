# Contributing to PulsePlay AI

First off, thank you for considering contributing to PulsePlay AI! It's people like you that make this project such a great tool for focused productivity.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Workflow](#development-workflow)
- [Style Guidelines](#style-guidelines)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Community](#community)

---

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to [project maintainers].

### Our Standards

**Examples of behavior that contributes to a positive environment:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

**Examples of unacceptable behavior:**
- Trolling, insulting/derogatory comments, and personal attacks
- Public or private harassment
- Publishing others' private information without permission
- Other conduct which could reasonably be considered inappropriate

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git
- Supabase account (for backend features)
- Basic knowledge of React, TypeScript, and Web Audio API

### Setting Up Your Development Environment

1. **Fork the repository**
   - Click the "Fork" button at the top right of the repository page

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/pulseplay-ai.git
   cd pulseplay-ai
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/pulseplay-ai.git
   ```

4. **Install dependencies**
   ```bash
   npm install
   ```

5. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

---

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

**Bug Report Template:**
```markdown
**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
 - OS: [e.g. Windows, macOS, Linux]
 - Browser: [e.g. Chrome 120, Firefox 115]
 - Version: [e.g. 0.1.0]

**Additional context**
Add any other context about the problem here.
```

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

**Enhancement Template:**
```markdown
**Is your feature request related to a problem?**
A clear description of what the problem is.

**Describe the solution you'd like**
A clear description of what you want to happen.

**Describe alternatives you've considered**
Any alternative solutions or features you've considered.

**Additional context**
Add any other context or screenshots about the feature request.
```

### Your First Code Contribution

Unsure where to begin? You can start by looking through these issue labels:
- `good-first-issue` - Issues that are good for newcomers
- `help-wanted` - Issues that need attention
- `bug` - Bug fixes
- `enhancement` - New features
- `documentation` - Documentation improvements

---

## Development Workflow

### Branch Naming Convention

Use descriptive branch names following this pattern:
```
<type>/<short-description>
```

**Types:**
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions/updates
- `chore/` - Maintenance tasks

**Examples:**
```bash
feature/add-binaural-beats
fix/audio-context-suspend-issue
docs/update-api-reference
refactor/optimize-rhythm-detection
```

### Development Process

1. **Create a new branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clean, readable code
   - Follow the style guidelines
   - Add comments for complex logic
   - Update documentation if needed

3. **Test your changes**
   ```bash
   npm run typecheck  # Check TypeScript
   npm run lint       # Check linting
   npm run build      # Ensure build works
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

5. **Keep your branch updated**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create a Pull Request**
   - Go to the repository on GitHub
   - Click "New Pull Request"
   - Select your branch
   - Fill out the PR template

---

## Style Guidelines

### TypeScript Style Guide

**1. Use TypeScript Types**
```typescript
// ✅ Good
interface UserData {
  id: string;
  name: string;
  email?: string;
}

function processUser(user: UserData): void {
  // ...
}

// ❌ Bad
function processUser(user: any) {
  // ...
}
```

**2. Prefer Interfaces over Types for Objects**
```typescript
// ✅ Good
interface ComponentProps {
  title: string;
  count: number;
}

// ⚠️ Acceptable but less preferred
type ComponentProps = {
  title: string;
  count: number;
};
```

**3. Use Const Assertions**
```typescript
// ✅ Good
const moods = ['Calm', 'Focus', 'Energy'] as const;
type MoodType = typeof moods[number];
```

### React Style Guide

**1. Functional Components**
```typescript
// ✅ Good
export const MyComponent = ({ prop1, prop2 }: MyComponentProps) => {
  return <div>{prop1}</div>;
};

// ❌ Bad - no class components
class MyComponent extends React.Component { }
```

**2. Props Interface**
```typescript
// ✅ Good
interface MyComponentProps {
  title: string;
  onAction: () => void;
  optional?: number;
}

export const MyComponent = ({ title, onAction, optional }: MyComponentProps) => {
  // ...
};
```

**3. Hooks Order**
```typescript
// ✅ Good - consistent order
export const MyComponent = () => {
  // 1. State
  const [state, setState] = useState();
  
  // 2. Custom hooks
  const { value } = useCustomHook();
  
  // 3. Refs
  const ref = useRef();
  
  // 4. Effects
  useEffect(() => { }, []);
  
  // 5. Callbacks/handlers
  const handleClick = useCallback(() => { }, []);
  
  // 6. Render
  return <div />;
};
```

### CSS/Tailwind Style Guide

**1. Class Order**
```tsx
// Layout → Spacing → Sizing → Appearance → Text
<div className="flex items-center gap-3 p-4 bg-slate-800 rounded-lg text-white">
```

**2. Responsive Design**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
```

**3. Dark Theme Colors**
```tsx
// Use slate colors for consistency
bg-slate-900   // Darker backgrounds
bg-slate-800   // Cards
bg-slate-700   // Inputs, hover states
text-slate-400 // Secondary text
text-white     // Primary text
```

### File Structure

**Component File:**
```typescript
// 1. Imports (external first, then internal)
import { useState, useEffect } from 'react';
import { Icon } from 'lucide-react';
import { useCustomHook } from '../hooks/useCustomHook';

// 2. Type definitions
interface ComponentProps {
  prop1: string;
}

// 3. Constants
const CONSTANT_VALUE = 100;

// 4. Helper functions (if component-specific)
const helperFunction = () => { };

// 5. Component
export const ComponentName = ({ prop1 }: ComponentProps) => {
  // Component logic
};
```

---

## Commit Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Code style changes (formatting, missing semi-colons, etc.)
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks, dependency updates

### Examples

```bash
feat(audio): add binaural beats support

Implement binaural beat generation using dual oscillators
with configurable frequency difference for theta/alpha/beta waves.

Closes #123

---

fix(rhythm): prevent negative BPM calculations

Add validation to ensure average interval is never zero,
preventing division by zero errors in BPM calculation.

Fixes #456

---

docs(api): update authentication examples

Add code examples for all auth methods including
sign up, sign in, sign out, and session management.

---

refactor(hooks): optimize rhythm detection performance

- Reduce calculation frequency from 100ms to 1s
- Limit keystroke array to 50 entries
- Use 5-second window for recent events

---

chore: update dependencies to latest versions

Update React to 18.3.1, TypeScript to 5.5, and Vite to 5.4.2
```

---

## Pull Request Process

### Before Submitting

1. **Ensure your code follows the style guidelines**
2. **Add/update tests if applicable**
3. **Update documentation if needed**
4. **Run all checks:**
   ```bash
   npm run typecheck
   npm run lint
   npm run build
   ```
5. **Test your changes thoroughly**
6. **Rebase on latest main:**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

### Pull Request Template

When creating a PR, use this template:

```markdown
## Description
Brief description of what this PR does.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Changes Made
- List of specific changes
- Another change
- Yet another change

## Testing
Describe how you tested your changes:
- [ ] Tested locally
- [ ] Tested in production build
- [ ] Added/updated tests
- [ ] All tests pass

## Screenshots (if applicable)
Add screenshots to help explain your changes.

## Checklist
- [ ] My code follows the style guidelines
- [ ] I have performed a self-review
- [ ] I have commented my code where necessary
- [ ] I have updated the documentation
- [ ] My changes generate no new warnings
- [ ] I have tested my changes
- [ ] All tests pass locally

## Related Issues
Closes #(issue number)
Related to #(issue number)
```

### Review Process

1. **Automated Checks**: CI/CD will run TypeScript checks, linting, and build
2. **Code Review**: At least one maintainer will review your code
3. **Address Feedback**: Make requested changes and push updates
4. **Approval**: Once approved, a maintainer will merge your PR

### After Merge

1. **Delete your branch** (optional but recommended)
   ```bash
   git branch -d feature/your-feature-name
   git push origin --delete feature/your-feature-name
   ```

2. **Update your fork**
   ```bash
   git checkout main
   git pull upstream main
   git push origin main
   ```

---

## Testing Guidelines

### Manual Testing Checklist

When testing your changes, verify:

- [ ] **Audio Functionality**
  - Audio plays/stops correctly
  - Volume control works
  - Mood changes apply correctly
  - Accessibility mode functions

- [ ] **Rhythm Detection**
  - Keystroke tracking works
  - BPM calculates correctly
  - Intensity levels update appropriately

- [ ] **UI/UX**
  - All buttons and controls work
  - Responsive on different screen sizes
  - Dark theme consistency
  - No layout issues

- [ ] **Authentication**
  - Sign up works
  - Sign in works
  - Sign out works
  - Session persists on refresh

- [ ] **Database Operations**
  - Sessions save correctly
  - User preferences persist
  - No RLS policy errors

- [ ] **Browser Compatibility**
  - Chrome
  - Firefox
  - Safari
  - Edge

### Writing Tests (Future)

When we implement testing:

```typescript
// Example test structure
describe('ComponentName', () => {
  it('should render correctly', () => {
    // Test implementation
  });

  it('should handle user interaction', () => {
    // Test implementation
  });
});
```

---

## Documentation Guidelines

### When to Update Documentation

Update documentation when you:
- Add a new feature
- Change existing functionality
- Add/modify APIs or hooks
- Fix a bug that affects documented behavior
- Add new configuration options

### Documentation Files

- **README.md** - Project overview and quick start
- **DOCUMENTATION.md** - Complete project documentation
- **API_REFERENCE.md** - API and interface documentation
- **DEVELOPER_GUIDE.md** - Development practices
- **ARCHITECTURE.md** - System architecture
- **QUICK_REFERENCE.md** - Quick reference guide
- **CONTRIBUTING.md** - This file

### Code Comments

```typescript
// ✅ Good - explains why, not what
// Use exponential ramping for smoother frequency transitions
// to avoid audible clicking artifacts
filter.frequency.exponentialRampToValueAtTime(targetFreq, time);

// ❌ Bad - states the obvious
// Set the frequency
filter.frequency.value = 1000;
```

---

## Community

### Getting Help

- **GitHub Issues** - For bugs and feature requests
- **GitHub Discussions** - For questions and general discussion
- **Discord** - [Join our community server]

### Recognition

Contributors will be recognized in:
- README.md Contributors section
- Release notes
- Project documentation

---

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

## Questions?

Don't hesitate to ask questions! Open an issue with the `question` label or reach out on Discord.

Thank you for contributing to PulsePlay AI! 🎵✨

---

**Last Updated**: October 18, 2025
