import React, { useState } from 'react';
import { X, CheckCircle, XCircle, Trophy, Upload, FileText } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import ApiService from '../services/api';

const ChallengeModal = ({ challenge, odd, isOpen, onClose, onComplete, pendingChallenges }) => {
  const [decision, setDecision] = useState(null); // 'accepted', 'declined', null
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Find if this challenge is already in pending challenges
  const pendingChallenge = pendingChallenges?.find(pc => 
    pc.challenge?._id === challenge?._id
  );

  const handleAccept = async () => {
    setIsSubmitting(true);
    try {
      await ApiService.acceptChallenge();
      setDecision('accepted');
      
      toast({
        title: "Challenge Accepted! 💪",
        description: "You can upload proof whenever you're ready",
      });
      
      if (onComplete) {
        onComplete({ accepted: true });
      }
    } catch (error) {
      console.error('Accept challenge error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to accept challenge",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDecline = async () => {
    setIsSubmitting(true);
    try {
      await ApiService.declineChallenge();
      setDecision('declined');
      
      toast({
        title: "Challenge Declined",
        description: "See you tomorrow for another spin!",
      });
      
      if (onComplete) {
        onComplete({ accepted: false });
      }
      
      // Close modal after declining
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Decline challenge error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to decline challenge",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setDecision(null);
    onClose();
  };

  if (!isOpen || !challenge) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-zinc-700 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Challenge Time!</h2>
              <p className="text-zinc-400">
                ODD {odd?.oddId}: {odd?.name?.en}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-zinc-400 hover:text-white transition-colors p-2 hover:bg-zinc-700/50 rounded-lg"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Challenge Content */}
        <div className="space-y-6">
          <div className="bg-zinc-800/50 rounded-xl p-6 border border-zinc-700">
            <h3 className="text-xl font-semibold text-white mb-3">
              {challenge.title}
            </h3>
            <p className="text-zinc-300 text-lg leading-relaxed">
              {challenge.description}
            </p>
          </div>

          {/* Points Badge */}
          <div className="flex items-center justify-center">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-full font-bold text-lg shadow-lg">
              <Trophy className="h-5 w-5 inline mr-2" />
              20 Points Available
            </div>
          </div>

          {/* Decision State */}
          {decision === null && !pendingChallenge && (
            <div className="space-y-4">
              <p className="text-center text-zinc-400">
                Will you take on this challenge?
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={handleAccept}
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <CheckCircle className="h-5 w-5" />
                  <span>Accept Challenge</span>
                </button>
                <button
                  onClick={handleDecline}
                  disabled={isSubmitting}
                  className="flex-1 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 border border-zinc-600"
                >
                  <XCircle className="h-5 w-5" />
                  <span>Decline</span>
                </button>
              </div>
            </div>
          )}

          {(decision === 'accepted' || pendingChallenge?.status === 'PENDING') && (
            <div className="text-center space-y-4">
              <div className="text-green-400">
                <CheckCircle className="h-16 w-16 mx-auto mb-4" />
                <h3 className="text-2xl font-bold">Challenge Accepted! 💪</h3>
                <p className="text-zinc-300 mt-2">
                  Complete the challenge and submit proof to earn 20 points
                </p>
              </div>
              <div className="bg-blue-900/30 border border-blue-600/30 rounded-xl p-4">
                <p className="text-blue-300 text-sm">
                  💡 You can upload your proof anytime from your dashboard or return to this page later.
                </p>
              </div>
            </div>
          )}

          {pendingChallenge?.status === 'PROOF_SUBMITTED' && (
            <div className="text-center space-y-4">
              <div className="text-yellow-400">
                <FileText className="h-16 w-16 mx-auto mb-4" />
                <h3 className="text-2xl font-bold">Proof Submitted! ⏳</h3>
                <p className="text-zinc-300 mt-2">
                  Your proof is being reviewed by our admins
                </p>
              </div>
            </div>
          )}

          {pendingChallenge?.status === 'VERIFIED' && (
            <div className="text-center space-y-4">
              <div className="text-green-400">
                <Trophy className="h-16 w-16 mx-auto mb-4" />
                <h3 className="text-2xl font-bold">Proof Approved! 🎉</h3>
                <p className="text-zinc-300 mt-2">
                  Congratulations! You've earned 20 points
                </p>
              </div>
            </div>
          )}

          {pendingChallenge?.status === 'REJECTED' && (
            <div className="text-center space-y-4">
              <div className="text-red-400">
                <XCircle className="h-16 w-16 mx-auto mb-4" />
                <h3 className="text-2xl font-bold">Proof Rejected</h3>
                <p className="text-zinc-300 mt-2">
                  Please try again with better proof
                </p>
              </div>
            </div>
          )}

          {decision === 'declined' && (
            <div className="text-center space-y-4">
              <div className="text-zinc-400">
                <XCircle className="h-16 w-16 mx-auto mb-4" />
                <h3 className="text-2xl font-bold">Challenge Declined</h3>
                <p className="text-zinc-300 mt-2">
                  No worries! Come back tomorrow for another spin
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-zinc-700">
          <p className="text-center text-zinc-500 text-sm">
            Remember: You can only spin the wheel once per day!
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChallengeModal;
