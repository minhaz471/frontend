import { getRequest, postRequest } from "../services/apiRequests";
import { useEffect, useState, useContext, useCallback, useMemo } from "react";
import { AuthContext } from "../context/authContext";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTheme } from "../context/themeContext";

interface Post {
  id: string;
  poster: {
    id: string;
    username: string;
    profilePic: string;
  };
  pickLocation: string;
  dropLocation: string;
  cost: number;
  time: string;
  isAccepted: boolean;
}

const RidePosts = () => {
  // Context hooks
  const auth = useContext(AuthContext);
  const { darkMode } = useTheme();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [notification] = useState("You got a ride request!");

  // API endpoints
  const url = "/rides/ride-requests";
  const postUrl = "/notifications/create";

  // Memoized styles
  const styles = useMemo(() => ({
    container: darkMode
      ? "bg-gray-800 text-gray-100 border-gray-700"
      : "bg-white text-gray-900 border-gray-200",
    card: darkMode
      ? "bg-gray-700/80 border-gray-600 hover:shadow-gray-800"
      : "bg-white/80 border-gray-300 hover:shadow-xl",
    text: darkMode ? "text-gray-100" : "text-gray-800",
    secondaryText: darkMode ? "text-gray-300" : "text-gray-500",
    button: (isAccepted: boolean) => 
      darkMode
        ? isAccepted
          ? "bg-gray-600 cursor-not-allowed opacity-70"
          : "bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900"
        : isAccepted
          ? "bg-gray-400 cursor-not-allowed opacity-70"
          : "bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800"
  }), [darkMode]);

  // Data fetching
  const fetchRidePosts = useCallback(async () => {
    if (!auth?.accessToken) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await getRequest(url, auth.accessToken, setLoading, setError);
      setPosts(response || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch posts");
    } finally {
      setLoading(false);
    }
  }, [auth?.accessToken]);

  // Handle ride acceptance
  const handleAccept = useCallback(async (postId: string, posterId: string) => {
    console.log(postId);
    if (!auth?.accessToken) return;
    
    try {
      const response = await postRequest(
        { userId: posterId, message: notification },
        postUrl,
        auth.accessToken
      );
      
      if (response) {
        setSuccessMessage("Ride request accepted!");
        setTimeout(() => setSuccessMessage(null), 3000);
        fetchRidePosts(); // Refresh the list
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to accept ride");
    }
  }, [auth?.accessToken, notification, fetchRidePosts]);

  // Initial data load
  useEffect(() => {
    fetchRidePosts();
  }, [fetchRidePosts]);

  // Render loading/error states
  if (!auth) {
    return <div className="text-center p-8">Please login to view ride posts</div>;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className={`animate-spin rounded-full h-12 w-12 border-t-2 ${darkMode ? 'border-blue-400' : 'border-blue-500'}`}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center p-8 ${darkMode ? 'text-red-400' : 'text-red-500'}`}>
        <p>Error: {error}</p>
        <button 
          onClick={fetchRidePosts}
          className={`mt-4 px-4 py-2 rounded-lg ${darkMode ? 'bg-blue-600' : 'bg-blue-500'} text-white`}
        >
          Retry
        </button>
      </div>
    );
  }

  // Main render
  return (
    <div className={`max-w-3xl mx-auto p-6 md:p-8 rounded-3xl shadow-2xl border ${styles.container}`}>
      <h3 className={`text-2xl md:text-3xl font-bold mb-6 text-center ${styles.text}`}>
        🚗 Available Ride Requests
      </h3>
      
      {successMessage && (
        <div className={`mb-4 p-3 rounded-lg text-center font-medium ${
          darkMode ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-800'
        }`}>
          {successMessage}
        </div>
      )}

      {posts.length > 0 ? (
        <div className="space-y-6">
          {posts.map((post) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`relative overflow-hidden rounded-2xl p-6 border backdrop-blur-lg shadow-lg transition-all ${styles.card}`}
            >
              <div className="flex flex-col space-y-4">
                {/* Poster Info */}
                <Link to={`/user/${post.poster.id}`} className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={post.poster.profilePic || '/default-avatar.png'}
                      alt={post.poster.username}
                      className={`w-14 h-14 rounded-full border-2 ${darkMode ? 'border-blue-400' : 'border-blue-500'}`}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/default-avatar.png';
                      }}
                    />
                    {!post.isAccepted && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                    )}
                  </div>
                  <div>
                    <span className={`font-semibold ${styles.text}`}>{post.poster.username}</span>
                    <small className={`block text-sm ${styles.secondaryText}`}>
                      {new Date(post.time).toLocaleString()}
                    </small>
                  </div>
                </Link>

                {/* Ride Details */}
                <div className={`space-y-2 ${styles.text}`}>
                  <div className="flex items-center">
                    <span className="mr-2">📍</span>
                    <span>From: {post.pickLocation}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-2">🎯</span>
                    <span>To: {post.dropLocation}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-2">💰</span>
                    <span>Fare: Rs. {post.cost.toLocaleString()}</span>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => handleAccept(post.id, post.poster.id)}
                  className={`w-full py-3 mt-4 rounded-full font-semibold text-white transition-all ${styles.button(post.isAccepted)}`}
                  disabled={post.isAccepted}
                >
                  {post.isAccepted ? "Already Accepted" : "Accept Ride"}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className={`text-center py-12 ${styles.secondaryText}`}>
          <p className="text-lg">No ride requests available at the moment.</p>
          <p className="mt-2 text-sm">Check back later or create your own ride post!</p>
        </div>
      )}
    </div>
  );
};

export default RidePosts;