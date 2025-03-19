import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { User } from "./user.model";
import { IUser } from "./user.interface";
import mongoose, { Types } from "mongoose";

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

export const sendFriendRequestIntoDB = async (
  senderId: Types.ObjectId,
  receiverId: Types.ObjectId
): Promise<void> => {
  // if (senderId.equals(receiverId)) {
  //   // if (senderId === receiverId) {
  //   throw new AppError(
  //     httpStatus.BAD_REQUEST,
  //     "You cannot send a request to yourself."
  //   );
  // }

  const sender = await User.findById(senderId);
  const receiver = await User.findById(receiverId);

  if (!sender) throw new AppError(httpStatus.NOT_FOUND, "Sender not found");
  if (!receiver) throw new AppError(httpStatus.NOT_FOUND, "Receiver not found");

  // if (sender.friends.some((id) => id.equals(receiverId))) {
  //   throw new AppError(httpStatus.BAD_REQUEST, "You are already friends");
  // }

  // if (sender.friendRequestsSent.some((id) => id.equals(receiverId))) {
  //   throw new AppError(httpStatus.BAD_REQUEST, "Friend request already sent");
  // }

  sender.friendRequestsSent.push(receiverId);
  receiver.friendRequestsReceived.push(senderId);

  await Promise.all([sender.save(), receiver.save()]);
};

export const acceptFriendRequestIntoDB = async (
  userId: Types.ObjectId,
  requesterId: Types.ObjectId
) => {
  // try {
  const user = await User.findById(userId);
  const requester = await User.findById(requesterId);

  if (!user) throw new AppError(httpStatus.NOT_FOUND, "User not found");
  if (!requester)
    throw new AppError(httpStatus.NOT_FOUND, "Requester not found");

  // Check if request exists
  // if (!user.friendRequestsReceived.some((id) => id.equals(requesterId))) {
  //   throw new AppError(httpStatus.BAD_REQUEST, "No friend request found");
  // }

  // Add to friends list
  user.friends.push(requesterId);
  requester.friends.push(userId);

  // Remove from requests
  user.friendRequestsReceived = user.friendRequestsReceived.filter(
    (id) => !id.equals(requesterId)
  );
  requester.friendRequestsSent = requester.friendRequestsSent.filter(
    (id) => !id.equals(userId)
  );

  await user.save();
  await requester.save();
  // } catch (error) {
  //   throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "Server error");
  // }
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
  sendFriendRequestIntoDB,
  acceptFriendRequestIntoDB,
  deleteUserFromDB,
};
