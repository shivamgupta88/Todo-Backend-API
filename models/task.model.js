import mongoose from "mongoose";


const Status = Object.freeze({
    TODO: "todo",
    IN_PROGRESS: "process",
    DONE: "done"
})

const taskInstance = mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    userId: { type: String, required: true },
    status: { type: String, default: Status.TODO.toString() },
    due_date: {type: Date}
}, { timestamps: true });




const taskModel = mongoose.model("Task", taskInstance);
export {Status};
export default taskModel;

