import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronUp, ChevronDown, MessageCircle, User, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const CommentItem = ({ comment, onVote, userVote, onReply, depth = 0 }) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const timeAgo = formatDistanceToNow(new Date(comment.timestamp), { addSuffix: true });

  const handleReply = () => {
    if (replyContent.trim()) {
      onReply(comment.id, replyContent.trim());
      setReplyContent('');
      setIsReplying(false);
    }
  };

  const maxDepth = 3; // Limit nesting depth
  const marginLeft = Math.min(depth * 24, 72); // Max 72px indent

  return (
    <div style={{ marginLeft: `${marginLeft}px` }} className="mb-4">
      <Card className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl">
        <CardContent className="p-4">
          <div className="flex gap-3">
            {/* Vote Section */}
            <div className="flex flex-col items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onVote(comment.id, 'up')}
                className={`p-1 h-6 w-6 rounded transition-colors ${
                  userVote === 'up'
                    ? 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400'
                    : 'hover:bg-orange-50 text-gray-400 hover:text-orange-500 dark:hover:bg-orange-900/20'
                }`}
                aria-label="Upvote comment"
              >
                <ChevronUp className="w-3 h-3" />
              </Button>
              <span className={`text-xs font-semibold ${
                comment.score > 0 ? 'text-orange-600' :
                comment.score < 0 ? 'text-blue-600' : 'text-gray-500'
              }`}>
                {comment.score}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onVote(comment.id, 'down')}
                className={`p-1 h-6 w-6 rounded transition-colors ${
                  userVote === 'down'
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
                    : 'hover:bg-blue-50 text-gray-400 hover:text-blue-500 dark:hover:bg-blue-900/20'
                }`}
                aria-label="Downvote comment"
              >
                <ChevronDown className="w-3 h-3" />
              </Button>
            </div>

            {/* Comment Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {comment.authorName}
                </span>
                <Clock className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {timeAgo}
                </span>
              </div>

              <p className="text-gray-700 dark:text-gray-300 text-sm mb-3 whitespace-pre-wrap">
                {comment.content}
              </p>

              {/* Reply Button */}
              {depth < maxDepth && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsReplying(!isReplying)}
                  className="text-xs text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 p-1 h-6"
                >
                  <MessageCircle className="w-3 h-3 mr-1" />
                  Reply
                </Button>
              )}

              {/* Reply Form */}
              {isReplying && (
                <div className="mt-3 space-y-2">
                  <Textarea
                    placeholder="Write a reply..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    className="min-h-[80px] text-sm"
                    maxLength={1000}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleReply}
                      disabled={!replyContent.trim()}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      Reply
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setIsReplying(false);
                        setReplyContent('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const CommentSection = ({ comments, onAddComment, onVoteComment, getUserVote }) => {
  const [newComment, setNewComment] = useState('');

  // Organize comments into a tree structure
  const buildCommentTree = (comments) => {
    const commentMap = {};
    const roots = [];

    // Create a map of all comments
    comments.forEach(comment => {
      commentMap[comment.id] = { ...comment, replies: [] };
    });

    // Build the tree
    comments.forEach(comment => {
      if (comment.parentId) {
        if (commentMap[comment.parentId]) {
          commentMap[comment.parentId].replies.push(commentMap[comment.id]);
        }
      } else {
        roots.push(commentMap[comment.id]);
      }
    });

    return roots;
  };

  const commentTree = buildCommentTree(comments);

  const handleAddComment = () => {
    if (newComment.trim()) {
      onAddComment(newComment.trim());
      setNewComment('');
    }
  };

  const renderCommentTree = (comment, depth = 0) => (
    <div key={comment.id}>
      <CommentItem
        comment={comment}
        onVote={(commentId, voteType) => onVoteComment(commentId, voteType)}
        userVote={getUserVote(comment.id, 'comment')}
        onReply={(parentId, content) => onAddComment(content, parentId)}
        depth={depth}
      />
      {comment.replies && comment.replies.length > 0 && (
        <div>
          {comment.replies.map(reply => renderCommentTree(reply, depth + 1))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Add Comment Form */}
      <Card className="bg-white dark:bg-gray-800 border-2 border-purple-100 dark:border-gray-700 rounded-2xl">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Add a Comment
          </h3>
          <Textarea
            placeholder="Share your thoughts or help solve this problem..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[100px] mb-4"
            maxLength={1000}
          />
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">
              {newComment.length}/1000 characters
            </span>
            <Button
              onClick={handleAddComment}
              disabled={!newComment.trim()}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              Post Comment
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Comments List */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Comments ({comments.length})
        </h3>
        {comments.length === 0 ? (
          <Card className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl">
            <CardContent className="p-6 text-center">
              <MessageCircle className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500 dark:text-gray-400">
                No comments yet. Be the first to share your thoughts!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {commentTree.map(comment => renderCommentTree(comment))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
