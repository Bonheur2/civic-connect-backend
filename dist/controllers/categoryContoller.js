"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.getCategoryById = exports.getCategories = exports.createCategory = void 0;
const categoryModel_1 = require("../models/categoryModel");
const createCategory = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }
        if (!['admin', 'super-admin'].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Only admins can create categories'
            });
        }
        const category = new categoryModel_1.Category({
            name: req.body.name,
            description: req.body.description,
            agency_id: req.body.agency_id
        });
        await category.save();
        res.status(201).json({
            success: true,
            message: 'Category created successfully',
            data: category
        });
    }
    catch (error) {
        console.error('Create category error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating category',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.createCategory = createCategory;
const getCategories = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }
        const categories = await categoryModel_1.Category.find()
            .populate('agency_id')
            .sort({ name: 1 });
        res.json({
            success: true,
            data: categories
        });
    }
    catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching categories',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.getCategories = getCategories;
const getCategoryById = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }
        const category = await categoryModel_1.Category.findById(req.params.id)
            .populate('agency_id');
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }
        res.json({
            success: true,
            data: category
        });
    }
    catch (error) {
        console.error('Get category error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching category',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.getCategoryById = getCategoryById;
const updateCategory = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }
        if (!['admin', 'super-admin'].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Only admins can update categories'
            });
        }
        const category = await categoryModel_1.Category.findByIdAndUpdate(req.params.id, {
            name: req.body.name,
            description: req.body.description,
            agency_id: req.body.agency_id
        }, { new: true, runValidators: true }).populate('agency_id');
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }
        res.json({
            success: true,
            message: 'Category updated successfully',
            data: category
        });
    }
    catch (error) {
        console.error('Update category error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating category',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.updateCategory = updateCategory;
const deleteCategory = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }
        if (!['admin', 'super-admin'].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Only admins can delete categories'
            });
        }
        const category = await categoryModel_1.Category.findByIdAndDelete(req.params.id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }
        res.json({
            success: true,
            message: 'Category deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting category',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.deleteCategory = deleteCategory;
exports.default = {
    createCategory: exports.createCategory,
    getCategories: exports.getCategories,
    getCategoryById: exports.getCategoryById,
    updateCategory: exports.updateCategory,
    deleteCategory: exports.deleteCategory
};
