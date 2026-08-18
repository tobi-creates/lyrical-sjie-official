const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

let isConnected = false;
async function connectDB() {
  if (isConnected) return;
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI missing');
  await mongoose.connect(uri);
  isConnected = true;
}

// Schemas
const MessageSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  createdAt: { type: Date, default: Date.now }
});
const BookingSchema = new mongoose.Schema({
  name: String,
  email: String,
  eventType: String,
  date: String,
  message: String,
  createdAt: { type: Date, default: Date.now }
});

const Message = mongoose.models.Message || mongoose.model('Message', MessageSchema);
const Booking = mongoose.models.Booking || mongoose.model('Booking', BookingSchema);

// Routes
app.get('/api/health', async (req, res) => {
  try { await connectDB(); res.json({ ok: true, connected: true, db: 'lyricalsjiedb' }); }
  catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

app.post('/api/messages', async (req, res) => {
  try { await connectDB(); const doc = await Message.create(req.body); res.json({ ok: true, id: doc._id }); }
  catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

app.post('/api/bookings', async (req, res) => {
  try { await connectDB(); const doc = await Booking.create(req.body); res.json({ ok: true, id: doc._id }); }
  catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

app.get('/api/messages', async (req, res) => {
  try { await connectDB(); const data = await Message.find().sort({ createdAt: -1 }); res.json(data); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/bookings', async (req, res) => {
  try { await connectDB(); const data = await Booking.find().sort({ createdAt: -1 }); res.json(data); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = app;