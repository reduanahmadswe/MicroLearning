import { Schema, model, models, Document, Types } from 'mongoose';

export interface IComment extends Document {
  _id: Types.ObjectId;
  post: Types.ObjectId;
  user: Types.ObjectId;
  content: string;
  parentComment?: Types.ObjectId; // For nested replies
  replies: Types.ObjectId[]; // Child comments
  likes: Types.ObjectId[];
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    post: { type: Schema.Types.ObjectId, ref: 'Post', required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    content: { type: String, required: true, maxlength: 2000, trim: true },
    parentComment: { type: Schema.Types.ObjectId, ref: 'PostComment', default: null, index: true },
    replies: [{ type: Schema.Types.ObjectId, ref: 'PostComment' }],
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    isEdited: { type: Boolean, default: false },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
commentSchema.index({ post: 1, createdAt: -1 });
commentSchema.index({ parentComment: 1, createdAt: 1 });
commentSchema.index({ user: 1, createdAt: -1 });

// Virtual for like count
commentSchema.virtual('likeCount').get(function() {
  return this.likes?.length || 0;
});

// Virtual for reply count
commentSchema.virtual('replyCount').get(function() {
  return this.replies?.length || 0;
});

// Prevent model overwrite error in development (hot reload)
export const PostComment = models.PostComment || model<IComment>('PostComment', commentSchema);
export default PostComment;
