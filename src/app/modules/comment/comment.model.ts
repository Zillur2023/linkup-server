import { model, Schema } from "mongoose";
import { IComment } from "./comment.interface";


const CommentSchema = new Schema<IComment>({
  postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  commentText: { type: String, required: true },
  parentCommentId: { type: Schema.Types.ObjectId, ref: 'Comment', default: null }, // For nested replies
}, { timestamps: true });

const Comment = model<IComment>("Comment", CommentSchema)

export default Comment

