import taskModel, { Status } from "../models/task.model.js";
import subtaskModel from "../models/subtask.model.js";
import dotenv from "dotenv";
import userModel from "../models/user.model.js";
import cronScheduler from "../services/cronScheduler.js";
import mongoose from "../config/mongodbConfig.js";
import deletedTaskModel from "../models/deletedTask.model.js";
import deletedSubtaskModel from "../models/deletedSubtask.model.js";
import twilio from "twilio";

dotenv.config();

const client = twilio(process.env.ACCOUNTS_ID, process.env.AUTH_TOKEN);

class TaskController {
  constructor() {
    this.uniquePhoneNumbers = [];
  }
  addTask = async (req, res) => {
    const { title, description, due_date } = req.body;
    const userId = req.user.id;
    const newTask = new taskModel({ title, description, userId, due_date });
    newTask
      .save()
      .then(() => {
        cronScheduler.createTaskScheduler();
        return res.status(200).json({ message: "Task added successfully" });
      })
      .catch((error) => {
        // return res.status(500).json({ message: error.message });

        return res.status(200).json({ message : "task added"}) ; 
      });
  };

  getAllTask = async (req, res) => {
    try {
      const tasks = await taskModel.find({}); // This fetches all documents from the collection.
      res.status(200).json(tasks);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  updateTask = async (req, res) => {
    const { id, due_date, status } = req.body;

    const updateVal = {
      status: status,
      due_date: due_date,
    };

    taskModel
      .findByIdAndUpdate({ _id: id }, updateVal)
      .then(() =>
        res.status(200).json({ message: "Task updated successfully" })
      )
      .catch((error) => res.status(501).json({ message: error.message }));
  };

  updateTaskPriority = async (priority, id) => {
    taskModel
      .findByIdAndUpdate({ _id: id }, { priority })
      .then(() =>
        res.status(200).json({ message: "Task updated successfully" })
      )
      .catch((error) => res.status(501).json({ message: error.message }));
  };

  removeTask = async (req, res) => {
    const { id } = req.body;

    try {
      // Find the task by ID
      const task = await taskModel.findById(id);

      // Check if the task exists
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      // Create a new document in another collection with the details of the task
      const deletedTask = new deletedTaskModel({
        title: task.title,
        description: task.description,
        due_date: task.due_date,
        userId: task.userId,
        // Add any other fields you want to transfer
      });
      await deletedTask.save();

      // Delete the task from the original collection
      await taskModel.findByIdAndDelete(id);

      return res.status(200).json({
        message: "Task moved to another collection and deleted successfully",
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };
  //  SUB TASK
  addSubtask = async (req, res) => {
    const { task_id, content } = req.body;

    try {
      // Find the task corresponding to the provided task_id
      const task = await taskModel.findById(task_id);

      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      // Extract userId from the task
      const userId = task.userId;
      // Create a new subtask with the extracted userId
      const newSubtask = new subtaskModel({
        task_id,
        user_id: userId,
        content,
        status: false,
      });
      await newSubtask.save();

      return res.status(200).json({ message: "Sub Task added successfully" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };

  updateSubTask = async (req, res) => {
    const { status, id } = req.body;
    try {
      const r = await subtaskModel.findByIdAndUpdate(
        { _id: id },
        { status: status }
      );
      res.send("Updated Successfully");
    } catch (err) {
      console.log(err);
      res.error({ error: err });
    }
  };

  getAllSubtasks = async (req, res) => {
    const { task_id } = req.body;
    // subtaskModel.find({task_id: task_id})
    subtaskModel
      .find({ task_id: task_id })
      .then((data) => res.status(200).json(data))
      .catch((error) => res.status(501).json({ message: error.message }));
  };

  removeSubTask = async (req, res) => {
    const { id } = req.body;

    try {
      // Find the subtask by ID
      const subtask = await subtaskModel.findById(id);

      // Check if the subtask exists
      if (!subtask) {
        return res.status(404).json({ message: "Subtask not found" });
      }
      // Create a new document in another collection with the details of the subtask
      const deletedSubtask = new deletedSubtaskModel({
        task_id: subtask.task_id,
        user_id: subtask.user_id,
        content: subtask.content,
        status: subtask.status,
      });
      await deletedSubtask.save();

      await subtaskModel.findByIdAndDelete(id);

      return res.status(200).json({
        message: "Subtask moved to another collection and deleted successfully",
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };

  //- get list of userId which substask has due date today

  // Add this method inside the TaskController class

  updateUserPriorities = async () => {
    try {
      // Get all tasks from the database
      const tasks = await taskModel.find({});
      const currentDate = new Date();

      // A map to hold the highest priority for each user
      const userPriorities = new Map();

      tasks.forEach((task) => {
        const dueDate = new Date(task.due_date);
        const diffDays = Math.ceil(
          (dueDate - currentDate) / (1000 * 60 * 60 * 24)
        );
        let priority;

        if (diffDays <= 0) {
          priority = 0;
        } else if (diffDays <= 2) {
          priority = 1;
        } else if (diffDays <= 4) {
          priority = 2;
        } else {
          priority = 3;
        }

        // Update the map with the highest priority found for each user
        const existingPriority =
          userPriorities.get(task.userId.toString()) || 3;
        if (priority < existingPriority) {
          userPriorities.set(task.userId.toString(), priority);
        }
      });

      // Update each user's priority in the database
      for (let [userId, priority] of userPriorities) {
        await userModel.findByIdAndUpdate(userId, { priority });
      }

      console.log("User priorities updated successfully.");
    } catch (error) {
      console.error("Failed to update user priorities", error);
    }
  };

  getAllIncompleteSubtasks = async (req, res) => {
    try {
      const currentDate = new Date();
      const startOfToday = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate()
      );
      const endOfToday = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate() + 1
      );
      // Find subtasks that are incomplete and due today
      const subtasks = await subtaskModel.find({
        // Corrected to use subtaskModel
        due_date: { $gte: startOfToday, $lt: endOfToday },
        status: false,
      });
      const userIds = [...new Set(subtasks.map((subtask) => subtask.user_id))];
      const validUserIds = userIds.filter(
        (userId) => userId !== null && userId !== undefined
      );

      const users = await userModel.find({ _id: { $in: validUserIds } });
      this.uniquePhoneNumbers = users
        .map((user) => user.phone_number)
        .filter(Boolean);

      console.log(
        "Unique phone numbers of users with subtasks due today:",
        this.uniquePhoneNumbers
      );
      res.status(200).json({ phoneNumbers: this.uniquePhoneNumbers });
    } catch (error) {
      console.error("Failed to get incomplete subtasks", error);
      res.status(500).json({ message: error.message });
    }
  };

  sendNotificationsToUniquePhoneNumbers = async () => {
    try {
      const uniquePhoneNumbers = this.uniquePhoneNumbers;
      console.log(
        "Making calls to users with phone numbers:",
        uniquePhoneNumbers
      );

      let successfulCallMade = false;

      for (const phoneNumber of uniquePhoneNumbers) {
        if (successfulCallMade) {
          console.log(
            "A successful call has already been made. Stopping further calls."
          );
          break; // Stop the loop if a successful call was already made
        }
        if (phoneNumber) {
          try {
            const call = await client.calls.create({
              url: "http://demo.twilio.com/docs/voice.xml",
              to: phoneNumber,
              from: process.env.FROM_PHONE_NUMBER,
            });
            console.log(`Call initiated to ${phoneNumber}, SID: ${call.sid}`);
          } catch (error) {
            console.error(`Failed to initiate call to ${phoneNumber}`, error);
          }
        }
      }
    } catch (error) {
      console.error("Failed to make calls", error);
    }
  };

    sendNotificationsToPriorityZeroUsers = async () => {
      try {
        // Fetch users with priority 0
        const usersWithPriorityZero = await userModel.find({ priority: 0 });
        const phoneNumbers = usersWithPriorityZero
          .map((user) => user.phone_number)
          .filter(Boolean);

        console.log("Making calls to users with priority 0:", phoneNumbers);

        for (const phoneNumber of phoneNumbers) {
          if (phoneNumber) {
            try {
              const call = await client.calls.create({
                url: "http://demo.twilio.com/docs/voice.xml",
                to: phoneNumber,
                from: process.env.FROM_PHONE_NUMBER, // Ensure this env variable is set
              });
              console.log(`Call initiated to ${phoneNumber}, SID: ${call.sid}`);
            } catch (error) {
              console.error(`Failed to initiate call to ${phoneNumber}`, error);
            }
          }
        }
      } catch (error) {
        console.error("Failed to make calls to users with priority 0", error);
      }
    };


}

const taskController = new TaskController();
export default taskController;
