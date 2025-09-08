const express = require('express');
const router = express.Router();

// Daily reports routes - to be implemented in future prompts
router.get('/', (req, res) => {
  res.status(501).json({ message: 'Report routes will be implemented in future prompts' });
});

module.exports = router;