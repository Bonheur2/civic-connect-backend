"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkSuperAdmin = void 0;
const checkSuperAdmin = (req, res, next) => {
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
    }
    catch (error) {
        console.error('SuperAdmin check error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error during authorization check'
        });
    }
};
exports.checkSuperAdmin = checkSuperAdmin;
exports.default = exports.checkSuperAdmin;
