const User = require('../models/User');

// Permission check middleware
const checkPermission = (permission) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const user = await User.findById(req.user.userId);
      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      if (user.role === 'Admin' || user.permissions.includes(permission)) {
        next();
      } else {
        res.status(403).json({ 
          error: 'Insufficient permissions',
          required: permission,
          userRole: user.role,
          userPermissions: user.permissions
        });
      }
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  };
};

// Role check middleware
const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (Array.isArray(roles) ? roles.includes(req.user.role) : req.user.role === roles) {
      next();
    } else {
      res.status(403).json({ 
        error: 'Insufficient role permissions',
        required: roles,
        userRole: req.user.role
      });
    }
  };
};

// Department access middleware
const checkDepartmentAccess = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Admins and Managers can access all departments
  if (req.user.role === 'Admin' || req.user.role === 'Manager') {
    return next();
  }

  // Regular users can only access their own department data
  const requestedDepartment = req.params.department || req.body.department || req.query.department;
  
  if (requestedDepartment && requestedDepartment !== req.user.department) {
    return res.status(403).json({ 
      error: 'Access denied to other department data',
      userDepartment: req.user.department,
      requestedDepartment
    });
  }

  next();
};

// Branch access middleware
const checkBranchAccess = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Admins can access all branches
  if (req.user.role === 'Admin') {
    return next();
  }

  // Other users can only access their own branch data
  const requestedBranch = req.params.branch || req.body.branch || req.query.branch;
  
  if (requestedBranch && requestedBranch !== req.user.branch) {
    return res.status(403).json({ 
      error: 'Access denied to other branch data',
      userBranch: req.user.branch,
      requestedBranch
    });
  }

  next();
};

// Asset ownership middleware
const checkAssetOwnership = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Admins and Managers can access all assets
    if (req.user.role === 'Admin' || req.user.role === 'Manager') {
      return next();
    }

    const assetId = req.params.id || req.params.assetId || req.body.assetId;
    if (!assetId) {
      return next(); // No asset specified, let the route handle it
    }

    const Asset = require('../models/Asset');
    const asset = await Asset.findById(assetId);
    
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    // Check if user is assigned to the asset or in the same branch
    const hasAccess = asset.assignedTo?.toString() === req.user.userId || 
                     asset.branch === req.user.branch;

    if (!hasAccess) {
      return res.status(403).json({ 
        error: 'Access denied to this asset',
        reason: 'Asset not assigned to user or in different branch'
      });
    }

    next();
  } catch (error) {
    console.error('Asset ownership check error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  checkPermission,
  checkRole,
  checkDepartmentAccess,
  checkBranchAccess,
  checkAssetOwnership
};