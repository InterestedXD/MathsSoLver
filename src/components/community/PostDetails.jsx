import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown, ArrowLeft, User, Clock, MessageCircle, Tag } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import CommentSection from './CommentSection';
import { useCommunityData } from '@/hooks/useCommunityData';

const PostDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    posts,
    getCommentsForPost,
    votePost,
    addComment,
    voteComment,
    getUserVote,
    loading
  } = useCommunityData();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);

  useEffect(() => {
    if (!loading) {
      const foundPost = posts.find(p => p.id === id);
      if (foundPost) {
        setPost(foundPost);
        setComments(getCommentsForPost(id));
      } else {
        // Post not found, redirect to community
        navigate('/community');
      }
    }
  }, [id, posts, loading, getCommentsForPost, navigate]);

  const handleVote = (voteType) => {
    if (post) {
      votePost(post.id, voteType);
      // Update local post state
      setPost(prevPost => ({
        ...prevPost,
        score: prevPost.score + (voteType === 'up' ? 1 : voteType === 'down' ? -1 : 0)
      }));
    }
  };

  const handleAddComment = (content, parentId = null) => {
    addComment(id, content, parentId);
    // Refresh comments
    setComments(getCommentsForPost(id));
  };

  const handleVoteComment = (commentId, voteType) => {
    voteComment(commentId, voteType);
    // Refresh comments
    setComments(getCommentsForPost(id));
  };

  if (loading || !post) {
    return (
      <div className="p-4 md:p-6 max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  const timeAgo = formatDistanceToNow(new Date(post.timestamp), { addSuffix: true });
  const userVote = getUserVote(post.id, 'post');

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => navigate('/community')}
        className="mb-6 hover:bg-purple-50 dark:hover:bg-purple-900/20"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Community
      </Button>

      {/* Post Content */}
      <Card className="mb-8 bg-white dark:bg-gray-800 border-2 border-purple-100 dark:border-gray-700 rounded-2xl overflow-hidden">
        <CardContent className="p-6">
          <div className="flex gap-4">
            {/* Vote Section */}
            <div className="flex flex-col items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleVote('up')}
                className={`p-1 h-8 w-8 rounded-lg transition-colors ${
                  userVote === 'up'
                    ? 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400'
                    : 'hover:bg-orange-50 text-gray-400 hover:text-orange-500 dark:hover:bg-orange-900/20'
                }`}
                aria-label="Upvote"
              >
                <ChevronUp className="w-4 h-4" />
              </Button>
              <span className={`text-sm font-semibold ${
                post.score > 0 ? 'text-orange-600' :
                post.score < 0 ? 'text-blue-600' : 'text-gray-500'
              }`}>
                {post.score}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleVote('down')}
                className={`p-1 h-8 w-8 rounded-lg transition-colors ${
                  userVote === 'down'
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
                    : 'hover:bg-blue-50 text-gray-400 hover:text-blue-500 dark:hover:bg-blue-900/20'
                }`}
                aria-label="Downvote"
              >
                <ChevronDown className="w-4 h-4" />
              </Button>
            </div>

            {/* Post Content */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                {post.title}
              </h1>

              <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed mb-4 whitespace-pre-wrap">
                {post.description}
              </p>

              {/* Image */}
              {post.image && (
                <div className="mb-4">
                  <img
                    src={post.image}
                    alt="Post attachment"
                    className="max-w-full h-auto rounded-lg shadow-md"
                  />
                </div>
              )}

              {/* Post Meta */}
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>{post.authorName}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{timeAgo}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  <span>{post.commentCount} comments</span>
                </div>
                {post.topic && (
                  <div className="flex items-center gap-1">
                    <Tag className="w-4 h-4" />
                    <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
                      {post.topic}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comments Section */}
      <CommentSection
        comments={comments}
        onAddComment={handleAddComment}
        onVoteComment={handleVoteComment}
        getUserVote={getUserVote}
      />
    </div>
  );
};

export default PostDetails;
