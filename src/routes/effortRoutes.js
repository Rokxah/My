const express = require('express');
const effortController = require('../controllers/effortController');
const isAuth = require('../middleware/isAuth');
const router = express.Router();

router.use(isAuth); // All effort routes require authentication

// Log effort for a specific task
router.post('/tasks/:taskId/efforts', effortController.postCreateEffort);

// Delete a specific effort log
router.post('/efforts/:effortId/delete', effortController.postDeleteEffort);

module.exports = router;
