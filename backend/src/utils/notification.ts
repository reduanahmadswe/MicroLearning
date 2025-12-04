import { io } from '../server';

export interface NotificationPayload {
  type: 'like' | 'comment' | 'reply' | 'accept_answer' | 'mention';
  title: string;
  message: string;
  postId?: string;
  commentId?: string;
  actorId: string;
  actorName: string;
  actorImage?: string;
  link?: string;
  createdAt: Date;
}

/**
 * Send real-time notification to a user
 */
export const sendNotification = (userId: string, notification: NotificationPayload) => {
  try {
    io.to(`user_${userId}`).emit('notification', notification);
    console.log(`📬 Notification sent to user ${userId}:`, notification.type);
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};

/**
 * Send notification when someone likes a post
 */
export const notifyPostLike = (
  postAuthorId: string,
  postId: string,
  postTitle: string,
  likedByUserId: string,
  likedByUserName: string,
  likedByUserImage?: string
) => {
  // Don't notify if user liked their own post
  if (postAuthorId === likedByUserId) return;

  sendNotification(postAuthorId, {
    type: 'like',
    title: 'New Like on Your Post',
    message: `${likedByUserName} liked your post "${postTitle}"`,
    postId,
    actorId: likedByUserId,
    actorName: likedByUserName,
    actorImage: likedByUserImage,
    link: `/forum/${postId}`,
    createdAt: new Date(),
  });
};

/**
 * Send notification when someone comments on a post
 */
export const notifyPostComment = (
  postAuthorId: string,
  postId: string,
  postTitle: string,
  commentedByUserId: string,
  commentedByUserName: string,
  commentContent: string,
  commentedByUserImage?: string
) => {
  // Don't notify if user commented on their own post
  if (postAuthorId === commentedByUserId) return;

  sendNotification(postAuthorId, {
    type: 'comment',
    title: 'New Comment on Your Post',
    message: `${commentedByUserName} commented: "${commentContent.substring(0, 50)}${commentContent.length > 50 ? '...' : ''}"`,
    postId,
    actorId: commentedByUserId,
    actorName: commentedByUserName,
    actorImage: commentedByUserImage,
    link: `/forum/${postId}`,
    createdAt: new Date(),
  });
};

/**
 * Send notification when someone replies to a comment
 */
export const notifyCommentReply = (
  commentAuthorId: string,
  postId: string,
  commentId: string,
  repliedByUserId: string,
  repliedByUserName: string,
  replyContent: string,
  repliedByUserImage?: string
) => {
  // Don't notify if user replied to their own comment
  if (commentAuthorId === repliedByUserId) return;

  sendNotification(commentAuthorId, {
    type: 'reply',
    title: 'New Reply to Your Comment',
    message: `${repliedByUserName} replied: "${replyContent.substring(0, 50)}${replyContent.length > 50 ? '...' : ''}"`,
    postId,
    commentId,
    actorId: repliedByUserId,
    actorName: repliedByUserName,
    actorImage: repliedByUserImage,
    link: `/forum/${postId}`,
    createdAt: new Date(),
  });
};

/**
 * Send notification when an answer is accepted
 */
export const notifyAnswerAccepted = (
  commentAuthorId: string,
  postId: string,
  commentId: string,
  acceptedByUserId: string,
  acceptedByUserName: string,
  postTitle: string,
  acceptedByUserImage?: string
) => {
  // Don't notify if user accepted their own answer
  if (commentAuthorId === acceptedByUserId) return;

  sendNotification(commentAuthorId, {
    type: 'accept_answer',
    title: '✅ Your Answer Was Accepted!',
    message: `${acceptedByUserName} accepted your answer on "${postTitle}"`,
    postId,
    commentId,
    actorId: acceptedByUserId,
    actorName: acceptedByUserName,
    actorImage: acceptedByUserImage,
    link: `/forum/${postId}`,
    createdAt: new Date(),
  });
};
