import mongoose from 'mongoose';

let mongoMemoryServer = null;

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/smart_university';

  try {
    // Attempt standard connection first
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500, // Quick timeout to fallback if no local mongod
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    console.warn(`[Database] Local/Configured MongoDB connection failed (${err.message}).`);
    console.log(`[Database] Initializing embedded MongoDB In-Memory Server fallback...`);

    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongoMemoryServer = await MongoMemoryServer.create({
        instance: { dbName: 'smart_university' }
      });
      const memoryUri = mongoMemoryServer.getUri();
      const conn = await mongoose.connect(memoryUri);
      console.log(`[Database] MongoDB In-Memory Server Connected successfully: ${memoryUri}`);
      return conn;
    } catch (memErr) {
      console.error(`[Database] Critical: Could not connect to in-memory MongoDB either: ${memErr.message}`);
      process.exit(1);
    }
  }
};

export const closeDB = async () => {
  await mongoose.connection.close();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
};

export default connectDB;
