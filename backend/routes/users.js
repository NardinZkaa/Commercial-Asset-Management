const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users
// @access  Private (Admin/Manager only)
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'Admin' && req.user.role !== 'Manager') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { department, role, branch, page = 1, limit = 10 } = req.query;
    
    const filter = { isActive: true };
    if (department) filter.department = department;
    if (role) filter.role = role;
    if (branch) filter.branch = branch;

    const users = await User.find(filter)
      .populate('assignedAssets', 'name serialNumber category')
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(filter);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('assignedAssets', 'name serialNumber category status')
      .select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user can view this profile
    if (req.user.userId !== req.params.id && req.user.role !== 'Admin' && req.user.role !== 'Manager') {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private (Admin only or own profile)
router.put('/:id', auth, [
  body('name').optional().notEmpty().trim().escape(),
  body('email').optional().isEmail().normalizeEmail(),
  body('department').optional().isIn(['Engineering', 'Marketing', 'Design', 'HR', 'Finance', 'Operations', 'IT']),
  body('role').optional().isIn(['Admin', 'Manager', 'Employee', 'Auditor']),
  body('branch').optional().notEmpty().trim().escape()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check permissions
    const canUpdate = req.user.userId === req.params.id || req.user.role === 'Admin';
    if (!canUpdate) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Restrict role changes to Admin only
    if (req.body.role && req.user.role !== 'Admin') {
      return res.status(403).json({ error: 'Only admins can change user roles' });
    }

    const allowedUpdates = ['name', 'email', 'department', 'branch', 'preferences'];
    if (req.user.role === 'Admin') {
      allowedUpdates.push('role', 'permissions', 'isActive');
    }

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    await user.save();

    res.json({
      message: 'User updated successfully',
      user: await User.findById(user._id).select('-password')
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE /api/users/:id
// @desc    Deactivate user
// @access  Private (Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Don't allow deleting the last admin
    if (user.role === 'Admin') {
      const adminCount = await User.countDocuments({ role: 'Admin', isActive: true });
      if (adminCount <= 1) {
        return res.status(400).json({ error: 'Cannot deactivate the last admin user' });
      }
    }

    user.isActive = false;
    await user.save();

    res.json({ message: 'User deactivated successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/users/departments/list
// @desc    Get list of departments
// @access  Private
router.get('/departments/list', auth, async (req, res) => {
  try {
    const departments = await User.distinct('department');
    res.json(departments);
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/users/branches/list
// @desc    Get list of branches
// @access  Private
router.get('/branches/list', auth, async (req, res) => {
  try {
    const branches = await User.distinct('branch');
    res.json(branches);
  } catch (error) {
    console.error('Get branches error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;