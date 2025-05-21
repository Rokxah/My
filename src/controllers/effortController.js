const Effort = require('../models/Effort');
const Task = require('../models/Task'); // To ensure task exists and belongs to user

// POST /tasks/:taskId/efforts - Log new effort for a task
exports.postCreateEffort = async (req, res) => {
  const { hours, date } = req.body;
  const { taskId } = req.params;

  try {
    const task = await Task.findOne({ _id: taskId, user: req.session.user._id });
    if (!task) {
      // req.flash('error', 'Task not found or not authorized.');
      return res.status(404).send('Task not found or not authorized.');
    }

    if (!hours || parseFloat(hours) <= 0) {
        // req.flash('error', 'Hours must be a positive number.');
        return res.redirect(req.headers.referer || `/tasks/${taskId}/edit`);
    }

    const effort = new Effort({
      hours: parseFloat(hours),
      date: date ? new Date(date) : Date.now(), // Use provided date or default to now
      task: taskId,
      user: req.session.user._id,
    });
    await effort.save();

    // req.flash('success', 'Effort logged successfully.');
    res.redirect(req.headers.referer || `/tasks/${taskId}/edit`);
  } catch (error) {
    console.error('Error logging effort:', error);
    // req.flash('error', 'Error logging effort.');
    res.status(500).send('Error logging effort. Please try again.');
  }
};

// POST /efforts/:effortId/delete - Delete an effort log
exports.postDeleteEffort = async (req, res) => {
  const { effortId } = req.params;
  try {
    const effort = await Effort.findOne({ _id: effortId, user: req.session.user._id });
    if (!effort) {
      // req.flash('error', 'Effort log not found or not authorized.');
      return res.status(404).send('Effort log not found or not authorized.');
    }
    
    const taskId = effort.task; // To redirect back
    await Effort.deleteOne({ _id: effortId });

    // req.flash('success', 'Effort log deleted.');
    res.redirect(req.headers.referer || `/tasks/${taskId}/edit`);
  } catch (error) {
    console.error('Error deleting effort:', error);
    // req.flash('error', 'Error deleting effort.');
    res.status(500).send('Error deleting effort. Please try again.');
  }
};
