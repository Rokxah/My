const Note = require('../models/Note');
const Task = require('../models/Task'); // To ensure task exists and belongs to user

// POST /tasks/:taskId/notes - Create a new note for a task
exports.postCreateNote = async (req, res) => {
  const { content } = req.body;
  const { taskId } = req.params;

  try {
    // Verify task exists and belongs to the user
    const task = await Task.findOne({ _id: taskId, user: req.session.user._id });
    if (!task) {
      // This case should ideally be handled by sending a 404 or 403
      // For now, redirecting or sending an error message
      // req.flash('error', 'Task not found or not authorized.'); // Assuming flash messages are set up
      console.log('Task not found or not authorized for note creation.'); // Placeholder for flash
      return res.redirect(req.headers.referer || `/boards/${task.board}`); // Redirect back
    }

    const note = new Note({
      content,
      task: taskId,
      user: req.session.user._id,
    });
    await note.save();

    // Redirect back to the page where the note was added (e.g., task edit page)
    // Or, if it's an AJAX request in the future, return JSON
    res.redirect(req.headers.referer || `/tasks/${taskId}/edit`);
  } catch (error) {
    console.error('Error creating note:', error);
    // Add error handling - flash message or re-render with error
    // For now, simple error response or redirect
    res.status(500).send('Error creating note. Please try again.');
  }
};

// POST /notes/:noteId/delete - Delete a note
exports.postDeleteNote = async (req, res) => {
  const { noteId } = req.params;
  try {
    const note = await Note.findOne({ _id: noteId, user: req.session.user._id });
    if (!note) {
      // Handle: Note not found or user not authorized
      // req.flash('error', 'Note not found or not authorized.');
      console.log('Note not found or not authorized for deletion.'); // Placeholder for flash
      return res.status(404).send('Note not found or not authorized.');
    }
    
    const taskId = note.task; // Get task ID to redirect back
    await Note.deleteOne({ _id: noteId });

    // Redirect back to the task edit page or where the delete was initiated
    res.redirect(req.headers.referer || `/tasks/${taskId}/edit`);
  } catch (error) {
    console.error('Error deleting note:', error);
    // Add error handling
    res.status(500).send('Error deleting note. Please try again.');
  }
};
