import { useState, useEffect } from 'react';

// Keys for localStorage
const POSTS_KEY = 'maths_solver_posts';
const COMMENTS_KEY = 'maths_solver_comments';
const USER_VOTES_KEY = 'maths_solver_user_votes';

// Default posts to show when localStorage is empty
const getDefaultPosts = () => [
  {
    id: 'default_1',
    title: 'Welcome to the Math Community!',
    description: 'This is a place to discuss math problems, share solutions, and learn together. Feel free to ask questions or share your insights!',
    topic: 'General',
    author: 'system',
    authorName: 'Math Solver Team',
    timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    votes: { up: 5, down: 0, users: {} },
    hotScore: 0,
    commentCount: 0,
  },
  {
    id: 'default_2',
    title: 'How to approach calculus problems?',
    description: 'I\'m struggling with derivatives and integrals. Any tips on how to break down complex calculus problems into manageable steps?',
    topic: 'Calculus',
    author: 'system',
    authorName: 'Anonymous User',
    timestamp: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
    votes: { up: 3, down: 1, users: {} },
    hotScore: 0,
    commentCount: 0,
  },
  {
    id: 'default_3',
    title: 'Algebra equation solving strategies',
    description: 'What are your favorite strategies for solving complex algebraic equations? Share your methods!',
    topic: 'Algebra',
    author: 'system',
    authorName: 'Anonymous User',
    timestamp: new Date(Date.now() - 21600000).toISOString(), // 6 hours ago
    votes: { up: 2, down: 0, users: {} },
    hotScore: 0,
    commentCount: 0,
  },
];

// Initialize data from localStorage
const getStoredPosts = () => {
  try {
    const stored = localStorage.getItem(POSTS_KEY);
    const posts = stored ? JSON.parse(stored) : getDefaultPosts();

    // Migrate old posts to new structure if needed
    return posts.map(post => ({
      ...post,
      votes: post.votes || { up: post.upvotes || 0, down: post.downvotes || 0, users: {} },
      hotScore: post.hotScore || 0,
      upvotes: undefined, // Remove old properties
      downvotes: undefined,
      score: undefined,
    }));
  } catch (error) {
    console.error('Error loading posts from localStorage:', error);
    return getDefaultPosts();
  }
};

const getStoredComments = () => {
  try {
    const stored = localStorage.getItem(COMMENTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading comments from localStorage:', error);
    return [];
  }
};

const getStoredUserVotes = () => {
  try {
    const stored = localStorage.getItem(USER_VOTES_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error loading user votes from localStorage:', error);
    return {};
  }
};

// Save data to localStorage
const savePosts = (posts) => {
  try {
    localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
  } catch (error) {
    console.error('Error saving posts to localStorage:', error);
  }
};

const saveComments = (comments) => {
  try {
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));
  } catch (error) {
    console.error('Error saving comments to localStorage:', error);
  }
};

const saveUserVotes = (votes) => {
  try {
    localStorage.setItem(USER_VOTES_KEY, JSON.stringify(votes));
  } catch (error) {
    console.error('Error saving user votes to localStorage:', error);
  }
};

// Generate unique IDs
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

// Get current user (for now, use anonymous with session ID)
const getCurrentUser = () => {
  let userId = sessionStorage.getItem('maths_solver_user_id');
  if (!userId) {
    userId = 'user_' + generateId();
    sessionStorage.setItem('maths_solver_user_id', userId);
  }
  return userId;
};

