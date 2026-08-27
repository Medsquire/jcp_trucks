import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  roleId: { type: Number, required: true }, // 1: Admin, 2: Supervisor, 3: Driver
  supervisorPhone: { type: String }, // For drivers to link to supervisor
  name: { type: String },
  siteid: { type: String },
  sitename: { type: String },
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
