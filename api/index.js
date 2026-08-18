const mongoose = require('mongoose');

let isConnected = false;
async function connectDB() {
  if (isConnected) return;
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI missing - set it in Vercel env');
  await mongoose.connect(uri);
  isConnected = true;
}

const MessageSchema = new mongoose.Schema({
  name: String, email: String, message: String,
  createdAt: { type: Date, default: Date.now }
});
const BookingSchema = new mongoose.Schema({
  name: String, email: String, eventType: String, date: String, message: String,
  createdAt: { type: Date, default: Date.now }
});

const Message = mongoose.models.Message || mongoose.model('Message', MessageSchema);
const Booking = mongoose.models.Booking || mongoose.model('Booking', BookingSchema);

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const url = req.url || '';
  try {
    await connectDB();

    if (url.includes('/api/health') || url === '/api' || url === '/api/') {
      return res.json({ ok: true, connected: true, db: 'lyricalsjiedb - 7455' });
    }
    if (url.includes('/api/messages') && req.method === 'POST') {
      const doc = await Message.create(req.body);
      return res.json({ ok: true, id: doc._id });
    }
    if (url.includes('/api/bookings') && req.method === 'POST') {
      const doc = await Booking.create(req.body);
      return res.json({ ok: true, id: doc._id });
    }
    if (url.includes('/api/messages') && req.method === 'GET') {
      const data = await Message.find().sort({ createdAt: -1 });
      return res.json(data);
    }
    if (url.includes('/api/bookings') && req.method === 'GET') {
      const data = await Booking.find().sort({ createdAt: -1 });
      return res.json(data);
    }
    return res.status(404).json({ error: 'Not found', url });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
};