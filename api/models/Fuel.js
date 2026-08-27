import mongoose from 'mongoose';

const FuelSchema = new mongoose.Schema({
  phone: { type: String, required: true },
  initialPhoto: { type: String },
  finalPhoto: { type: String },
  location: { lat: Number, lng: Number },
  sitename: { type: String },
  timestamp: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.models.Fuel || mongoose.model('Fuel', FuelSchema);
