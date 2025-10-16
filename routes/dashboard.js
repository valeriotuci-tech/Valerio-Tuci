const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { pool } = require('../config/db');

// @route   GET api/dashboard
// @desc    Get dashboard data
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const user = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    
    if (user.rows.length === 0) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    let dashboardData = {
      user: {
        id: user.rows[0].id,
        name: user.rows[0].name,
        email: user.rows[0].email,
        role: user.rows[0].role,
        createdAt: user.rows[0].created_at
      },
      stats: {},
      recentTransactions: [],
      properties: []
    };
    
    // Get user's properties (for sellers)
    if (user.rows[0].role === 'seller') {
      const properties = await pool.query(
        'SELECT * FROM properties WHERE owner_id = $1 ORDER BY created_at DESC',
        [req.user.id]
      );
      dashboardData.properties = properties.rows;
      
      // Get stats for seller
      const stats = await pool.query(
        `SELECT 
          COUNT(*) as total_properties,
          SUM(CASE WHEN is_verified = true THEN 1 ELSE 0 END) as verified_properties,
          (SELECT COUNT(*) FROM transactions WHERE seller_id = $1) as total_listings,
          (SELECT COUNT(*) FROM transactions WHERE seller_id = $1 AND status = 'completed') as sold_properties,
          (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE seller_id = $1 AND status = 'completed') as total_earnings
        FROM properties 
        WHERE owner_id = $1`,
        [req.user.id]
      );
      
      dashboardData.stats = stats.rows[0];
    }
    
    // Get buyer's transactions and stats
    if (user.rows[0].role === 'buyer') {
      const stats = await pool.query(
        `SELECT 
          COUNT(*) as total_offers,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_purchases,
          (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE buyer_id = $1 AND status = 'completed') as total_spent
        FROM transactions 
        WHERE buyer_id = $1`,
        [req.user.id]
      );
      
      dashboardData.stats = stats.rows[0];
    }
    
    // Get verification agent's stats
    if (user.rows[0].role === 'agent') {
      const stats = await pool.query(
        `SELECT 
          COUNT(*) as total_verifications,
          SUM(CASE WHEN status = 'verified' THEN 1 ELSE 0 END) as pending_completion,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_verifications
        FROM transactions 
        WHERE agent_id = $1`,
        [req.user.id]
      );
      
      dashboardData.stats = stats.rows[0];
      
      // Get pending verifications
      const pendingVerifications = await pool.query(
        `SELECT t.*, p.title as property_title, p.location as property_location,
         seller.name as seller_name, buyer.name as buyer_name
         FROM transactions t
         JOIN properties p ON t.property_id = p.id
         JOIN users seller ON t.seller_id = seller.id
         JOIN users buyer ON t.buyer_id = buyer.id
         WHERE t.status = 'pending' AND t.agent_id IS NULL
         ORDER BY t.created_at DESC`
      );
      
      dashboardData.pendingVerifications = pendingVerifications.rows;
    }
    
    // Get admin stats
    if (user.rows[0].role === 'admin') {
      const stats = await pool.query(
        `SELECT 
          (SELECT COUNT(*) FROM users) as total_users,
          (SELECT COUNT(*) FROM properties) as total_properties,
          (SELECT COUNT(*) FROM transactions) as total_transactions,
          (SELECT COUNT(*) FROM transactions WHERE status = 'completed') as completed_transactions,
          (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE status = 'completed') as total_volume
        `
      );
      
      dashboardData.stats = stats.rows[0];
      
      // Get recent transactions
      const recentTransactions = await pool.query(
        `SELECT t.*, p.title as property_title, p.location as property_location,
         seller.name as seller_name, buyer.name as buyer_name, agent.name as agent_name
         FROM transactions t
         JOIN properties p ON t.property_id = p.id
         JOIN users seller ON t.seller_id = seller.id
         JOIN users buyer ON t.buyer_id = buyer.id
         LEFT JOIN users agent ON t.agent_id = agent.id
         ORDER BY t.created_at DESC
         LIMIT 10`
      );
      
      dashboardData.recentTransactions = recentTransactions.rows;
      
      // Get recent users
      const recentUsers = await pool.query(
        'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC LIMIT 5'
      );
      
      dashboardData.recentUsers = recentUsers.rows;
    }
    
    res.json(dashboardData);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
