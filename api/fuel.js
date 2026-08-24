import connectToDatabase from './utils/db.js';
import Fuel from './models/Fuel.js';
import User from './models/User.js';

export default async function handler(req, res) {
  try {
    await connectToDatabase();
    
    if (req.method === 'POST') {
      const data = req.body;
      const fuel = new Fuel(data);
      await fuel.save();
      return res.status(200).json(fuel);
    } 
    else if (req.method === 'GET') {
      const filter = {};
      if (req.query.phone) filter.phone = req.query.phone;
      
      if (req.query.supervisorPhone) {
        const drivers = await User.find({ supervisorPhone: req.query.supervisorPhone });
        filter.phone = { $in: drivers.map(d => d.phone) };
      }
      
      const records = await Fuel.find(filter).sort({ createdAt: -1 });
      return res.status(200).json(records);
    }
    
    return res.status(405).end();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
