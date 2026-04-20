import { prisma } from "../lib/prisma.js";

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    res.json({ message: "user found successfully", data: user });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

export const getUserByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    console.log("email", email);

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    res.json({ message: "user found successfully", data: user });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, username, photo } = req.body;

    const user = await prisma.user.update({
      where: {
        id,
      },
      data: {
        name,
        email,
        photo,
        username,
      },
    });

    res.json({ message: "user updated successfully", data: user });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};
