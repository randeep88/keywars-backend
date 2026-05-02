import { clerkClient } from "@clerk/clerk-sdk-node";

export const checkAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token" });

    const payload = await clerkClient.verifyToken(token, {
      clockSkewInMs: 30000,
    });
    req.auth = { userId: payload.sub };
    next();
  } catch (err) {
    console.log("err", err);
    return res.status(401).json({ error: "Unauthenticated" });
  }
};
