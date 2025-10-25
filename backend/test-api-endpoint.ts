import axios from 'axios';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import 'dotenv/config';

async function testAPIEndpoint() {
	try {
		await mongoose.connect(process.env.MONGODB_ATLAS_URI || '');

		// Get a session that doesn't have a recommendation yet
		const db = mongoose.connection.db;
		if (!db) {
			throw new Error('Database connection failed');
		}

		const session = await db.collection('focus_sessions').findOne({
			state: 'completed',
			totalDurationMinutes: { $gte: 1 },
		});

		if (!session) {
			console.log('No eligible session found');
			return;
		}

		console.log('Testing API endpoint for session:', session._id.toString());

		// Create a mock JWT token (this would normally come from Auth0)
		const mockToken = jwt.sign(
			{ sub: 'test-user-123', email: 'test@example.com' },
			'mock-secret-key',
			{ expiresIn: '1h' }
		);

		try {
			const response = await axios.post(
				'http://localhost:3001/api/ai/song-recommendation',
				{
					sessionId: session._id.toString(),
					duration: Math.floor(session.totalDurationMinutes || 1),
					avgTempo: session.averageTempo || 50,
					rhythmPattern: 'steady',
				},
				{
					headers: {
						Authorization: `Bearer ${mockToken}`,
						'Content-Type': 'application/json',
					},
				}
			);

			console.log('API Response:', response.status, response.data);
		} catch (apiError: unknown) {
			const error = apiError as {
				response?: { status?: number; data?: unknown };
				message?: string;
			};
			console.log('API Error:', error.response?.status, error.response?.data || error.message);
		}

		await mongoose.disconnect();
	} catch (error) {
		console.error('Error:', error instanceof Error ? error.message : String(error));
	}
}

testAPIEndpoint();
