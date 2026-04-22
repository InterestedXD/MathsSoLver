import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Plus, Search, TrendingUp, Clock, ArrowUp, MessageSquare } from 'lucide-react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useCommunityData } from '@/hooks/useCommunityData';
import PostCard from '@/components/community/PostCard';
import CreatePostModal from '@/components/community/CreatePostModal';

const CommunityPage = () => {
  usePageTitle('Math Community - Maths Solver');

  const { posts, loading, createPost, votePost, getUserVote, sortPosts } = useCommunityData();
  const [sortBy, setSortBy] = useState('hot');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const filteredAndSortedPosts = useMemo(() => {
    let filtered = posts;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = posts.filter(post =>
        post.title.toLowerCase().includes(query) ||
        post.description.toLowerCase().includes(query) ||
        (post.topic && post.topic.toLowerCase().includes(query))
      );
    }
    return sortPosts(filtered, sortBy);
  }, [posts, sortBy, searchQuery, sortPosts]);

  const handleCreatePost = async (title, description, topic, image) => {
    await createPost(title, description, topic, image);
  };

  const sortOptions = [
    { value: 'hot', label: 'Hot', icon: TrendingUp },
    { value: 'new', label: 'New', icon: Clock },
    { value: 'top', label: 'Top', icon: ArrowUp },
  ];

  if (loading) {
    return (
      <div className="p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="page-title">Math Community</h1>
          <p className="page-subtitle">Discuss problems, share insights, and learn together</p>
          <Button onClick={() => setIsCreateModalOpen(true)} size="lg" className="btn-primary">
            <Plus className="w-5 h-5 mr-2" />Create Post
          </Button>
        </div>

        <Card className="card mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full bg-[#1e293b] border-[rgba(255,255,255,0.08)] text-white">
                    <SelectValue placeholder="Sort by..." />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0f172a] border-[rgba(255,255,255,0.08)]">
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="text-white focus:bg-[rgba(255,255,255,0.1)]">
                        <div className="flex items-center gap-2"><option.icon className="w-4 h-4" />{option.label}</div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input type="text" placeholder="Search posts..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 bg-[#1e293b] border-[rgba(255,255,255,0.08)] text-white" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {filteredAndSortedPosts.length === 0 ? (
          <Card className="bg-white dark:bg-gray-800 border-2 border-purple-100 dark:border-gray-700 rounded-2xl">
            <CardContent className="p-12 text-center">
              <MessageSquare className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">{searchQuery ? 'No posts found' : 'No posts yet'}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{searchQuery ? 'Try adjusting your search terms' : 'Be the first to start a discussion in the Math Community!'}</p>
              {!searchQuery && (
                <Button onClick={() => setIsCreateModalOpen(true)} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                  <Plus className="w-4 h-4 mr-2" />Create the First Post
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredAndSortedPosts.map((post) => (
              <PostCard key={post.id} post={post} onVote={votePost} userVote={getUserVote(post.id, 'post')} />
            ))}
          </div>
        )}

        <div className="fixed bottom-6 right-6 md:hidden">
          <Button onClick={() => setIsCreateModalOpen(true)} size="lg" className="rounded-full w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300" aria-label="Create new post">
            <Plus className="w-6 h-6" />
          </Button>
        </div>

        <CreatePostModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onCreatePost={handleCreatePost} />
      </div>
    </div>
  );
};

export default CommunityPage;

