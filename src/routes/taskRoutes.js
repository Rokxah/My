const express = require('express');
const taskController = require('../controllers/taskController');
const isAuth = require('../middleware/isAuth');
const router = express.Router();

router.use(isAuth); // All task routes require authentication

router.get('/tasks/new', taskController.getCreateTask); // Query param: ?boardId=xxx
router.post('/tasks', taskController.postCreateTask);
router.get('/tasks/:id/edit', taskController.getEditTask);
router.post('/tasks/:id/update', taskController.postUpdateTask);
router.post('/tasks/:id/delete', taskController.postDeleteTask);
router.post('/tasks/:id/status', taskController.postUpdateTaskStatus); // For AJAX updates

module.exports = router;
