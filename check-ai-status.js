import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";

async function checkAIStatus() {
  try {
    console.log("Checking AI recommendation status...");
    await mongoose.connect(process.env.MONGODB_ATLAS_URI);
    console.log("✅ Connected to MongoDB Atlas");

    const { FocusSessionModel } = await import("./backend/dist/models/FocusSession.js");
    const { AISongRecommendation } = await import("./backend/dist/models/AISongRecommendation.js");

    // Check recent sessions
    console.log("\n=== RECENT SESSIONS ===");
    const sessions = await FocusSessionModel.find({}).sort({ createdAt: -1 }).limit(10);

    for (const session of sessions) {
      const duration = session.totalDurationMinutes || 0;
      const qualifies = duration >= 0.5; // 30 seconds
      console.log(`Session: ${session._id}`);
      console.log(`  Duration: ${duration.toFixed(2)} min (${qualifies ? 'QUALIFIES' : 'TOO SHORT'})`);
      console.log(`  State: ${session.state}`);
      console.log(`  Created: ${session.createdAt}`);

      // Check if AI recommendation exists for this session
      const rec = await AISongRecommendation.findOne({ sessionId: session._id.toString() });
      if (rec) {
        console.log(`  ✅ AI Recommendation: ${rec.suggestedSong} (confidence: ${rec.confidence})`);
      } else {
        console.log(`  ❌ No AI recommendation`);
      }
      console.log('');
    }

    // Check total counts
    const totalSessions = await FocusSessionModel.countDocuments();
    const completedSessions = await FocusSessionModel.countDocuments({ state: 'completed' });
    const aiRecommendations = await AISongRecommendation.countDocuments();

    console.log("=== SUMMARY ===");
    console.log(`Total sessions: ${totalSessions}`);
    console.log(`Completed sessions: ${completedSessions}`);
    console.log(`AI recommendations: ${aiRecommendations}`);

    // Check sessions that should have AI recommendations
    const qualifyingSessions = await FocusSessionModel.countDocuments({
      state: 'completed',
      totalDurationMinutes: { $gte: 0.5 }
    });
    console.log(`Sessions that should have AI recs: ${qualifyingSessions}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

checkAIStatus();