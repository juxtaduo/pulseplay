/**
 * Frontend type definitions for PulsePlay
 * @module types
 */

import type { Song } from '../../backend/src/types';

/**
 * Mood type alias for Song (maintains frontend compatibility)
 */
export type Mood = Song;

/**
 * Re-export backend types
 */
export type { Song } from '../../backend/src/types';