import axios from 'axios';

async function testAPI() {
  try {
    const response = await axios.post(
      'http://localhost:3000/api/ai/song-recommendation',
      {
        sessionId: '68f751753f968f65dab07771',
        duration: 2,
        avgTempo: 50,
        rhythmPattern: 'steady'
      },
      {
        headers: {
          'Authorization': 'Bearer test-token',
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Success:', response.status, response.data);
  } catch (error) {
    console.log('Error:', error.response?.status, error.response?.data || error.message);
  }
}

testAPI();