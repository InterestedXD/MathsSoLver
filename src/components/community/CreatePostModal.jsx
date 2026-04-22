import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Image, X } from 'lucide-react';

const CreatePostModal = ({ isOpen, onClose, onCreatePost }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [topic, setTopic] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const topics = [
    'Algebra',
    'Calculus',
    'Geometry',
    'Trigonometry',
    'Statistics',
    'General Math',
    'Problem Solving',
    'Study Tips',
    'Other'
  ];

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      alert('Please fill in both title and description');
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrl = null;
      if (image) {
        // For now, we'll use the data URL. In a real app, you'd upload to a server
        imageUrl = imagePreview;
      }

      await onCreatePost(title.trim(), description.trim(), topic || null, imageUrl);
      handleClose();
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setTopic('');
    setImage(null);
    setImagePreview(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Plus className="w-5 h-5" />
            Create New Post
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <Label htmlFor="title" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Title *
            </Label>
            <Input
              id="title"
              type="text"
              placeholder="What's your math question or discussion topic?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1"
              maxLength={200}
              required
            />
            <div className="text-xs text-gray-500 mt-1">
              {title.length}/200 characters
            </div>
          </div>

          {/* Topic */}
          <div>
            <Label htmlFor="topic" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Topic
            </Label>
            <Select value={topic} onValueChange={setTopic}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select a topic (optional)" />
              </SelectTrigger>
              <SelectContent>
                {topics.map((topicOption) => (
                  <SelectItem key={topicOption} value={topicOption}>
                    {topicOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Description *
            </Label>
            <Textarea
              id="description"
              placeholder="Provide more details about your question or share your insights..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 min-h-[120px]"
              maxLength={2000}
              required
            />
            <div className="text-xs text-gray-500 mt-1">
              {description.length}/2000 characters
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Image (optional)
            </Label>
            <div className="mt-1">
              {!imagePreview ? (
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                  <Image className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Upload an image to illustrate your question
                  </div>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <Label
                    htmlFor="image-upload"
                    className="inline-flex items-center px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg cursor-pointer hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Choose Image
                  </Label>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full max-h-48 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={removeImage}
                    className="absolute top-2 right-2"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !title.trim() || !description.trim()}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              {isSubmitting ? 'Creating...' : 'Create Post'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostModal;
