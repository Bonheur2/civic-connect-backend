import { Request, Response, NextFunction } from 'express';
import { IUser } from '../models/User';

interface AuthenticatedRequest extends Request {
  user?: IUser;
}

export const checkSuperAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'Authentication required' 
      });
    }

    if (req.user.role !== 'super-admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Forbidden: Only super-admins can access this resource' 
      });
    }

    next();
  } catch (error) {
    console.error('SuperAdmin check error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Internal server error during authorization check' 
    });
  }
};

export default checkSuperAdmin;