import { prisma } from "../lib/prisma.js";
import bcrypt from "bcrypt";

export const signup = async (req, res) => {
  try {
    const { name, username, email, password, photo } = req.body;

    const generateUniqueAvatar = () => {
      const seed = username;
      return `https://api.dicebear.com/9.x/glass/svg?seed=${seed}`;
    };

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        username,
        email,
        password: hashedPassword,
        photo: photo || generateUniqueAvatar(),
      },
    });

    res.json({
      message: "SignUp successful",
      data: user,
      success: true,
    });
  } catch (error) {
    console.log("error", error);
    res
      .status(500)
      .json({ message: "Internal server error", error, success: false });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid Email" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid Password" });
    }

    res.json({ message: "user logged in successfully", data: user });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};
