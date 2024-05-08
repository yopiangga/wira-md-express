import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET;

export function generateToken(id: String, email: String) {
  const token = jwt.sign({ id, email }, secret as string, { expiresIn: "1d" });
  return token;
}
