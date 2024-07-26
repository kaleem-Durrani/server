import jwt from "jsonwebtoken";

const generateToken = (userId, isVerified) => {
  const token = jwt.sign({ userId, isVerified }, process.env.JWT_SECRET, {
    expiresIn: "15d",
  });
  return token;
};

export default generateToken;
