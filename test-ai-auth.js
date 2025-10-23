import https from 'https';
import dotenv from 'dotenv';
dotenv.config();

const API_BASE_URL = 'http://localhost:3001'; // Backend URL

async function testAIEndpoint() {
  try {
    console.log('Testing AI endpoint with session ID: 68fa5919f846125ab4896518');

    // First, let's check if the session exists
    const sessionResponse = await fetch(`${API_BASE_URL}/api/sessions/68fa5919f846125ab4896518`);
    console.log('Session check response:', sessionResponse.status);

    if (sessionResponse.ok) {
      const sessionData = await sessionResponse.json();
      console.log('Session data:', {
        id: sessionData.session._id,
        duration: sessionData.session.totalDurationMinutes,
        state: sessionData.session.state
      });
    }

    // Now test the AI endpoint without authentication (should fail)
    console.log('\nTesting AI endpoint WITHOUT authentication...');
    const aiResponseNoAuth = await fetch(`${API_BASE_URL}/api/ai/song-recommendation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionId: '68fa5919f846125ab4896518' }),
    });

    console.log('AI response (no auth):', aiResponseNoAuth.status);
    if (!aiResponseNoAuth.ok) {
      const errorData = await aiResponseNoAuth.text();
      console.log('Error response:', errorData);
    }

    // Test with invalid token
    console.log('\nTesting AI endpoint with INVALID token...');
    const aiResponseBadAuth = await fetch(`${API_BASE_URL}/api/ai/song-recommendation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer invalid-token',
      },
      body: JSON.stringify({ sessionId: '68fa5919f846125ab4896518' }),
    });

    console.log('AI response (bad auth):', aiResponseBadAuth.status);
    if (!aiResponseBadAuth.ok) {
      const errorData = await aiResponseBadAuth.text();
      console.log('Error response:', errorData);
    }

  } catch (error) {
    console.error('Test error:', error.message);
  }
}

testAIEndpoint();