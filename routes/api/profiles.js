const express = require('express');
const router = express.Router();

// @route           GET api/profiles
// @description     Test route
// @access          Public

router.get('/', (req, res) => {
  res.send('Profiles route');
});

module.exports = router;
