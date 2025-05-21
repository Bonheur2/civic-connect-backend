import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

const SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

interface DecodedToken {
  _id: string;
  role: string;
}

const verifyToken = async (req: Request, res: Response, next: NextFunction): Promise<DecodedToken | null> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      res.status(401).json({ message: 'No authentication token provided' });
      return null;
    }

    const decoded = jwt.verify(token, SECRET) as DecodedToken;
    const user = await User.findById(decoded._id);

    if (!user) {
      res.status(401).json({ message: 'User not found' });
      return null;
    }

    req.user = user;
    return decoded;
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
    return null;
  }
};

// Middleware to check if user is a super admin
export const superAdminJWT = async (req: Request, res: Response, next: NextFunction) => {
  const decoded = await verifyToken(req, res, next);
  if (!decoded) return;

  if (decoded.role !== 'super-admin') {
    return res.status(403).json({ message: 'Access denied. Super admin only.' });
  }
  next();
};

// Middleware to check if user is an agency
export const agencyJWT = async (req: Request, res: Response, next: NextFunction) => {
  const decoded = await verifyToken(req, res, next);
  if (!decoded) return;

  if (decoded.role !== 'agency') {
    return res.status(403).json({ message: 'Access denied. Agency only.' });
  }
  next();
};

// Middleware to check if user is a citizen
export const citizenJWT = async (req: Request, res: Response, next: NextFunction) => {
  const decoded = await verifyToken(req, res, next);
  if (!decoded) return;

  if (decoded.role !== 'citizen') {
    return res.status(403).json({ message: 'Access denied. Citizen only.' });
  }
  next();
};

// Middleware to check if user has any of the specified roles
export const allowRoles = (...roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const decoded = await verifyToken(req, res, next);
    if (!decoded) return;

    if (!roles.includes(decoded.role)) {
      return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
    }
    next();
  };
};