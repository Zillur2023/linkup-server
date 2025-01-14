import { Router } from "express";
import { UserRouters } from "../modules/user/user.route";
import { AuthRouters } from "../modules/auth/auth.route";
import { PostRouters } from "../modules/post/post.route";
import { CommentRouters } from "../modules/comment/comment.route";


const router = Router();

const moduleRoutes = [
    {
      path: "/user",
      route: UserRouters,
    },
  
    {
      path: "/auth",
      route: AuthRouters,
    },
    {
      path: "/post",
      route: PostRouters,
    },
    {
      path: "/comment",
      route: CommentRouters,
    },
   
  ];

  moduleRoutes.forEach((route) => router.use(route.path, route.route));



export default router;
