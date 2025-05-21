"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.allowRoles = exports.requireAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const extractToken = (req) => {
    var _a;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.split(' ')[1];
    }
    return (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.jwt;
};
const verifyToken = (token, res) => {
    try {
        return jsonwebtoken_1.default.verify(token, SECRET);
    }
    catch (err) {
        res.status(403).json({ error: 'Failed to authenticate token. Please login again.' });
        return null;
    }
};
exports.requireAuth = {
    AuthJWT: async (req, res, next) => {
        const token = extractToken(req);
        if (!token)
            return res.status(401).json({ error: 'Authentication required. Please log in.' });
        const decoded = verifyToken(token, res);
        if (!decoded)
            return;
        req.userId = decoded.userId;
        req.role = decoded.role;
        req.username = decoded.username;
        next();
    },
    adminJWT: async (req, res, next) => {
        const token = extractToken(req);
        if (!token)
            return res.status(401).json({ error: 'Authentication required. Please log in.' });
        const decoded = verifyToken(token, res);
        if (!decoded)
            return;
        if (decoded.role !== 'admin') {
            return res.status(401).json({ error: 'You are not authorized to access this route.' });
        }
        req.userId = decoded.userId;
        req.role = decoded.role;
        req.username = decoded.username;
        next();
    },
    superAdminJWT: async (req, res, next) => {
        const token = extractToken(req);
        if (!token)
            return res.status(401).json({ error: 'Authentication required. Please log in.' });
        const decoded = verifyToken(token, res);
        if (!decoded)
            return;
        if (decoded.role !== 'super-admin') {
            return res.status(401).json({ error: 'You are not authorized to access this route.' });
        }
        req.userId = decoded.userId;
        req.role = decoded.role;
        req.username = decoded.username;
        next();
    },
    BothJWT: async (req, res, next) => {
        const token = extractToken(req);
        if (!token)
            return res.status(401).json({ error: 'Authentication required. Please log in.' });
        const decoded = verifyToken(token, res);
        if (!decoded)
            return;
        if (!['admin', 'super-admin'].includes(decoded.role)) {
            return res.status(401).json({ error: 'You are not authorized to access this route.' });
        }
        req.userId = decoded.userId;
        req.role = decoded.role;
        req.username = decoded.username;
        next();
    }
};
const allowRoles = (...roles) => {
    return async (req, res, next) => {
        const token = extractToken(req);
        if (!token)
            return res.status(401).json({ error: 'Authentication required. Please log in.' });
        const decoded = verifyToken(token, res);
        if (!decoded)
            return;
        if (!roles.includes(decoded.role)) {
            return res.status(403).json({ error: 'You are not authorized to access this route.' });
        }
        req.userId = decoded.userId;
        req.role = decoded.role;
        req.username = decoded.username;
        next();
    };
};
exports.allowRoles = allowRoles;
