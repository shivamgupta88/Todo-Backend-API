import mongoose from "mongoose";

const deletedTaskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    due_date: { type: Date },
    userId: { type: String, required: true },
}, { timestamps: true });

const deletedTaskModel = mongoose.model("DeletedTask", deletedTaskSchema);

export default deletedTaskModel;
