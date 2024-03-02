import mongoose from "mongoose";

const deletedSubtaskInstance = mongoose.Schema(
  {
    task_id: { type: mongoose.Schema.Types.ObjectId, required: true },
    user_id: { type: mongoose.Schema.Types.ObjectId },
    content: { type: String },
    status: { type: Boolean, default: false },
    deleted_at: { type: Date, default: Date.now() },
  },
  { timestamps: true }
);

const deletedSubtaskModel = mongoose.model("DeletedSubtask", deletedSubtaskInstance);
export default deletedSubtaskModel;
