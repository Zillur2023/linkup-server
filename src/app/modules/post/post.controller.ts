import httpStatus from "http-status"
import catchAsync from "../../utils/catchAsync"
import sendResponse from "../../utils/sendResponse"
import { PostServices } from "./post.service"


const createPost = catchAsync(async (req, res) => {
  // console.log("createPost req", req)
  console.log("createPost reqBody", req.body)
  console.log("createPost reqFile", req.files)
  // console.log("createPost image", req.image)
  const image = (req.files as Express.Multer.File[])?.map(file => file.path) || [];
    const result = await PostServices.createPostIntoDB({
      ...JSON.parse(req.body.data),
      image
    })
  
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Create post successfully',
        data: result
    })
  })
  const getAllPost = catchAsync(async (req, res) => {
    const { postId, userId } = req.params as {
      postId?: string;
      userId?: string;
    };
  
    const { searchTerm, category, sortBy, isPremium } = req.query as {
      searchTerm?: string;
      category?: string;
      sortBy?: "highestLikes" | "lowestLikes" | "highestDislikes" | "lowestDislikes"
      isPremium?: boolean 
    };
  
    // Fetch posts from the database using the params and query parameters
    const result = await PostServices.getAllPostFromDB(postId, userId, searchTerm, category, sortBy, isPremium);
  
    // Send response back to the client
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Posts fetched successfully',
      data: result,
    });
  });
  
const updateLikes = catchAsync(async (req, res) => {
  const {id} = req.params
  const { userId, postId } = req.body;
    const result = await PostServices.updateLikesIntoDB(userId, postId )
  
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Likes update successfully',
        data: result
    })
  })
const updateDislikes = catchAsync(async (req, res) => {
    const {id} = req.params
    const { userId, postId } = req.body;
    const result = await PostServices.updateDislikesIntoDB(userId, postId)
  
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Dislikes update successfully',
        data: result
    })
  })
  
const updatePost = catchAsync(async (req, res) => {
  const result = await PostServices.updatePostIntoDB({
    ...JSON.parse(req.body.data),
    image: req.file?.path
  })
  
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Post update successfully',
        data: result
    })
  })
const updateComment = catchAsync(async (req, res) => {
  const { userId, postId } = req.body;
    const result = await PostServices.updateCommentIntoDB(userId, postId)
  
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Comment update successfully',
        data: result
    })
  })
const deletePost = catchAsync(async (req, res) => {
    const {postId} = req.params
    const result = await PostServices.deletePostFromDB(postId)
  
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Post deleted successfully',
        data: result
    })
  })

  const isAvailableForVerified = catchAsync(async (req, res) => {
    const {id} = req.params
    const result = await PostServices.isAvailableForVerifiedIntoDB(id);
  
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Available for verified successfully',
      data: result,
    });
  });


  export const PostControllers = {
    createPost,
    getAllPost,
    updateLikes,
    updateDislikes,
    updatePost,
    updateComment,
    deletePost,
    isAvailableForVerified
  }

 