import 'dotenv/config';
import mongoose from 'mongoose';

/**
 * Test MongoDB Atlas connection
 * Run this script to verify your MongoDB connection is working
 */

async function testConnection() {
	console.log('🔍 Testing MongoDB Atlas connection...\n');

	const mongoUri = process.env.MONGODB_URI;

	if (!mongoUri) {
		console.error('❌ ERROR: MONGODB_URI not found in environment variables');
		console.log('📝 Make sure you have a .env file in the backend directory');
		process.exit(1);
	}

	// Hide credentials in logs
	const sanitizedUri = mongoUri.replace(/\/\/.*@/, '//<credentials>@');
	console.log(`📡 Connecting to: ${sanitizedUri}\n`);

	try {
		await mongoose.connect(mongoUri, {
			serverSelectionTimeoutMS: 5000,
			socketTimeoutMS: 45000,
		});

		console.log('✅ Successfully connected to MongoDB Atlas!');
		console.log(`📊 Database: ${mongoose.connection.name}`);
		console.log(`🌍 Host: ${mongoose.connection.host}`);
		console.log(`🔗 Connection state: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Not connected'}\n`);

		// List collections
		if (mongoose.connection.db) {
			const collections = await mongoose.connection.db.listCollections().toArray();
			console.log(`📚 Collections in database (${collections.length}):`);
			if (collections.length === 0) {
				console.log('   (No collections yet - they will be created when you save data)');
			} else {
				collections.forEach((col) => {
					console.log(`   - ${col.name}`);
				});
			}
		}

		await mongoose.disconnect();
		console.log('\n✅ Connection test completed successfully!');
		process.exit(0);
	} catch (error) {
		console.error('\n❌ Connection failed!');
		console.error('Error:', error instanceof Error ? error.message : String(error));
		
		console.log('\n🔧 Troubleshooting tips:');
		console.log('1. Check your MongoDB Atlas connection string in .env');
		console.log('2. Ensure your IP address is whitelisted (0.0.0.0/0 for all IPs)');
		console.log('3. Verify your username and password are correct');
		console.log('4. Make sure your database user has proper permissions');
		console.log('5. Check if your cluster is active in MongoDB Atlas');
		
		process.exit(1);
	}
}

testConnection();
