const mongoose = require('mongoose');

const mongoURI = "mongodb+srv://gayazshaik508_db_user:eapcet_db@cluster0.uo3sdro.mongodb.net/eapcet_db?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(mongoURI).then(async () => {
    try {
        const AdminSchema = new mongoose.Schema({
            name: { type: String, required: true },
            email: { type: String, required: true, unique: true },
            phone: { type: String, required: true, unique: true }
        }, { collection: 'admins', timestamps: true });

        const Admin = mongoose.model('Admin', AdminSchema);

        const name = "Vishnu";
        const email = "mail2vvardhan@gmail.com";
        const phone = "7032867543";

        console.log("Checking for admin...");
        let admin = await Admin.findOne({ $or: [{ phone }, { email }] });
        console.log("Found admin:", admin);

        if (!admin) {
            console.log("Saving new admin...");
            admin = new Admin({ name, email, phone });
            await admin.save();
            console.log("Saved.");
        }
    } catch (e) {
        console.error("Error:", e);
    } finally {
        mongoose.disconnect();
    }
});
