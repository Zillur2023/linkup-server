import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { User } from "./user.model";
import { IUser } from "./user.interface";
import mongoose from "mongoose";

const createUserIntoDB = async (
  payload: Pick<IUser, "name" | "email" | "password">
) => {
  // const createUserIntoDB = async (payload: IUser) => {

  // checking if the user is exist
  const isUserExist = await User.findOne({ email: payload.email });

  if (isUserExist) {
    throw new AppError(
      httpStatus.ALREADY_REPORTED,
      "This user is already exist!"
    );
  }
  const result = await User.create(payload);

  return result;
};

const getAllUserFromDB = async (searchQuery?: string, userId?: string) => {
  const matchStage: any = { isDeleted: { $ne: true } };

  // Apply search term filter if provided
  if (searchQuery) {
    matchStage.name = { $regex: searchQuery, $options: "i" };
  }

  // Exclude the requesting user from the results if `userId` is provided
  if (userId) {
    matchStage._id = { $ne: userId };
  }

  const result = await User.aggregate([
    { $match: matchStage },
    {
      $lookup: {
        from: "users",
        localField: "followers",
        foreignField: "_id",
        as: "followers",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "following",
        foreignField: "_id",
        as: "following",
      },
    },
    {
      $project: {
        password: 0, // Exclude sensitive fields if necessary
      },
    },
  ]).exec();

  return result;
};

const getUserByEmailFromDB = async (email: string) => {
  const result = await User.findOne({ email });
  return result;
};
const getUserByIdFromDB = async (id: string) => {
  console.log("getUserByIdFromDB id", id);
  const result = await User.findById(id);

  return result;
};

const updateUserIntoDB = async (payload: IUser) => {
  console.log("updateUserIntoDB payload", payload);
  const user = await User.findByIdAndUpdate(payload._id, payload, {
    new: true,
    runValidators: true,
  });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  return user;
};

const updateUserFollowersIntoDB = async (
  id: string,
  payload: Record<string, unknown>
) => {
  const userId = new mongoose.Types.ObjectId(id as string);
  const followerId = new mongoose.Types.ObjectId(payload.followers as string);

  const user = await User.findById(userId);
  const followerUser = await User.findById(followerId);

  if (!user) throw new AppError(httpStatus.NOT_FOUND, "User not found");
  if (!followerUser)
    throw new AppError(httpStatus.NOT_FOUND, "Follow User not found");

  if (!user.followers.some((id) => id.equals(followerId))) {
    user.followers.push(followerId);
    // followerUser.following = followerUser.following.filter(
    //   (followingId) => !followingId.equals(userId)
    // );
    followerUser.following.push(userId);

    await user.save();
    await followerUser.save();
  }
};

const updateFollowAndUnfollowIntoDB = async (
  targetUserId: string,
  currentUser: IUser
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const targetUser = await User.findById(targetUserId).session(session);
    const loggedInUser = await User.findById(currentUser?._id).session(session);

    if (!loggedInUser)
      throw new AppError(httpStatus.NOT_FOUND, "Current user not found");
    if (!targetUser)
      throw new AppError(httpStatus.NOT_FOUND, "Target user not found");

    const isFollowing = loggedInUser.following.some((id) =>
      id.equals(targetUserId)
    );

    if (!isFollowing) {
      await User.findByIdAndUpdate(
        loggedInUser._id,
        { $addToSet: { following: targetUserId } },
        { session }
      );

      await User.findByIdAndUpdate(
        targetUserId,
        { $addToSet: { followers: loggedInUser._id } },
        { session }
      );
    } else {
      await User.findByIdAndUpdate(
        loggedInUser._id,
        { $pull: { following: targetUserId } },
        { session }
      );

      await User.findByIdAndUpdate(
        targetUserId,
        { $pull: { followers: loggedInUser._id } },
        { session }
      );
    }

    await session.commitTransaction();
    session.endSession();
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const deleteUserFromDB = async (id: string) => {
  const result = await User.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true }
  );
};

export const UserServices = {
  createUserIntoDB,
  getAllUserFromDB,
  getUserByEmailFromDB,
  getUserByIdFromDB,
  updateUserIntoDB,
  updateUserFollowersIntoDB,
  updateFollowAndUnfollowIntoDB,
  deleteUserFromDB,
};
