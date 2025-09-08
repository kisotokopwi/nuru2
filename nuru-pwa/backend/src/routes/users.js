const express = require('express');
const router = express.Router();

// User management routes - to be implemented in next prompt
router.get('/', (req, res) => {
  res.status(501).json({ message: 'User routes will be implemented in next prompt' });
});

module.exports = router;