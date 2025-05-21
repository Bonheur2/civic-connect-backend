import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

interface ValidatedRequest extends Request {
  validatedData?: any;
}

interface ValidationSchema {
  email: string;
  password: string;
  username: string;
  role?: string;
}

// Define the schema
const schema = Joi.object<ValidationSchema>({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters long',
    'any.required': 'Password is required'
  }),
  username: Joi.string().required().messages({
    'any.required': 'Username is required'
  }),
  role: Joi.string().valid('citizen', 'admin', 'agency', 'super-admin').default('citizen')
}).options({ allowUnknown: true });

// Middleware function to validate request bodies using Joi schema
export const validateRequest = (req: ValidatedRequest, res: Response, next: NextFunction) => {
  try {
    // Get the request body data
    const data = { ...req.body };

    // Remove the 'role' property from the data if it exists
    if (data.role) {
      delete data.role;
    }

    // Validate the modified data against the schema
    const { error, value } = schema.validate(data, { 
      stripUnknown: true,
      abortEarly: false 
    });

    // Check if there's an error
    if (error) {
      const errorMessages = error.details.map(detail => detail.message);
      return res.status(400).json({ 
        success: false,
        errors: errorMessages 
      });
    }

    // Add the default 'role' to the validated data
    value.role = 'citizen';
    req.validatedData = value;
    next();
  } catch (err) {
    console.error('Validation error:', err);
    return res.status(500).json({ 
      success: false,
      error: 'Internal server error during validation' 
    });
  }
};

export default validateRequest;