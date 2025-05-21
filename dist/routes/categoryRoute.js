"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const auth = require('../middleware/authentication');
const categoryController = require('../controllers/categoryContoller');
const checkAdmin = require('../middleware/CheckSuperAdmin');
router.post('/create', auth.superAdminJWT, categoryController.createCategory);
router.get('/getall', auth.AuthJWT, categoryController.getAllCategories);
router.get('/filter', auth.AuthJWT, categoryController.filterCategoriesByAgency);
router.get('/getOne/:id', auth.AuthJWT, categoryController.getCategoryById);
router.put('/update/:id', auth.superAdminJWT, categoryController.updateCategory);
router.delete('/delete/:id', auth.superAdminJWT, categoryController.deleteCategory);
module.exports = router;
