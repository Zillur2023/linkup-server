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
  senderId: Types.ObjectId | string,
  receiverId: Types.ObjectId | string
): Promise<void> => {
  try {
    const senderObjectId = new mongoose.Types.ObjectId(senderId);
    const receiverObjectId = new mongoose.Types.ObjectId(receiverId);

    if (senderObjectId.equals(receiverObjectId)) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "You cannot send a request to yourself."
      );
    }

    const sender = await User.findById(senderObjectId);
    const receiver = await User.findById(receiverObjectId);

    if (!sender) throw new AppError(httpStatus.NOT_FOUND, "Sender not found");
    if (!receiver)
      throw new AppError(httpStatus.NOT_FOUND, "Receiver not found");

    if (sender.friends.some((id) => id.equals(receiverObjectId))) {
      throw new AppError(httpStatus.BAD_REQUEST, "You are already friends");
    }

    if (sender.friendRequestsSent.some((id) => id.equals(receiverObjectId))) {
      throw new AppError(httpStatus.BAD_REQUEST, "Friend request already sent");
    }

    sender.friendRequestsSent.push(receiverObjectId);
    receiver.friendRequestsReceived.push(senderObjectId);

    await Promise.all([sender.save(), receiver.save()]);
  } catch (error) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Something went wrong"
    );
  }
};

export const acceptFriendRequestIntoDB = async (
  userId: Types.ObjectId | string,
  requesterId: Types.ObjectId | string
): Promise<void> => {
  try {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const requesterObjectId = new mongoose.Types.ObjectId(requesterId);

    const user = await User.findById(userObjectId);
    const requester = await User.findById(requesterObjectId);

    if (!user) throw new AppError(httpStatus.NOT_FOUND, "User not found");
    if (!requester)
      throw new AppError(httpStatus.NOT_FOUND, "Requester not found");

    if (
      !user.friendRequestsReceived.some((id) => id.equals(requesterObjectId))
    ) {
      throw new AppError(httpStatus.BAD_REQUEST, "No friend request found");
    }

    user.friends.push(requesterObjectId);
    requester.friends.push(userObjectId);

    user.friendRequestsReceived = user.friendRequestsReceived.filter(
      (id) => !id.equals(requesterObjectId)
    );
    requester.friendRequestsSent = requester.friendRequestsSent.filter(
      (id) => !id.equals(userObjectId)
    );

    await Promise.all([user.save(), requester.save()]);
  } catch (error) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Something went wrong"
    );
  }
};

export const rejectFriendRequestIntoDB = async (
  userId: Types.ObjectId | string,
  requesterId: Types.ObjectId | string
): Promise<void> => {
  try {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const requesterObjectId = new mongoose.Types.ObjectId(requesterId);

    const user = await User.findById(userObjectId);
    const requester = await User.findById(requesterObjectId);

    if (!user) throw new AppError(httpStatus.NOT_FOUND, "User not found");
    if (!requester)
      throw new AppError(httpStatus.NOT_FOUND, "Requester not found");

    user.friendRequestsReceived = user.friendRequestsReceived.filter(
      (id) => !id.equals(requesterObjectId)
    );
    requester.friendRequestsSent = requester.friendRequestsSent.filter(
      (id) => !id.equals(userObjectId)
    );

    await Promise.all([user.save(), requester.save()]);
  } catch (error) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Something went wrong"
    );
  }
};

export const removeFriendFromDB = async (
  userId: Types.ObjectId | string,
  friendId: Types.ObjectId | string
): Promise<void> => {
  try {
    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    if (!user) throw new AppError(httpStatus.NOT_FOUND, "User not found");
    if (!friend) throw new AppError(httpStatus.NOT_FOUND, "Friend not found");

    // Remove each other from friends list
    user.friends = user.friends.filter((id) => !id.equals(friendId));
    friend.friends = friend.friends.filter((id) => !id.equals(userId));

    await Promise.all([user.save(), friend.save()]);
  } catch (error) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Something went wrong"
    );
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
  sendFriendRequestIntoDB,
  acceptFriendRequestIntoDB,
  rejectFriendRequestIntoDB,
  removeFriendFromDB,
  deleteUserFromDB,
};
