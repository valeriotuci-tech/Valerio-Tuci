const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

module.exports = async (req, res, next) => {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user still exists
    const user = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.user.id]);
    
    if (user.rows.length === 0) {
      return res.status(401).json({ msg: 'User no longer exists' });
    }
    
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
