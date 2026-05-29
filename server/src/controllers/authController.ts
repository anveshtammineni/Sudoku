import type { RequestHandler } from 'express';
import { loginUser, registerUser, getCurrentUser } from '../services/authService.js';

export const registerController: RequestHandler = async (req, res, next) => {
  try {
    const result = await registerUser(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const loginController: RequestHandler = async (req, res, next) => {
  try {
    const result = await loginUser(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const meController: RequestHandler = async (req, res, next) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const user = await getCurrentUser(req.user.id);
    res.json({ user });
  } catch (error) {
    next(error);
  }
};

export const logoutController: RequestHandler = (_req, res) => {
  res.json({ message: 'Logged out successfully' });
};