export const useCommunityData = () => {
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [userVotes, setUserVotes] = useState({});
  const [loading, setLoading] = useState(true);

  // Load data on mount
  useEffect(() => {
    const loadData = () => {
      setPosts(getStoredPosts());
      setComments(getStoredComments());
      setUserVotes(getStoredUserVotes());
      setLoading(false);
    };

    loadData();
  }, []);

  // Save posts whenever they change
  useEffect(() => {
    if (!loading) {
      savePosts(posts);
    }
  }, [posts, loading]);

  // Save comments whenever they change
  useEffect(() => {
    if (!loading) {
      saveComments(comments);
    }
  }, [comments, loading]);

  // Save user votes whenever they change
  useEffect(() => {
    if (!loading) {
      saveUserVotes(userVotes);
    }
  }, [userVotes, loading]);

  // Create a new post
  const createPost = (title, description, topic, image = null) => {
    const newPost = {
      id: generateId(),
      title,
      description,
      topic,
      image,
      author: getCurrentUser(),
      authorName: 'Anonymous User', // Could be enhanced with user profiles later
      timestamp: new Date().toISOString(),
      votes: { up: 0, down: 0, users: {} },
      hotScore: 0,
      commentCount: 0,
    };

    setPosts(prevPosts => [newPost, ...prevPosts]);
    return newPost.id;
  };

  // Vote on a post
  const votePost = (postId, voteType) => {
    const userId = getCurrentUser();
    const voteKey = `post_${postId}`;

    // Check if user already voted
    const existingVote = userVotes[voteKey];

    setPosts(prevPosts =>
      prevPosts.map(post => {
        if (post.id === postId) {
          const currentVotes = post.votes || { up: 0, down: 0, users: {} };
          let newVotes = { ...currentVotes };

          // Remove previous vote if exists
          if (existingVote === 'up') {
            newVotes.up--;
          } else if (existingVote === 'down') {
            newVotes.down--;
          }

          // Add new vote
          if (voteType === 'up' && existingVote !== 'up') {
            newVotes.up++;
          } else if (voteType === 'down' && existingVote !== 'down') {
            newVotes.down++;
          } else if (voteType === existingVote) {
            // Remove vote if clicking the same button
            voteType = null;
          }

          // Update hotScore
          const score = newVotes.up - newVotes.down;
          const time = new Date(post.timestamp).getTime() / 1000;
          const hotScore = Math.log10(Math.max(1, score)) + (time / 45000);

          return {
            ...post,
            votes: newVotes,
            hotScore,
          };
        }
        return post;
      })
    );

    // Update user votes
    setUserVotes(prevVotes => ({
      ...prevVotes,
      [voteKey]: voteType,
    }));
  };

  // Add a comment to a post
  const addComment = (postId, content, parentId = null) => {
    const newComment = {
      id: generateId(),
      postId,
      parentId,
      content,
      author: getCurrentUser(),
      authorName: 'Anonymous User',
      timestamp: new Date().toISOString(),
      upvotes: 0,
      downvotes: 0,
      score: 0,
    };

    setComments(prevComments => [...prevComments, newComment]);

    // Update comment count on post
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId
          ? { ...post, commentCount: post.commentCount + 1 }
          : post
      )
    );

    return newComment.id;
  };

  // Vote on a comment
  const voteComment = (commentId, voteType) => {
    const userId = getCurrentUser();
    const voteKey = `comment_${commentId}`;

    const existingVote = userVotes[voteKey];

    setComments(prevComments =>
      prevComments.map(comment => {
        if (comment.id === commentId) {
          let newUpvotes = comment.upvotes;
          let newDownvotes = comment.downvotes;
          let newScore = comment.score;

          // Remove previous vote if exists
          if (existingVote === 'up') {
            newUpvotes--;
            newScore--;
          } else if (existingVote === 'down') {
            newDownvotes--;
            newScore++;
          }

          // Add new vote
          if (voteType === 'up' && existingVote !== 'up') {
            newUpvotes++;
            newScore++;
          } else if (voteType === 'down' && existingVote !== 'down') {
            newDownvotes++;
            newScore--;
          } else if (voteType === existingVote) {
            // Remove vote if clicking the same button
            voteType = null;
          }

          return {
            ...comment,
            upvotes: newUpvotes,
            downvotes: newDownvotes,
            score: newScore,
          };
        }
        return comment;
      })
    );

    // Update user votes
    setUserVotes(prevVotes => ({
      ...prevVotes,
      [voteKey]: voteType,
    }));
  };

  // Get comments for a specific post
  const getCommentsForPost = (postId) => {
    return comments.filter(comment => comment.postId === postId);
  };

  // Get user vote for a post or comment
  const getUserVote = (itemId, type = 'post') => {
    const voteKey = `${type}_${itemId}`;
    return userVotes[voteKey] || null;
  };

  // Sort posts
  const sortPosts = (postsToSort, sortBy) => {
    const sortedPosts = [...postsToSort];

    switch (sortBy) {
      case 'hot':
        sortedPosts.sort((a, b) => {
          const aVotes = a.votes || { up: 0, down: 0 };
          const bVotes = b.votes || { up: 0, down: 0 };
          const aScore = Math.max(1, aVotes.up - aVotes.down);
          const bScore = Math.max(1, bVotes.up - bVotes.down);
          const aTime = new Date(a.timestamp).getTime() / 1000;
          const bTime = new Date(b.timestamp).getTime() / 1000;

          // Hot = log10(upvotes - downvotes) + (timestamp / 45000)
          const aHot = Math.log10(aScore) + (aTime / 45000);
          const bHot = Math.log10(bScore) + (bTime / 45000);

          return bHot - aHot;
        });
        break;
      case 'new':
        sortedPosts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        break;
      case 'top':
        sortedPosts.sort((a, b) => {
          const aVotes = a.votes || { up: 0, down: 0 };
          const bVotes = b.votes || { up: 0, down: 0 };
          return (bVotes.up - bVotes.down) - (aVotes.up - aVotes.down);
        });
        break;
      default:
        break;
    }

    return sortedPosts;
  };

  return {
    posts,
    comments,
    loading,
    createPost,
    votePost,
    addComment,
    voteComment,
    getCommentsForPost,
    getUserVote,
    sortPosts,
  };
};
