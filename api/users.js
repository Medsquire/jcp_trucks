import connectToDatabase from './_utils/db.js';
import User from './_models/User.js';

export default async function handler(req, res) {
  try {
    await connectToDatabase();
    
    if (req.method === 'GET') {
      const filter = {};
      if (req.query.roleId) filter.roleId = Number(req.query.roleId);
      if (req.query.supervisorPhone) filter.supervisorPhone = req.query.supervisorPhone;
      
      const users = await User.find(filter).select('-password').lean();
      return res.status(200).json(users);
    } 
    
    else if (req.method === 'POST') {
      const data = req.body;
      // Ensure phone is unique
      const existing = await User.findOne({ phone: data.phone });
      if (existing) {
        return res.status(400).json({ message: 'Phone number already exists.' });
      }
      const user = new User(data);
      await user.save();
      return res.status(201).json(user);
    }
    
    else if (req.method === 'PUT') {
      const data = req.body;
      const user = await User.findOneAndUpdate({ phone: data.phone }, data, { new: true });
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }
      return res.status(200).json(user);
    }
    
    return res.status(405).end();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
