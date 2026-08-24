import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import connectToDatabase from './api/utils/db.js';
import User from './api/models/User.js';

async function test() {
  try {
    console.log('Connecting to database...');
    await connectToDatabase();
    console.log('Connected!');
    
    console.log('Creating test user...');
    const user = await User.findOneAndUpdate(
      { phone: 'admin_test' },
      { phone: 'admin_test', password: '123', roleId: 1, name: 'Test Admin' },
      { upsert: true, new: true }
    );
    console.log('User created:', user);
    
    console.log('Test complete. Exiting.');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

test();
