import { Types } from 'mongoose';

export interface IComment {
  _id?: Types.ObjectId;
  postId: Types.ObjectId; // Reference to Post model
  userId: Types.ObjectId; // Reference to User model
  commentText: string; // The content of the comment
  parentCommentId?: Types.ObjectId | null; // Reference to a parent comment (for nested replies), can be null
  createdAt?: Date; // Automatically managed by Mongoose
  updatedAt?: Date; // Automatically managed by Mongoose
}