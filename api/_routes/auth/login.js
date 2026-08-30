import connectToDatabase from '../../_utils/db.js';
import User from '../../_models/User.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    await connectToDatabase();
    const { phone, password } = req.body;

    const user = await User.findOne({ phone });
    
    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Invalid phone or password' });
    }

    // Return user without password
    const { password: _, ...userData } = user.toObject();
    return res.status(200).json(userData);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
