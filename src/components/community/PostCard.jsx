import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown, MessageCircle, Clock, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const PostCard = ({ post, onVote, userVote }) => {
  const timeAgo = formatDistanceToNow(new Date(post.timestamp), { addSuffix: true });

  return (
    <Card className="mb-4 bg-white dark:bg-gray-800 border-2 border-purple-100 dark:border-gray-700 hover:shadow-lg transition-all duration-200 rounded-2xl overflow-hidden">
      <CardContent className="p-6">
        <div className="flex gap-4">
          {/* Vote Section */}
          <div className="flex flex-col items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onVote(post.id, 'up')}
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
              onClick={() => onVote(post.id, 'down')}
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
            <Link
              to={`/community/post/${post.id}`}
              className="block group"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2 mb-2">
                {post.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-3">
                {post.description}
              </p>
            </Link>

            {/* Post Meta */}
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
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
                <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
                  {post.topic}
                </span>
              )}
            </div>

            {/* Image Preview */}
            {post.image && (
              <div className="mt-3">
                <img
                  src={post.image}
                  alt="Post attachment"
                  className="max-w-full h-auto max-h-48 rounded-lg object-cover"
                />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PostCard;
