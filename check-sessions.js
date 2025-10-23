import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function checkSessionDurations() {
  try {
    await mongoose.connect(process.env.MONGODB_ATLAS_URI);

    const sessions = await mongoose.connection.db.collection('focus_sessions')
      .find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();

    console.log('=== RECENT SESSION DURATIONS ===');
    sessions.forEach((s, i) => {
      const durationMinutes = s.totalDurationMinutes || 0;
      const durationSeconds = Math.round(durationMinutes * 60);
      const meetsThreshold = durationMinutes >= 0.5;

      console.log(`${i+1}. ID: ${s._id.toString().slice(-8)}`);
      console.log(`   State: ${s.state}`);
      console.log(`   Duration: ${durationMinutes} minutes (${durationSeconds} seconds)`);
      console.log(`   Meets AI threshold (>=30s): ${meetsThreshold ? 'YES' : 'NO'}`);
      console.log(`   Created: ${s.createdAt}`);
      console.log('');
    });

  } catch (error) {
    console.error('Error:', error.message);
  }

  process.exit(0);
}

checkSessionDurations();