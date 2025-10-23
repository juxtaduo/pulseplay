import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";

async function testFullAIFlow() {
  try {
    await mongoose.connect(process.env.MONGODB_ATLAS_URI);
    const { FocusSessionModel } = await import("./backend/dist/models/FocusSession.js");
    const { AISongRecommendation } = await import("./backend/dist/models/AISongRecommendation.js");
    const { generateSongRecommendation } = await import("./backend/dist/services/geminiService.js");
    const { analyzeSessionPattern } = await import("./backend/dist/services/sessionAnalyzer.js");

    // Get a qualifying session that doesn't have AI yet
    const sessions = await FocusSessionModel.find({
      state: "completed",
      totalDurationMinutes: { $gte: 0.5 }
    }).sort({ createdAt: -1 }).limit(5);

    let testSession = null;
    for (const session of sessions) {
      const existing = await AISongRecommendation.findOne({ sessionId: session._id.toString() });
      if (!existing) {
        testSession = session;
        break;
      }
    }

    if (!testSession) {
      console.log("No qualifying sessions without AI recommendations found");
      process.exit(1);
    }

    console.log(`Testing full AI flow with session: ${testSession._id}, duration: ${testSession.totalDurationMinutes} min`);

    // Simulate the AI route logic (without authentication)
    const sessionDuration = testSession.totalDurationMinutes || 0;
    const sessionDurationSeconds = sessionDuration * 60;
    const averageTempo = testSession.rhythmData.averageKeysPerMinute || 0;
    const totalKeystrokes = Math.round((averageTempo * sessionDuration));

    console.log(`Session data - Duration: ${sessionDurationSeconds}s, Tempo: ${averageTempo}, Keystrokes: ${totalKeystrokes}`);

    const analysis = analyzeSessionPattern({
      duration: sessionDurationSeconds,
      totalKeystrokes,
      averageTempo,
    });

    console.log("Analysis result:", analysis);

    // Generate Gemini AI recommendation
    const recommendation = await generateSongRecommendation({
      duration: analysis.duration,
      avgTempo: analysis.avgTempo,
      rhythmPattern: analysis.rhythmPattern,
    });

    console.log("Gemini recommendation:", recommendation);

    // Map Gemini mood to song
    const songMapping = {
      "deep-focus": "thousand-years",
      "creative-flow": "river-flows",
      "calm-reading": "kiss-the-rain",
      "energized-coding": "gurenge",
    };

    const mappedSong = songMapping[recommendation.song] || "thousand-years";

    // Save recommendation
    const aiRecommendation = new AISongRecommendation({
      recommendationId: `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sessionId: testSession._id.toString(),
      suggestedSong: mappedSong,
      rationale: recommendation.rationale,
      confidence: recommendation.confidence,
      geminiModel: "gemini-2.5-flash",
    });

    await aiRecommendation.save();
    console.log("✅ AI recommendation saved successfully!");
    console.log(`Song: ${aiRecommendation.suggestedSong}, Confidence: ${aiRecommendation.confidence}`);

  } catch (error) {
    console.error("❌ Error:", error.message);
  }

  process.exit(0);
}

testFullAIFlow();
