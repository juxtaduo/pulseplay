import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';

async function checkSession() {
  try {
    await mongoose.connect(process.env.MONGODB_ATLAS_URI);

    const sessions = await mongoose.connection.db.collection('focus_sessions')
      .find({})
      .sort({ createdAt: -1 })
      .limit(1)
      .toArray();

    const session = sessions[0];
    console.log('Latest session ID:', session._id.toString());
    console.log('Session details:');
    console.log(`State: ${session.state}`);
    console.log(`Start: ${session.startTime}`);
    console.log(`End: ${session.endTime}`);
    console.log(`Duration: ${session.totalDurationMinutes} minutes`);
    console.log(`Duration in seconds: ${Math.round(session.totalDurationMinutes * 60)}`);

  } catch (error) {
    console.error('Error:', error.message);
  }

  process.exit(0);
}

checkSession();