const Task = require('../models/Task');
const Board = require('../models/Board'); // To ensure board exists and belongs to user

// GET /tasks/new - Display form to create a new task
exports.getCreateTask = async (req, res) => {
  const { boardId } = req.query;
  if (!boardId) {
    // Or handle this more gracefully, e.g., allow selecting a board
    return res.status(400).send('Board ID is required to create a task.');
  }
  try {
    const board = await Board.findOne({ _id: boardId, user: req.session.user._id });
    if (!board) {
      return res.status(404).send('Board not found or not authorized.');
    }
    res.render('tasks/create', { title: 'Create New Task', boardId, boardName: board.name });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error preparing task creation form.');
  }
};

// POST /tasks - Handle creation of a new task
exports.postCreateTask = async (req, res) => {
  const { title, description, status, boardId } = req.body;
  try {
    // Verify board exists and belongs to user
    const board = await Board.findOne({ _id: boardId, user: req.session.user._id });
    if (!board) {
      return res.status(404).send('Board not found or not authorized.');
    }
    const task = new Task({
      title,
      description,
      status: status || 'todo', // Default to 'todo'
      board: boardId,
      user: req.session.user._id,
    });
    await task.save();
    res.redirect(`/boards/${boardId}`);
  } catch (error) {
    console.error(error);
    // Consider re-rendering form with error
    res.status(500).send('Error creating task.');
  }
};

const Note = require('../models/Note'); // Already there
const Effort = require('../models/Effort'); // Add Effort model

exports.getEditTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.session.user._id })
      .populate('board');
    if (!task) {
      return res.status(404).send('Task not found.');
    }
    const notes = await Note.find({ task: task._id, user: req.session.user._id })
      .sort({ createdAt: -1 });
    const efforts = await Effort.find({ task: task._id, user: req.session.user._id })
      .sort({ date: -1 }); // Sort by most recent date

    // Calculate total effort
    const totalEffort = efforts.reduce((sum, effort) => sum + effort.hours, 0);

    res.render('tasks/edit', { 
        title: 'Edit Task', 
        task, 
        notes, 
        efforts,
        totalEffort // Pass total effort to the view
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error loading task for editing.');
  }
};

// POST /tasks/:id/update - Handle updating a task
exports.postUpdateTask = async (req, res) => {
  const { title, description, status } = req.body;
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.session.user._id },
      { title, description, status },
      { new: true }
    ).populate('board');
    if (!task) {
      return res.status(404).send('Task not found or user not authorized.');
    }
    res.redirect(`/boards/${task.board._id}`);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error updating task.');
  }
};

// POST /tasks/:id/status - Handle updating only task status (for drag & drop)
// This is an API-like endpoint, expects JSON, returns JSON
exports.postUpdateTaskStatus = async (req, res) => {
    const { status } = req.body;
    const validStatuses = ['todo', 'inprogress', 'done'];
    if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status provided.' });
    }
    try {
        const task = await Task.findOneAndUpdate(
            { _id: req.params.id, user: req.session.user._id },
            { status },
            { new: true }
        );
        if (!task) {
            return res.status(404).json({ message: 'Task not found or user not authorized.' });
        }
        res.status(200).json({ message: 'Task status updated successfully.', task });
    } catch (error) {
        console.error('Error updating task status:', error);
        res.status(500).json({ message: 'Error updating task status.' });
    }
};

// POST /tasks/:id/delete - Handle deleting a task
exports.postDeleteTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.session.user._id });
    if (!task) {
      return res.status(404).send('Task not found or user not authorized.');
    }
    const boardId = task.board;
    await Task.deleteOne({ _id: req.params.id }); // Or task.remove()
    res.redirect(`/boards/${boardId}`);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error deleting task.');
  }
};
