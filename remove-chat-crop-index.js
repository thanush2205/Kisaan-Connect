require('dotenv').config();
const mongoose = require('mongoose');

async function removeIndex() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const chatsCollection = db.collection('chats');

    console.log('\n📋 Current indexes on chats collection:');
    const indexes = await chatsCollection.indexes();
    indexes.forEach(index => {
      console.log(`  - ${index.name}:`, JSON.stringify(index.key));
    });

    // Drop the old index that includes cropId
    console.log('\n🗑️  Dropping index: participants_1_cropId_1');
    try {
      await chatsCollection.dropIndex('participants_1_cropId_1');
      console.log('✅ Index dropped successfully');
    } catch (error) {
      if (error.code === 27) {
        console.log('ℹ️  Index does not exist (already removed)');
      } else {
        throw error;
      }
    }

    console.log('\n📋 Remaining indexes:');
    const remainingIndexes = await chatsCollection.indexes();
    remainingIndexes.forEach(index => {
      console.log(`  - ${index.name}:`, JSON.stringify(index.key));
    });

    console.log('\n✅ Migration complete!');
    console.log('You can now have one chat per user pair regardless of crop.');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

removeIndex();
