import React, { useState } from 'react';
import { X, CheckCircle, XCircle, Award } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import ApiService from '../services/api';

const QuizModal = ({ quiz, odd, isOpen, onClose, onComplete }) => {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState(null);
  const { toast } = useToast();

  const handleAnswerSelect = (answerIndex) => {
    if (showResult) return; // Prevent changing answer after submission
    setSelectedAnswer(answerIndex);
  };

  const handleSubmit = async () => {
    if (selectedAnswer === null) {
      toast({
        title: "Select an Answer",
        description: "Please select an answer before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await ApiService.submitQuizAnswer(selectedAnswer);
      setResult(response);
      setShowResult(true);
      
      if (response.isCorrect) {
        toast({
          title: "Correct! 🎉",
          description: `You earned ${response.pointsAwarded} points!`,
        });
      } else {
        toast({
          title: "Incorrect",
          description: "Better luck next time!",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Quiz submission error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit answer",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (showResult && onComplete) {
      onComplete(result);
    }
    onClose();
    // Reset modal state
    setSelectedAnswer(null);
    setIsSubmitting(false);
    setShowResult(false);
    setResult(null);
  };

  if (!isOpen || !quiz) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">{odd?.oddId}</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                SDG Quiz
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {odd?.name?.en}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Quiz Content */}
        <div className="p-6">
          {/* Question */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Question:
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {quiz.question}
            </p>
          </div>

          {/* Answer Choices */}
          <div className="space-y-3 mb-6">
            {quiz.choices.map((choice, index) => {
              let buttonClass = "w-full p-4 text-left border-2 rounded-lg transition-all duration-200 ";
              
              if (showResult) {
                if (index === result.correctAnswer) {
                  buttonClass += "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300";
                } else if (index === selectedAnswer && !result.isCorrect) {
                  buttonClass += "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300";
                } else {
                  buttonClass += "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400";
                }
              } else if (selectedAnswer === index) {
                buttonClass += "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300";
              } else {
                buttonClass += "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-600";
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={showResult}
                  className={buttonClass}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-xs font-bold">
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className="font-medium">{choice}</span>
                    {showResult && index === result.correctAnswer && (
                      <CheckCircle className="w-5 h-5 text-green-500 ml-auto" />
                    )}
                    {showResult && index === selectedAnswer && !result.isCorrect && index !== result.correctAnswer && (
                      <XCircle className="w-5 h-5 text-red-500 ml-auto" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Result Explanation */}
          {showResult && (
            <div className={`p-4 rounded-lg mb-6 ${result.isCorrect ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'}`}>
              <div className="flex items-start space-x-3">
                {result.isCorrect ? (
                  <div className="flex items-center space-x-2 text-green-700 dark:text-green-300">
                    <CheckCircle className="w-5 h-5" />
                    <Award className="w-5 h-5" />
                  </div>
                ) : (
                  <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className={`font-semibold ${result.isCorrect ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                    {result.isCorrect ? `Correct! You earned ${result.pointsAwarded} points!` : 'Incorrect Answer'}
                  </p>
                  <p className={`text-sm mt-1 ${result.isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    The correct answer was: {quiz.choices[result.correctAnswer]}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            {!showResult ? (
              <>
                <button
                  onClick={handleClose}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={selectedAnswer === null || isSubmitting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Submit Answer</span>
                  )}
                </button>
              </>
            ) : (
              <button
                onClick={handleClose}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Continue
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizModal;
