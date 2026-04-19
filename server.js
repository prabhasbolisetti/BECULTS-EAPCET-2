const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors()); // Allows requests from any origin
app.use(express.json()); // Built-in alternative to body-parser
app.use(express.static(__dirname)); // Serve static files

// REPLACE with your actual MongoDB Connection String
// For production, it's better to use process.env.MONGODB_URI
const mongoURI = process.env.MONGODB_URI || "mongodb+srv://gayazshaik508_db_user:eapcet_db@cluster0.uo3sdro.mongodb.net/eapcet_db?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(mongoURI)
    .then(() => console.log("DATABASE STATUS: Connected to eapcet_db successfully"))
    .catch(err => console.error("DATABASE ERROR:", err));

// User Schema
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
    completedChapters: [String],
    testScores: [{ subject: String, score: Number, total: Number, date: Date }]
}, { collection: 'users', timestamps: true, autoIndex: false }); 

const User = mongoose.model('User', UserSchema);

// Admin Schema
const AdminSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true }
}, { collection: 'admins', timestamps: true, autoIndex: false });

const Admin = mongoose.model('Admin', AdminSchema);

// Student Registration / Login Route
app.post('/api/register', async (req, res) => {
    const { name, email, phone } = req.body;

    const nameRegex = /^[A-Za-z\s]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10}$/;

    if (!nameRegex.test(name) || !emailRegex.test(email) || !phoneRegex.test(phone)) {
        return res.status(400).json({ success: false, error: "Invalid name, email, or 10-digit phone number." });
    }
    
    try {
        let user = await User.findOne({ $or: [{ phone }, { email }] });
        
        if (!user) {
            user = new User({ name, email, phone });
            await user.save();
            console.log(`[AUTH] New Student Registered: ${name} (${email})`);
            return res.status(201).json({ success: true, user });
        }
        
        console.log(`[AUTH] Student Logged In: ${name} (${email})`);
        res.status(200).json({ success: true, user });
    } catch (err) {
        console.error("Critical Error during /api/register:", err);
        res.status(500).json({ success: false, error: err.message || "Database transaction failed" });
    }
});

// Admin Registration / Login Route
app.post('/api/admin-register', async (req, res) => {
    const { name, email, phone } = req.body;

    const nameRegex = /^[A-Za-z\s]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10}$/;

    if (!nameRegex.test(name) || !emailRegex.test(email) || !phoneRegex.test(phone)) {
        return res.status(400).json({ success: false, error: "Invalid name, email, or 10-digit phone number." });
    }
    
    try {
        let admin = await Admin.findOne({ $or: [{ phone }, { email }] });
        
        if (!admin) {
            admin = new Admin({ name, email, phone });
            await admin.save();
            console.log(`[AUTH] New Admin Registered: ${name} (${email})`);
            return res.status(201).json({ success: true, admin });
        }
        
        console.log(`[AUTH] Admin Logged In: ${name} (${email})`);
        res.status(200).json({ success: true, admin });
    } catch (err) {
        console.error("Critical Error during /api/admin-register:", err);
        res.status(500).json({ success: false, error: err.message || "Database transaction failed" });
    }
});


// Session Verification Route
app.post('/api/verify', async (req, res) => {
    const { phone } = req.body;
    try {
        const user = await User.findOne({ phone });
        if (user) {
            return res.status(200).json({ success: true });
        }
        res.status(404).json({ success: false });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is live on port ${PORT}`));