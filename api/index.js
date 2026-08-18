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

const bookingSchema = new mongoose.Schema({ name:String,email:String,eventType:String,date:String,message:String },{timestamps:true});
const messageSchema = new mongoose.Schema({ name:String,email:String,message:String },{timestamps:true});
const Booking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);

const handle = (fn) => async (req,res)=>{ try{ await connectDB(); await fn(req,res); }catch(e){ res.status(500).json({error:e.message}); } };

app.get(['/','/health','/api/health'], handle(async (req,res)=> res.json({connected:true, status:'ok'})));
app.get(['/bookings','/api/bookings'], handle(async (req,res)=>{ const d=await Booking.find().sort({createdAt:-1}); res.json(d); }));
app.get(['/messages','/api/messages'], handle(async (req,res)=>{ const d=await Message.find().sort({createdAt:-1}); res.json(d); }));
app.post(['/bookings','/api/bookings'], handle(async (req,res)=>{ const b=await Booking.create(req.body); res.json(b); }));
app.post(['/messages','/api/messages'], handle(async (req,res)=>{ const m=await Message.create(req.body); res.json(m); }));
app.delete(['/bookings/:id','/api/bookings/:id'], handle(async (req,res)=>{ await Booking.findByIdAndDelete(req.params.id); res.json({ok:true}); }));
app.delete(['/messages/:id','/api/messages/:id'], handle(async (req,res)=>{ await Message.findByIdAndDelete(req.params.id); res.json({ok:true}); }));

module.exports = app;