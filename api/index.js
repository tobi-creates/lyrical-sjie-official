const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

let cached = global.mongoose;
if (!cached) cached = global.mongoose = { conn: null };
async function connectDB() {
  if (cached.conn) return cached.conn;
  cached.conn = await mongoose.connect(process.env.MONGO_URI);
  return cached.conn;
}

const bookingSchema = new mongoose.Schema({
  name: String, email: String, eventType: String, date: String, message: String
},{ timestamps: true });
const messageSchema = new mongoose.Schema({
  name: String, email: String, message: String
},{ timestamps: true });

const Booking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);

app.get('/health', async (req,res)=>{
  try { await connectDB(); res.json({connected:true}); }
  catch(e){ res.status(500).json({connected:false, error:e.message}) }
});
app.get('/bookings', async (req,res)=>{
  await connectDB(); const data = await Booking.find().sort({createdAt:-1}); res.json(data);
});
app.get('/messages', async (req,res)=>{
  await connectDB(); const data = await Message.find().sort({createdAt:-1}); res.json(data);
});
app.post('/bookings', async (req,res)=>{
  await connectDB(); const b = await Booking.create(req.body); res.json(b);
});
app.post('/messages', async (req,res)=>{
  await connectDB(); const m = await Message.create(req.body); res.json(m);
});
app.delete('/bookings/:id', async (req,res)=>{
  await connectDB(); await Booking.findByIdAndDelete(req.params.id); res.json({ok:true});
});
app.delete('/messages/:id', async (req,res)=>{
  await connectDB(); await Message.findByIdAndDelete(req.params.id); res.json({ok:true});
});

module.exports = app;