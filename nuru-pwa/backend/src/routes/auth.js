const express = require('express');
const router = express.Router();

// Authentication routes - to be implemented in next prompt
router.post('/login', (req, res) => {
  res.status(501).json({ message: 'Authentication routes will be implemented in next prompt' });
});

router.post('/register', (req, res) => {
  res.status(501).json({ message: 'Authentication routes will be implemented in next prompt' });
});

router.post('/refresh', (req, res) => {
  res.status(501).json({ message: 'Authentication routes will be implemented in next prompt' });
});

router.post('/logout', (req, res) => {
  res.status(501).json({ message: 'Authentication routes will be implemented in next prompt' });
});

module.exports = router;