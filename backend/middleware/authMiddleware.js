import jwt from 'jsonwebtoken';
import { User } from '../models.js';

const JWT_SECRET = process.env.JWT_SECRET || 'expense_tracker_pro_jwt_secret_key_2026';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);

      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(401).json({ error: 'User not found or token invalid' });
      }

      req.user = user;
      return next();
    } catch (error) {
      console.error('Auth middleware token verification failed:', error.message);
      return res.status(401).json({ error: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ error: 'Not authorized, no token provided' });
  }
};
