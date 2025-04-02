import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { ChatServices } from "./chat.service";

const createChat = catchAsync(async (req, res) => {
  const { senderId, receiverId, content } = req.body;
  const result = await ChatServices.createChatIntoDB(
    senderId,
    receiverId,
    content
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Create chat successfully",
    data: result,
  });
});

export const ChatControllers = {
  createChat,
};
