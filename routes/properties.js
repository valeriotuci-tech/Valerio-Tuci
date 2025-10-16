const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const { pool } = require('../config/db');

// @route   GET api/properties
// @desc    Get all properties
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT p.*, u.name as owner_name FROM properties p JOIN users u ON p.owner_id = u.id WHERE p.is_verified = true'
    );
    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/properties/:id
// @desc    Get property by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT p.*, u.name as owner_name FROM properties p JOIN users u ON p.owner_id = u.id WHERE p.id = $1',
      [req.params.id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ msg: 'Property not found' });
    }
    
    res.json(rows[0]);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Property not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   POST api/properties
// @desc    Create a property
// @access  Private (Seller)
router.post(
  '/',
  [
    auth,
    [
      check('title', 'Title is required').not().isEmpty(),
      check('description', 'Description is required').not().isEmpty(),
      check('location', 'Location is required').not().isEmpty(),
      check('price', 'Please include a valid price').isNumeric(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Check if user is a seller
      const user = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
      if (user.rows[0].role !== 'seller') {
        return res.status(401).json({ msg: 'Not authorized to list properties' });
      }

      const { title, description, location, price, blockchain_hash } = req.body;
      
      const newProperty = await pool.query(
        'INSERT INTO properties (owner_id, title, description, location, price, blockchain_hash, is_verified) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [req.user.id, title, description, location, price, blockchain_hash || null, false]
      );

      res.json(newProperty.rows[0]);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   PUT api/properties/:id
// @desc    Update a property
// @access  Private (Owner or Admin)
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, location, price, is_verified } = req.body;
    
    // Check if property exists and user is the owner or admin
    const property = await pool.query('SELECT * FROM properties WHERE id = $1', [req.params.id]);
    
    if (property.rows.length === 0) {
      return res.status(404).json({ msg: 'Property not found' });
    }
    
    const user = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    
    if (property.rows[0].owner_id !== req.user.id && user.rows[0].role !== 'admin') {
      return res.status(401).json({ msg: 'Not authorized to update this property' });
    }
    
    // Only admins can verify properties
    const verified = user.rows[0].role === 'admin' ? is_verified : property.rows[0].is_verified;
    
    const updatedProperty = await pool.query(
      'UPDATE properties SET title = $1, description = $2, location = $3, price = $4, is_verified = $5, updated_at = NOW() WHERE id = $6 RETURNING *',
      [
        title || property.rows[0].title,
        description || property.rows[0].description,
        location || property.rows[0].location,
        price || property.rows[0].price,
        verified,
        req.params.id
      ]
    );
    
    res.json(updatedProperty.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/properties/:id
// @desc    Delete a property
// @access  Private (Owner or Admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    // Check if property exists
    const property = await pool.query('SELECT * FROM properties WHERE id = $1', [req.params.id]);
    
    if (property.rows.length === 0) {
      return res.status(404).json({ msg: 'Property not found' });
    }
    
    // Check if user is the owner or admin
    const user = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    
    if (property.rows[0].owner_id !== req.user.id && user.rows[0].role !== 'admin') {
      return res.status(401).json({ msg: 'Not authorized to delete this property' });
    }
    
    await pool.query('DELETE FROM properties WHERE id = $1', [req.params.id]);
    
    res.json({ msg: 'Property removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
