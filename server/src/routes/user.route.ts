import {registerUser, loginUser, logoutUser, getAllEmplyeeList, getUserDetails} from "../controllers/user.controller"
import express from "express"
import { verifyJWT } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/role.middleware";

const router = express.Router()

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

router.post("/logout", verifyJWT, logoutUser);

router.get("/:id", verifyJWT, getUserDetails);

router.get(
    "/list/employees", 
    verifyJWT, 
    authorizeRoles("Admin"), 
    getAllEmplyeeList
);

export default router;