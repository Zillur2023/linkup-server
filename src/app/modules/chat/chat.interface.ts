import { Types } from "mongoose";

export interface IChat {
  _id?: Types.ObjectId;
  senderId: Types.ObjectId;
  receiverId: Types.ObjectId;
  content: string;
  isRead?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
