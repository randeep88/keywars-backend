import { decode } from "@auth/core/jwt";

export const authMiddleware = async (req, res, next) => {
  const token = req.cookies["__Secure-authjs.session-token"];

  if (!token) return res.status(401).json({ error: "Unauthorized" });

  const decoded = await decode({
    token,
    secret: process.env.BETTER_AUTH_SECRET,
    salt: "__Secure-authjs.session-token",
  });

  if (!decoded) return res.status(401).json({ error: "Invalid token" });

  req.user = decoded;
  next();
};
