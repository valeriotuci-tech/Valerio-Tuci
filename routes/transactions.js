const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const { pool } = require('../config/db');

// @route   POST api/transactions
// @desc    Create a new transaction
// @access  Private (Buyer)
router.post(
  '/',
  [
    auth,
    [
      check('property_id', 'Property ID is required').not().isEmpty(),
      check('amount', 'Amount is required').isNumeric(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Check if user is a buyer
      const user = await client.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
      if (user.rows[0].role !== 'buyer') {
        return res.status(401).json({ msg: 'Only buyers can initiate transactions' });
      }

      const { property_id, amount } = req.body;

      // Check if property exists and is available
      const property = await client.query(
        'SELECT * FROM properties WHERE id = $1 AND is_verified = true FOR UPDATE',
        [property_id]
      );

      if (property.rows.length === 0) {
        return res.status(404).json({ msg: 'Property not found or not verified' });
      }

      // Check if property is already sold
      const existingTransaction = await client.query(
        'SELECT * FROM transactions WHERE property_id = $1 AND status = $2',
        [property_id, 'completed']
      );

      if (existingTransaction.rows.length > 0) {
        return res.status(400).json({ msg: 'Property already sold' });
      }

      // Check if there's already a pending transaction for this property
      const pendingTransaction = await client.query(
        'SELECT * FROM transactions WHERE property_id = $1 AND status = $2',
        [property_id, 'pending']
      );

      if (pendingTransaction.rows.length > 0) {
        return res.status(400).json({ msg: 'There is already a pending transaction for this property' });
      }

      // Check if buyer is not the seller
      if (property.rows[0].owner_id === req.user.id) {
        return res.status(400).json({ msg: 'You cannot buy your own property' });
      }

      // Create transaction
      const newTransaction = await client.query(
        'INSERT INTO transactions (property_id, buyer_id, seller_id, amount, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [property_id, req.user.id, property.rows[0].owner_id, amount, 'pending']
      );

      await client.query('COMMIT');
      
      // In a real application, you would integrate with a payment gateway here
      // For now, we'll just return the transaction
      
      res.json(newTransaction.rows[0]);
    } catch (err) {
      await client.query('ROLLBACK');
      console.error(err.message);
      res.status(500).send('Server Error');
    } finally {
      client.release();
    }
  }
);

// @route   PATCH api/transactions/:id/verify
// @desc    Verify a transaction (for verification agents)
// @access  Private (Verification Agent)
router.patch('/:id/verify', auth, async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Check if user is a verification agent
    const user = await client.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    if (user.rows[0].role !== 'agent') {
      return res.status(401).json({ msg: 'Only verification agents can verify transactions' });
    }

    // Get transaction
    const transaction = await client.query(
      'SELECT * FROM transactions WHERE id = $1 FOR UPDATE',
      [req.params.id]
    );

    if (transaction.rows.length === 0) {
      return res.status(404).json({ msg: 'Transaction not found' });
    }

    if (transaction.rows[0].status !== 'pending') {
      return res.status(400).json({ msg: 'Only pending transactions can be verified' });
    }

    // Update transaction status to verified
    const updatedTransaction = await client.query(
      'UPDATE transactions SET status = $1, agent_id = $2, verified_at = NOW() WHERE id = $3 RETURNING *',
      ['verified', req.user.id, req.params.id]
    );

    await client.query('COMMIT');
    res.json(updatedTransaction.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err.message);
    res.status(500).send('Server Error');
  } finally {
    client.release();
  }
});

// @route   PATCH api/transactions/:id/complete
// @desc    Complete a transaction (transfer ownership)
// @access  Private (Verification Agent)
router.patch('/:id/complete', auth, async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Check if user is a verification agent
    const user = await client.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    if (user.rows[0].role !== 'agent') {
      return res.status(401).json({ msg: 'Only verification agents can complete transactions' });
    }

    // Get transaction
    const transaction = await client.query(
      `SELECT t.*, p.blockchain_hash, p.title, p.location, p.description 
       FROM transactions t 
       JOIN properties p ON t.property_id = p.id 
       WHERE t.id = $1 FOR UPDATE`,
      [req.params.id]
    );

    if (transaction.rows.length === 0) {
      return res.status(404).json({ msg: 'Transaction not found' });
    }

    if (transaction.rows[0].status !== 'verified') {
      return res.status(400).json({ msg: 'Only verified transactions can be completed' });
    }

    // In a real application, you would interact with the blockchain here
    // For example, transfer the property token to the new owner
    // const tx = await contract.transfer(transaction.rows[0].buyer_id, transaction.rows[0].property_id);
    // const receipt = await tx.wait();

    // For now, we'll just simulate the blockchain transaction
    const txHash = '0x' + Math.random().toString(16).substr(2, 64);
    const blockNumber = Math.floor(Math.random() * 1000000);

    // Record the blockchain transaction
    await client.query(
      'INSERT INTO blockchain_records (property_id, blockchain_address, token_id, previous_owner, new_owner, tx_hash, block_number) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [
        transaction.rows[0].property_id,
        '0x' + Math.random().toString(16).substr(2, 40),
        transaction.rows[0].property_id, // Using property ID as token ID for simplicity
        transaction.rows[0].seller_id,
        transaction.rows[0].buyer_id,
        txHash,
        blockNumber
      ]
    );

    // Update property ownership
    await client.query(
      'UPDATE properties SET owner_id = $1, updated_at = NOW() WHERE id = $2',
      [transaction.rows[0].buyer_id, transaction.rows[0].property_id]
    );

    // Update transaction status to completed
    const updatedTransaction = await client.query(
      'UPDATE transactions SET status = $1, completed_at = NOW(), blockchain_tx_id = $2 WHERE id = $3 RETURNING *',
      ['completed', txHash, req.params.id]
    );

    await client.query('COMMIT');
    
    // In a real application, you would send notifications to both parties here
    
    res.json({
      ...updatedTransaction.rows[0],
      blockchainTransaction: {
        txHash,
        blockNumber,
        status: 'confirmed'
      }
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err.message);
    res.status(500).send('Server Error');
  } finally {
    client.release();
  }
});

// @route   GET api/transactions/user
// @desc    Get all transactions for the current user
// @access  Private
router.get('/user', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT t.*, p.title as property_title, p.location as property_location,
       seller.name as seller_name, buyer.name as buyer_name, agent.name as agent_name
       FROM transactions t
       JOIN properties p ON t.property_id = p.id
       JOIN users seller ON t.seller_id = seller.id
       JOIN users buyer ON t.buyer_id = buyer.id
       LEFT JOIN users agent ON t.agent_id = agent.id
       WHERE t.buyer_id = $1 OR t.seller_id = $1
       ORDER BY t.created_at DESC`,
      [req.user.id]
    );
    
    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
