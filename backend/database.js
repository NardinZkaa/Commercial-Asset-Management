const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/assetflow', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`📊 MongoDB Connected: ${conn.connection.host}`);
    
    // Create indexes for better performance
    await createIndexes();
    
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const createIndexes = async () => {
  try {
    const Asset = require('./models/Asset');
    const User = require('./models/User');
    const MaintenanceRequest = require('./models/MaintenanceRequest');
    
    // Asset indexes
    await Asset.collection.createIndex({ serialNumber: 1 }, { unique: true });
    await Asset.collection.createIndex({ category: 1, status: 1 });
    await Asset.collection.createIndex({ branch: 1 });
    await Asset.collection.createIndex({ assignedTo: 1 });
    await Asset.collection.createIndex({ nextAuditDate: 1 });
    await Asset.collection.createIndex({ qrCodeIdentifier: 1 }, { unique: true });
    
    // User indexes
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ username: 1 }, { unique: true });
    await User.collection.createIndex({ role: 1, department: 1 });
    
    // Maintenance request indexes
    await MaintenanceRequest.collection.createIndex({ asset: 1 });
    await MaintenanceRequest.collection.createIndex({ requestedBy: 1 });
    await MaintenanceRequest.collection.createIndex({ assignedTo: 1 });
    await MaintenanceRequest.collection.createIndex({ status: 1, priority: 1 });
    await MaintenanceRequest.collection.createIndex({ createdAt: -1 });
    
    console.log('📈 Database indexes created successfully');
  } catch (error) {
    console.error('❌ Error creating indexes:', error);
  }
};

module.exports = connectDB;