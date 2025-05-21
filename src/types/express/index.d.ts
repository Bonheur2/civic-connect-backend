import { IUser } from '../../models/User';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      userId?: string;
      role?: string;
      username?: string;
      validatedData?: any;
    }
  }
}

export {};