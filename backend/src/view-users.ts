import 'dotenv/config';
import mongoose from 'mongoose';

/**
 * View all user data from MongoDB
 * Run: npm run view-users
 */

async function viewUsers() {
	console.log('🔍 Connecting to MongoDB...\n');

	const mongoUri = process.env.MONGODB_URI;
	if (!mongoUri) {
		console.error('❌ MONGODB_URI not found');
		process.exit(1);
	}

	try {
		await mongoose.connect(mongoUri);
		console.log('✅ Connected to MongoDB\n');

		const db = mongoose.connection.db;
		if (!db) {
			console.error('❌ Database connection failed');
			process.exit(1);
		}

		// Get all collections
		const collections = await db.listCollections().toArray();
		console.log(`📚 Collections in database:\n`);

		for (const collection of collections) {
			const collectionName = collection.name;
			const count = await db.collection(collectionName).countDocuments();
			console.log(`📁 ${collectionName}: ${count} documents`);
			
			if (count > 0) {
				// Show first few documents
				const docs = await db.collection(collectionName).find({}).limit(3).toArray();
				console.log(`   Sample data:`);
				docs.forEach((doc, index) => {
					console.log(`   ${index + 1}.`, JSON.stringify(doc, null, 2).substring(0, 200) + '...');
				});
			}
			console.log('');
		}

		// Show user sessions specifically
		console.log('\n🎯 Focus Sessions by User:\n');
		const sessions = await db.collection('focussessions').find({}).toArray();
		
		if (sessions.length === 0) {
			console.log('   No sessions yet. Users need to create focus sessions first!');
		} else {
			// Group by userId
			const userSessions: Record<string, number> = {};
			sessions.forEach(session => {
				const userId = session.userId || 'unknown';
				userSessions[userId] = (userSessions[userId] || 0) + 1;
			});

			Object.entries(userSessions).forEach(([userId, count]) => {
				console.log(`   👤 User: ${userId}`);
				console.log(`      Sessions: ${count}`);
			});
		}

		await mongoose.disconnect();
		console.log('\n✅ Done!');
		process.exit(0);

	} catch (error) {
		console.error('❌ Error:', error);
		process.exit(1);
	}
}

viewUsers();
