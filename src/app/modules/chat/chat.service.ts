import { Types } from "mongoose";
import { Chat } from "./chat.model";
import { User } from "../user/user.model";
import httpStatus from "http-status";
import AppError from "../../errors/AppError";

export const createChatIntoDB = async (
  senderId: Types.ObjectId | string,
  receiverId: Types.ObjectId | string,
  content: string
): Promise<void> => {
  try {
    // Check if both sender and receiver exist
    const [senderExist, receiverExist] = await Promise.all([
      User.exists({ _id: senderId }),
      User.exists({ _id: receiverId }),
    ]);

    if (!senderExist)
      throw new AppError(httpStatus.NOT_FOUND, "Sender not found");
    if (!receiverExist)
      throw new AppError(httpStatus.NOT_FOUND, "Receiver not found");

    // Prevent sending messages to oneself
    if (senderId.toString() === receiverId.toString()) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "You cannot send a message to yourself."
      );
    }

    // Create and save the chat message
    const chat = await Chat.create({ senderId, receiverId, content });

    // Add chat reference to sender & receiver
    await Promise.all([
      User.findByIdAndUpdate(senderId.toString(), {
        $push: { chats: chat._id },
      }),
      User.findByIdAndUpdate(receiverId.toString(), {
        $push: { chats: chat._id },
      }),
    ]);
  } catch (error) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Something went wrong"
    );
  }
};

export const ChatServices = {
  createChatIntoDB,
};
