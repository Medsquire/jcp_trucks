import mongoose from 'mongoose';

const SiteSchema = new mongoose.Schema({
  siteid: { type: String, required: true, unique: true },
  sitename: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
});

export default mongoose.models.Site || mongoose.model('Site', SiteSchema);
