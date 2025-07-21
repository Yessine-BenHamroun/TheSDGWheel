const Quiz = require('../models/Quiz');
const ODD = require('../models/ODD');
const ActivityLog = require('../models/ActivityLog');

const getAllQuizzes = async (req, res, next) => {
  try {
    const filters = { isActive: true };
    if (req.query.oddId) filters.associatedODD = req.query.oddId;
    if (req.query.difficulty) filters.difficulty = req.query.difficulty;
    const quizzes = await Quiz.find(filters)
      .populate('associatedODD', 'name icon color')
      .sort({ createdAt: -1 });
    res.json({ quizzes });
  } catch (error) {
    next(error);
  }
};

const getQuizById = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('associatedODD', 'name icon color');
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    res.json({ quiz });
  } catch (error) {
    next(error);
  }
};

const createQuiz = async (req, res, next) => {
  try {
    // Verify the associated ODD exists
    const odd = await ODD.findById(req.body.associatedODD);
    if (!odd) {
      return res.status(400).json({ error: 'Associated ODD not found' });
    }
    const quiz = new Quiz(req.body);
    await quiz.save();
    await quiz.populate('associatedODD', 'name icon color');

    // Log admin action
    if (req.user) {
      await ActivityLog.create({
        type: 'admin_action',
        user: req.user._id,
        action: 'Quiz created',
        details: `Admin created quiz: ${quiz.title}`
      });
    }

    res.status(201).json({ quiz });
  } catch (error) {
    next(error);
  }
};

const updateQuiz = async (req, res, next) => {
  try {
    const { id } = req.params;
    const allowedUpdates = ['title', 'question', 'choices', 'correctAnswer', 'points', 'difficulty', 'isActive'];
    const updates = {};
    for (const field of allowedUpdates) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid updates provided' });
    }
    const oldQuiz = await Quiz.findById(id).lean();
    const quiz = await Quiz.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).populate('associatedODD', 'name icon color');
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    if (quiz && req.user) {
      await ActivityLog.create({
        type: 'admin_action',
        user: req.user._id,
        action: 'Quiz updated',
        details: `Admin updated quiz: ${quiz.title}`,
        old: oldQuiz,
        updated: quiz
      });
    }
    res.json({ old: oldQuiz, updated: quiz });
  } catch (error) {
    next(error);
  }
};

const deleteQuiz = async (req, res, next) => {
  try {
    const { id } = req.params;
    const quiz = await Quiz.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    if (quiz && req.user) {
      await ActivityLog.create({
        type: 'admin_action',
        user: req.user._id,
        action: 'Quiz deleted',
        details: `Admin deleted quiz: ${quiz.title}`
      });
    }
    res.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz
}; 