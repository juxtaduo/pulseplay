import mongoose from 'mongoose';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AISongRecommendation } from './backend/src/models/AISongRecommendation.js';
import 'dotenv/config';

async function testGeminiAndAIRecommendations() {
  console.log('=== Testing Gemini API and AI Recommendations ===\n');

  try {
    // 1. Test Gemini API directly
    console.log('1. Testing Gemini API...');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `Analyze this focus session data and recommend a song:
Duration: 2 minutes
Average tempo: 50 keystrokes per minute
Rhythm pattern: steady

Return a JSON object with:
- song: one of ["deep-focus", "creative-flow", "calm-reading", "energized-coding"]
- rationale: brief explanation (max 100 chars)
- confidence: number between 0.0 and 1.0`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('Gemini API Response:', text);

    // Parse the JSON response
    let geminiResult;
    try {
      // Extract JSON from the response (it might have markdown formatting)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        geminiResult = JSON.parse(jsonMatch[0]);
      } else {
        geminiResult = JSON.parse(text);
      }
      console.log('✓ Gemini API working correctly\n');
    } catch (parseError) {
      console.log('✗ Failed to parse Gemini response:', parseError);
      console.log('Raw response:', text);
      return;
    }

    // 2. Test MongoDB connection
    console.log('2. Testing MongoDB connection...');
    const mongoUri = process.env.MONGODB_ATLAS_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_ATLAS_URI not set');
    }

    await mongoose.connect(mongoUri);
    console.log('✓ Connected to MongoDB');
    console.log('Database name:', mongoose.connection.name);
    console.log('Host:', mongoose.connection.host);

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection failed');
    }
    const session = await db.collection('focus_sessions').findOne({
      state: 'completed',
      totalDurationMinutes: { $gte: 1 }
    });

    if (!session) {
      console.log('No eligible session found, creating a test session...');

      // Create a test session
      const testSession = {
        _id: new mongoose.Types.ObjectId(),
        state: 'completed',
        totalDurationMinutes: 2,
        averageTempo: 50,
        rhythmData: { averageKeysPerMinute: 50 },
        keystrokeCount: 100,
        song: 'thousand-years',
        createdAt: new Date(),
        endTime: new Date()
      };

      await db.collection('focus_sessions').insertOne(testSession);
      console.log('✓ Created test session');
    }

    const sessionToUse = session || await db.collection('focus_sessions').findOne({
      state: 'completed',
      totalDurationMinutes: { $gte: 1 }
    });

    if (!sessionToUse) {
      throw new Error('Could not find or create a test session');
    }

    // Map Gemini mood to actual song
    const songMapping: Record<string, 'thousand-years' | 'kiss-the-rain' | 'river-flows' | 'gurenge'> = {
      'deep-focus': 'thousand-years',
      'creative-flow': 'river-flows',
      'calm-reading': 'kiss-the-rain',
      'energized-coding': 'gurenge',
    };

    const mappedSong = songMapping[geminiResult.song] || 'thousand-years';

    // Create AI recommendation
    const recId = `rec${Date.now()}${Math.random().toString(36).substr(2, 6)}`;
    const aiRec = new AISongRecommendation({
      recommendationId: recId,
      sessionId: sessionToUse._id.toString(),
      suggestedSong: mappedSong,
      rationale: geminiResult.rationale,
      confidence: geminiResult.confidence,
      geminiModel: 'gemini-2.0-flash-exp'
    });

    await aiRec.save();
    console.log('✓ AI Recommendation saved with ID:', recId);

    // 4. Verify the recommendation was saved
    console.log('\n4. Verifying recommendation in database...');
    const saved = await AISongRecommendation.findOne({ recommendationId: recId });
    console.log('✓ Recommendation found in database:', !!saved);

    if (saved) {
      console.log('Recommendation details:', {
        id: saved.recommendationId,
        sessionId: saved.sessionId,
        suggestedSong: saved.suggestedSong,
        rationale: saved.rationale,
        confidence: saved.confidence,
        geminiModel: saved.geminiModel
      });
    }

    // 5. Count total recommendations
    const totalCount = await AISongRecommendation.countDocuments();
    console.log('✓ Total AI recommendations in database:', totalCount);

    await mongoose.disconnect();
    console.log('\n=== All tests completed successfully! ===');

  } catch (error) {
    console.error('✗ Test failed:', error instanceof Error ? error.message : String(error));
    if (error instanceof Error) {
      console.error('Stack:', error.stack);
    }
  }
}

testGeminiAndAIRecommendations();