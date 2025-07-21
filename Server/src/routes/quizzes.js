const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validateRequest, quizCreateSchema } = require('../middleware/validation');

// Get all quizzes
router.get('/', quizController.getAllQuizzes);
// Get quiz by ID
router.get('/:id', quizController.getQuizById);
// Create new quiz (admin only)
router.post('/', authenticateToken, requireAdmin, validateRequest(quizCreateSchema), quizController.createQuiz);
// Update quiz (admin only)
router.put('/:id', authenticateToken, requireAdmin, validateRequest(quizCreateSchema), quizController.updateQuiz);
// Delete quiz (admin only)
router.delete('/:id', authenticateToken, requireAdmin, quizController.deleteQuiz);

module.exports = router; 