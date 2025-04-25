import { useState, useEffect } from 'react';
import { Match } from '@/types/user';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { getMatchesForUser } from '@/services/matchingService';

export default function MatchList() {
  const [user] = useAuthState(auth);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadMatches() {
      if (!user) return;
      try {
        const userMatches = await getMatchesForUser(user.uid);
        setMatches(userMatches);
      } catch (err) {
        setError('Failed to load matches');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadMatches();
  }, [user]);

  const handleMatchAction = async (matchId: string, action: 'accept' | 'reject') => {
    if (!user) return;

    try {
      const matchRef = doc(db, 'matches', matchId);
      await updateDoc(matchRef, {
        status: action === 'accept' ? 'accepted' : 'rejected',
        updatedAt: new Date(),
      });

      setMatches((prevMatches) =>
        prevMatches.map((match) =>
          match.id === matchId
            ? { ...match, status: action === 'accept' ? 'accepted' : 'rejected' }
            : match
        )
      );
    } catch (err) {
      console.error('Error updating match status:', err);
      setError('Failed to update match status');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">No matches yet</h3>
        <p className="mt-2 text-gray-600">
          We're working on finding meaningful connections for you.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <AnimatePresence>
        {matches.map((match) => (
          <motion.div
            key={match.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white shadow rounded-lg overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Match Score: {match.matchScore}%
                </h3>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    match.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : match.status === 'accepted'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {match.status}
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">
                    Compatibility Factors
                  </h4>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center">
                      <span className="w-24 text-sm text-gray-600">
                        Values Alignment
                      </span>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full">
                        <div
                          className="h-2 bg-indigo-600 rounded-full"
                          style={{
                            width: `${match.compatibilityFactors.valuesAlignment}%`,
                          }}
                        />
                      </div>
                      <span className="ml-2 text-sm text-gray-600">
                        {match.compatibilityFactors.valuesAlignment}%
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-sm text-gray-600">
                        Goals Alignment
                      </span>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full">
                        <div
                          className="h-2 bg-indigo-600 rounded-full"
                          style={{
                            width: `${match.compatibilityFactors.goalsAlignment}%`,
                          }}
                        />
                      </div>
                      <span className="ml-2 text-sm text-gray-600">
                        {match.compatibilityFactors.goalsAlignment}%
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-sm text-gray-600">
                        Communication
                      </span>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full">
                        <div
                          className="h-2 bg-indigo-600 rounded-full"
                          style={{
                            width: `${match.compatibilityFactors.communicationStyle}%`,
                          }}
                        />
                      </div>
                      <span className="ml-2 text-sm text-gray-600">
                        {match.compatibilityFactors.communicationStyle}%
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500">
                    Match Reason
                  </h4>
                  <p className="mt-2 text-sm text-gray-600">
                    {match.matchReason}
                  </p>
                </div>
              </div>

              {match.status === 'pending' && (
                <div className="mt-6 flex space-x-3">
                  <button
                    onClick={() => handleMatchAction(match.id, 'reject')}
                    className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Not Interested
                  </button>
                  <button
                    onClick={() => handleMatchAction(match.id, 'accept')}
                    className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Connect
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
} 