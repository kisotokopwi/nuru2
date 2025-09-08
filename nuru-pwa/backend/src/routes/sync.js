const express = require('express');
const router = express.Router();

// Offline sync routes - to be implemented in future prompts
router.post('/upload', (req, res) => {
  res.status(501).json({ message: 'Sync routes will be implemented in future prompts' });
});

module.exports = router;