const express = require('express');
const noteController = require('../controllers/noteController');
const isAuth = require('../middleware/isAuth');
const router = express.Router();

router.use(isAuth); // All note routes require authentication

// Create a note for a specific task
router.post('/tasks/:taskId/notes', noteController.postCreateNote);

// Delete a specific note
router.post('/notes/:noteId/delete', noteController.postDeleteNote);

module.exports = router;
