const Board = require('../models/Board');
const Task = require('../models/Task'); // For later use when displaying tasks on a board

// GET /boards - Display all boards for the logged-in user
exports.getBoards = async (req, res) => {
  try {
    const boards = await Board.find({ user: req.session.user._id });
    res.render('boards/index', { title: 'Your Boards', boards });
  } catch (error) {
    console.error(error);
    // Handle error appropriately, maybe render an error page
    res.status(500).send('Error loading boards');
  }
};

// GET /boards/new - Display form to create a new board
exports.getCreateBoard = (req, res) => {
  res.render('boards/create', { title: 'Create New Board' });
};

// POST /boards - Handle creation of a new board
exports.postCreateBoard = async (req, res) => {
  const { name } = req.body;
  try {
    const board = new Board({
      name,
      user: req.session.user._id,
    });
    await board.save();
    res.redirect('/boards');
  } catch (error) {
    console.error(error);
    // Handle error, perhaps re-render form with error message
    res.status(500).send('Error creating board');
  }
};

// GET /boards/:id - Display a single board and its tasks
exports.getBoard = async (req, res) => {
  try {
    const board = await Board.findOne({ _id: req.params.id, user: req.session.user._id });
    if (!board) {
      return res.status(404).send('Board not found');
    }
    // Fetch tasks for this board - will be used more in next step
    const tasks = await Task.find({ board: board._id, user: req.session.user._id });
    res.render('boards/show', { title: board.name, board, tasks });
  } catch (error) { // Added missing opening curly brace for catch block
    console.error(error);
    res.status(500).send('Error loading board');
  }
};

// GET /boards/:id/edit - Display form to edit a board
exports.getEditBoard = async (req, res) => {
  try {
    const board = await Board.findOne({ _id: req.params.id, user: req.session.user._id });
    if (!board) {
      return res.status(404).send('Board not found');
    }
    res.render('boards/edit', { title: 'Edit Board', board });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error loading board for editing');
  }
};

// POST /boards/:id/update - Handle updating a board (using POST for simplicity, could be PUT)
exports.postUpdateBoard = async (req, res) => {
  const { name } = req.body;
  try {
    const board = await Board.findOneAndUpdate(
      { _id: req.params.id, user: req.session.user._id },
      { name },
      { new: true } // Return the updated document
    );
    if (!board) {
      return res.status(404).send('Board not found or user not authorized');
    }
    res.redirect('/boards/' + req.params.id);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error updating board');
  }
};

// POST /boards/:id/delete - Handle deleting a board
exports.postDeleteBoard = async (req, res) => {
  try {
    const board = await Board.findOne({ _id: req.params.id, user: req.session.user._id });
    if (!board) {
      return res.status(404).send('Board not found or user not authorized');
    }
    
    // Optional: Delete all tasks associated with this board
    // await Task.deleteMany({ board: board._id, user: req.session.user._id });

    await Board.deleteOne({ _id: board._id }); // Use deleteOne or findByIdAndDelete

    res.redirect('/boards');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error deleting board');
  }
};
