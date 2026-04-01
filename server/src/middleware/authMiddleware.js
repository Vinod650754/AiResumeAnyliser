import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export const protect = async (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    const error = new Error('Not authorized');
    error.statusCode = 401;
    throw error;
  }

  const token = authHeader.split(' ')[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.userId).select('-password');

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 401;
    throw error;
  }

  req.user = user;
  next();
};

