import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function checkRecentSessions() {
  try {
    await mongoose.connect(process.env.MONGODB_ATLAS_URI);

    // Check recent focus sessions
    const sessions = await mongoose.connection.db.collection('focus_sessions')
      .find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();

    console.log('=== RECENT FOCUS SESSIONS ===');
    sessions.forEach((s, i) => {
      console.log(`${i+1}. ID: ${s._id}`);
      console.log(`   Duration: ${s.totalDurationMinutes} minutes`);
      console.log(`   State: ${s.state}`);
      console.log(`   Created: ${s.createdAt}`);
      console.log(`   Updated: ${s.updatedAt || 'N/A'}`);
      console.log('');
    });

    // Check if any AI recommendations exist for these sessions
    console.log('=== AI RECOMMENDATIONS CHECK ===');
    for (const session of sessions) {
      const aiRec = await mongoose.connection.db.collection('aisongrecommendations')
        .findOne({ sessionId: session._id.toString() });

      if (aiRec) {
        console.log(`✅ Session ${session._id.toString().slice(-8)} HAS AI recommendation:`);
        console.log(`   Song: ${aiRec.suggestedSong}`);
        console.log(`   Confidence: ${aiRec.confidence}`);
        console.log(`   Generated: ${aiRec.generatedAt}`);
      } else {
        console.log(`❌ Session ${session._id.toString().slice(-8)} has NO AI recommendation`);
      }
      console.log('');
    }

    // Check for sessions that should have AI recommendations (completed, >=0.5 min)
    const eligibleSessions = sessions.filter(s =>
      s.state === 'completed' && s.totalDurationMinutes >= 0.5
    );

    console.log('=== ELIGIBLE SESSIONS SUMMARY ===');
    console.log(`Total recent sessions: ${sessions.length}`);
    console.log(`Eligible for AI (>=30s completed): ${eligibleSessions.length}`);

    const withAI = [];
    const withoutAI = [];

    for (const session of eligibleSessions) {
      const hasAI = await mongoose.connection.db.collection('aisongrecommendations')
        .findOne({ sessionId: session._id.toString() });
      if (hasAI) {
        withAI.push(session);
      } else {
        withoutAI.push(session);
      }
    }

    console.log(`With AI recommendations: ${withAI.length}`);
    console.log(`WITHOUT AI recommendations: ${withoutAI.length}`);

    if (withoutAI.length > 0) {
      console.log('\n=== SESSIONS MISSING AI RECOMMENDATIONS ===');
      withoutAI.forEach(s => {
        console.log(`❌ ${s._id} - ${s.totalDurationMinutes}min - ${s.createdAt}`);
      });
    }

  } catch (error) {
    console.error('Error:', error.message);
  }

  process.exit(0);
}

checkRecentSessions();