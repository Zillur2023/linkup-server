import { Types } from "mongoose";

export interface IPost {
  _id?: string;
  content?: string;
  isPremium?: boolean; // Optional because it has a default value
  image?: string; // Optional
  likes?: Types.ObjectId[]; // Optional, defaults to 0
  dislikes?: Types.ObjectId[]; // Optional, defaults to 0
  comments?: Types.ObjectId;
  author?: Types.ObjectId; // References the User model
  createdAt?: Date; // Automatically handled by Mongoose timestamps
  updatedAt?: Date; // Automatically handled by Mongoose timestamps
}
