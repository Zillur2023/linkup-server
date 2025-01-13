import { Router } from "express";
import { UserControllers } from "./user.controller";
import { multerUpload } from "../../config/multer.config";
import auth from "../../middlewares/auth";
import { USER_ROLE } from "./user.constant";

const router = Router()

router.post('/create', multerUpload.single("image"), UserControllers.createUser)

router.get('/all-user', auth(USER_ROLE.admin), UserControllers.getAllUser)
// router.get('/all-user', UserControllers.getAllUser)

router.get('/:email', UserControllers.getUser)

router.get('/:id', auth(USER_ROLE.admin, USER_ROLE.user), UserControllers.getUserById)

router.put("/update-profile", multerUpload.single("image"), UserControllers.updateUserProfile);

router.put("/followers/:id", UserControllers.updateFollowers);

router.put("/update-follow-unfollow/:id", UserControllers.updateFollowAndUnfollow);

router.put("/delete/:id", UserControllers.deleteUser);




export const UserRouters = router;