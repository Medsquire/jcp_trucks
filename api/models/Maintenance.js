import mongoose from 'mongoose';

const MaintenanceSchema = new mongoose.Schema({
  phone: { type: String, required: true },
  details: { type: String },
  photos: [String],
  status: { type: String, default: 'pending' }, // pending, resolved
}, { timestamps: true });

export default mongoose.models.Maintenance || mongoose.model('Maintenance', MaintenanceSchema);
