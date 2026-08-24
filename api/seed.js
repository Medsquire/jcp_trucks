import connectToDatabase from './utils/db.js';
import User from './models/User.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    await connectToDatabase();
    
    const users = [
      { phone: '9999999999', password: 'adminpassword', roleId: 1, name: 'Admin User' },
      { phone: '8888888888', password: 'superpassword', roleId: 2, name: 'Supervisor User' },
      { phone: '7777777777', password: 'driverpassword1', roleId: 3, supervisorPhone: '8888888888', name: 'Driver 1' },
      { phone: '6666666666', password: 'driverpassword2', roleId: 3, supervisorPhone: '8888888888', name: 'Driver 2' }
    ];

    for (const u of users) {
      await User.findOneAndUpdate({ phone: u.phone }, u, { upsert: true });
    }

    return res.status(200).json({ message: 'Seed complete' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
