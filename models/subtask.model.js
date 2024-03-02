import mongoose from "mongoose";

const subTaskInstance = mongoose.Schema(
  {
    task_id: { type: String, required: true },
    user_id: { type: String },
    sub_task_id: { type: Number, require: true },
    content: { type: String },
    status: { type: Boolean, default: false },
    created_at: { type: Date },
    updated_at: { type: Date },
    deleted_at: { type: Date },
  },
  { timestamps: true }
);

const subTaskModel = mongoose.model("SubTask", subTaskInstance);
export default subTaskModel;
