'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  MessageSquare,
  ThumbsUp,
  Eye,
  Clock,
  Send,
  ChevronLeft,
  Pin,
  CheckCircle,
  MoreVertical,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { forumAPI, commentAPI } from '@/services/api.service';
import { toast } from 'sonner';

export default function ForumPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;

  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (postId) {
      loadPost();
      loadComments();
    }
  }, [postId]);

  const loadPost = async () => {
    try {
      setLoading(true);
      const response = await forumAPI.getPost(postId);
      setPost(response.data.data);
    } catch (error: any) {
      toast.error('Failed to load post');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      const response = await commentAPI.getLessonComments(postId);
      setComments(response.data.data || []);
    } catch (error: any) {
      console.error(error);
    }
  };

  const handleUpvote = async () => {
    try {
      await forumAPI.upvotePost(postId);
      loadPost();
    } catch (error: any) {
      toast.error('Failed to upvote');
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      await commentAPI.createComment({
        resourceType: 'forum',
        resourceId: postId,
        content: newComment,
      });
      setNewComment('');
      toast.success('Comment posted!');
      loadComments();
      loadPost();
    } catch (error: any) {
      toast.error('Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading post...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Post not found</h2>
          <Link href="/forum">
            <Button>Back to Forum</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/forum">
            <Button variant="ghost" size="sm">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back to Forum
            </Button>
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Post */}
        <Card className="mb-6">
          <CardContent className="p-8">
            <div className="flex items-start gap-6">
              {/* Vote Section */}
              <div className="flex flex-col items-center gap-3">
                <button
                  onClick={handleUpvote}
                  className="p-3 hover:bg-indigo-100 rounded-lg transition-colors"
                >
                  <ThumbsUp className="w-6 h-6 text-indigo-600" />
                </button>
                <span className="text-2xl font-bold text-gray-900">{post.upvotes}</span>
                <span className="text-xs text-gray-500">votes</span>
              </div>

              {/* Post Content */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-4">
                  {post.isPinned && <Pin className="w-5 h-5 text-yellow-600" />}
                  {post.isSolved && (
                    <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded">
                      <CheckCircle className="w-4 h-4" />
                      Solved
                    </span>
                  )}
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-medium rounded">
                    {post.category}
                  </span>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>

                <div className="prose max-w-none mb-6">
                  <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
                </div>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {post.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Post Meta */}
                <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {post.author?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{post.author?.name}</p>
                      <p className="text-sm text-gray-600">Author</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 ml-auto">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{new Date(post.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{post.views} views</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comments Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              {comments.length} Replies
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Comment Form */}
            <form onSubmit={handleSubmitComment} className="mb-6">
              <div className="flex gap-4">
                <Input
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a reply..."
                  className="flex-1"
                />
                <Button type="submit" disabled={submitting || !newComment.trim()}>
                  <Send className="w-4 h-4 mr-2" />
                  {submitting ? 'Posting...' : 'Reply'}
                </Button>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-4">
              {comments.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">No replies yet. Be the first to reply!</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div
                    key={comment._id}
                    className="flex gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                      {comment.user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-gray-900">{comment.user?.name}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(comment.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                      <div className="flex items-center gap-4 mt-3">
                        <button className="text-sm text-gray-600 hover:text-indigo-600 flex items-center gap-1">
                          <ThumbsUp className="w-3 h-3" />
                          <span>{comment.likes || 0}</span>
                        </button>
                        <button className="text-sm text-gray-600 hover:text-indigo-600">
                          Reply
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
