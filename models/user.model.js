import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    phone_number: {type: String, required: true},
    priority: {type: Number, default: 0} 
})

const userModel = mongoose.model("User", userSchema);
export default userModel;
