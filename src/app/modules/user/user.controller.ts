import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { UserServices } from "./user.service";

const createUser = catchAsync(async (req, res) => {
  const result = await UserServices.createUserIntoDB({
    ...JSON.parse(req?.body?.data),
    profileImage: req?.file?.path,
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
const getUserByEmail = catchAsync(async (req, res) => {
  const { email } = req.params;
  const result = await UserServices.getUserByEmailFromDB(email);

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

const updateUser = catchAsync(async (req, res) => {
  const { data } = req.body;
  const parsedData = JSON.parse(data);

  // Type assertion to treat req.files as an object
  const files = req.files as { [key: string]: Express.Multer.File[] };

  if (files.profileImage && Array.isArray(files.profileImage)) {
    parsedData.profileImage = files.profileImage[0].path;
  }

  if (files.coverImage && Array.isArray(files.coverImage)) {
    parsedData.coverImage = files.coverImage[0].path;
  }
  // console.log({ parsedData });
  const result = await UserServices.updateUserIntoDB(parsedData);
  res.status(200).json({
    success: true,
    message: "User updated successfully",
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
  getUserByEmail,
  getUserById,
  updateUser,
  updateFollowers,
  updateFollowAndUnfollow,
  deleteUser,
};
