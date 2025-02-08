import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { UserServices } from "./user.service";

const createUser = catchAsync(async (req, res) => {
  const images =
    (req.files as Express.Multer.File[])?.map((file) => file.path) || [];
  const result = await UserServices.createUserIntoDB({
    ...JSON.parse(req.body.data),
    images,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `User is created succesfully`,
    data: result,
  });
});

const getAllUser = catchAsync(async (req, res) => {
  const result = await UserServices.getAllUserFromDB();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Get all user successfully",
    data: result,
  });
});
const getUser = catchAsync(async (req, res) => {
  const { email } = req.params;
  const result = await UserServices.getUserFromDB(email);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User find successfully",
    data: result,
  });
});
const getUserById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await UserServices.getUserByIdFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User find successfully",
    data: result,
  });
});

const updateUserProfile = catchAsync(async (req, res) => {
  const result = await UserServices.updateUserProfileIntoDB({
    ...JSON.parse(req.body.data),
    image: req.file?.path,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User is updated successfully",
    data: result,
  });
});
const updateFollowers = catchAsync(async (req, res) => {
  const { id } = req.params;

  const result = await UserServices.updateUserFollowersIntoDB(id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Followers is updated successfully",
    data: result,
  });
});
const updateFollowAndUnfollow = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await UserServices.updateFollowAndUnfollowIntoDB(id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Following is updated successfully",
    data: result,
  });
});

const deleteUser = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await UserServices.deleteUserFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User deleted successfully",
    data: result,
  });
});

export const UserControllers = {
  createUser,
  getAllUser,
  getUser,
  getUserById,
  updateUserProfile,
  updateFollowers,
  updateFollowAndUnfollow,
  deleteUser,
};
