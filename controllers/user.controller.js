import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";

class UserController {
  createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: 3 * 24 * 60 * 60, // 3 days
    });
  };

  loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
      if (!email || !password) {
        return res.status(400).json({ message: "Please enter all fields" });
      }
      const user = await userModel.findOne({ email: email.toLowerCase().trim() });

      if (!user) {
        return res.status(400).json({ message: "User does not exist" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
      }
      const token = this.createToken(user._id);
      res.status(200).json({ user, token });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  registerUser = async (req, res) => {
    const { name, email, password, phone_number  , priority} = req.body;
    try {
      const emailNormalized = email.toLowerCase().trim();
      const existingUser = await userModel.findOne({ email: emailNormalized });
      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
      }

      if (
        validator.isEmpty(name) ||
        validator.isEmpty(email) ||
        validator.isEmpty(password) ||
        validator.isEmpty(priority) ||
        validator.isEmpty(phone_number.toString())
      ) {
        return res.status(400).json({ message: "Please enter all fields" });
      }
      if (!validator.isEmail(email)) {
        return res.status(400).json({ message: "Please enter a valid email" });
      }
      if (!validator.isStrongPassword(password)) {
        return res
          .status(400)
          .json({ message: "Please enter a strong password" });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = new userModel({
       
        name,
        email: emailNormalized,
        password: hashedPassword,
        phone_number,
        priority
      });
      const user = await newUser.save();
      const token = this.createToken(user._id);
      res.status(200).json({ user, token });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  getUser = async (req, res) => {
    const id = req.user.id;
    try {
      const user = await userModel.findById(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(200).json({ user });
    } catch (error) {
      res.status(502).json({ message: error.message });
    }
  };
}

const userController = new UserController();
export default userController;

