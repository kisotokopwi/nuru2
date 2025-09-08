const express = require('express');
const router = express.Router();

// Invoice management routes - to be implemented in future prompts
router.get('/', (req, res) => {
  res.status(501).json({ message: 'Invoice routes will be implemented in future prompts' });
});

module.exports = router;