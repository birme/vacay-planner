const jwt = require('jsonwebtoken');
const { getUsersDb } = require('../config/database');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const usersDb = getUsersDb();
    const user = await usersDb.get(decoded.userId);
    
    if (!user.active) {
      return res.status(403).json({ message: 'Account is inactive' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.status(403).json({ message: 'Invalid token' });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

module.exports = {
  authenticateToken,
  requireAdmin
};