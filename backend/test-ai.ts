import mongoose from 'mongoose';
import { generateSongRecommendation } from './src/services/geminiService.js';
import { AISongRecommendation } from './src/models/AISongRecommendation.js';
import 'dotenv/config';

async function testAIRecommendation() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_ATLAS_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_ATLAS_URI not set');
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection failed');
    }

    // Get a completed session >= 1 minute
    const session = await db.collection('focus_sessions').findOne({
      state: 'completed',
      totalDurationMinutes: { $gte: 1 }
    });

    if (!session) {
      console.log('No eligible session found');
      return;
    }

    console.log('Testing AI recommendation for session:', session._id.toString());

    // Test the Gemini service directly
    const result = await generateSongRecommendation({
      duration: Math.floor(session.totalDurationMinutes || 1),
      avgTempo: session.averageTempo || 50,
      rhythmPattern: 'steady'
    });

    console.log('Gemini result:', result);

    // Map Gemini mood to actual song
    const songMapping: Record<string, 'thousand-years' | 'kiss-the-rain' | 'river-flows' | 'gurenge'> = {
      'deep-focus': 'thousand-years',
      'creative-flow': 'river-flows',
      'calm-reading': 'kiss-the-rain',
      'energized-coding': 'gurenge',
    };

    const mappedSong = songMapping[result.song] || 'thousand-years';

    // Now test creating the AI recommendation document
    const recId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const aiRec = new AISongRecommendation({
      recommendationId: recId,
      sessionId: session._id.toString(),
      suggestedSong: mappedSong,
      rationale: result.rationale,
      confidence: result.confidence,
      geminiModel: 'gemini-2.5-flash'
    });

    await aiRec.save();
    console.log('AI recommendation saved successfully with ID:', recId);

    // Check if it was saved
    const saved = await AISongRecommendation.findOne({ recommendationId: recId });
    console.log('Verified saved recommendation:', !!saved);

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : String(error));
    if (error instanceof Error) {
      console.error('Stack:', error.stack);
    }
  }
}

testAIRecommendation();