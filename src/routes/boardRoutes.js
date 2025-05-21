const express = require('express');
const boardController = require('../controllers/boardController');
const isAuth = require('../middleware/isAuth'); // Authentication middleware
const router = express.Router();

// All board routes require authentication
router.use(isAuth);

router.get('/boards', boardController.getBoards);
router.get('/boards/new', boardController.getCreateBoard);
router.post('/boards', boardController.postCreateBoard);
router.get('/boards/:id', boardController.getBoard);
router.get('/boards/:id/edit', boardController.getEditBoard);
router.post('/boards/:id/update', boardController.postUpdateBoard); // Using POST for update
router.post('/boards/:id/delete', boardController.postDeleteBoard); // Using POST for delete

module.exports = router;
