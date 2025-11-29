import { Schema, model } from 'mongoose';
import { IFriend } from './friend.types';

const friendSchema = new Schema<IFriend>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    friend: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'blocked'],
      default: 'pending',
    },
    requestedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
friendSchema.index({ user: 1, friend: 1 }, { unique: true });
friendSchema.index({ user: 1, status: 1 });
friendSchema.index({ friend: 1, status: 1 });
friendSchema.index({ requestedBy: 1, status: 1 });

// Prevent self-friendship
friendSchema.pre('save', function (next) {
  if (this.user.equals(this.friend)) {
    next(new Error('Cannot add yourself as a friend'));
  }
  next();
});

export const Friend = model<IFriend>('Friend', friendSchema);
