// import { Model, Types } from "mongoose";
import { Model } from "mongoose";
import { USER_ROLE } from "./user.constant";

import { Types } from "mongoose";

export interface IUser {
  _id?: string;
  name: string;
  email: string;
  password: string;
  needsPasswordChange: boolean;
  passwordChangedAt?: Date;
  bio?: string;
  profileImage?: string;
  coverImage?: string;
  followers: Types.ObjectId[]; // Array of ObjectIds referencing 'User'
  following: Types.ObjectId[]; // Array of ObjectIds referencing 'User'
  isVerified: boolean;
  role: "admin" | "user"; // Role can be either 'admin' or 'user'
  status: "in-progress" | "blocked";
  paymentStatus?: "Pending" | "Paid" | "Failed";
  transactionId?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserModel extends Model<IUser> {
  //instance methods for checking if passwords are matched
  isPasswordMatched(
    plainTextPassword: string,
    hashedPassword: string
  ): Promise<boolean>;
  isJWTIssuedBeforePasswordChanged(
    passwordChangedTimestamp: Date,
    jwtIssuedTimestamp: number
  ): boolean;
}
