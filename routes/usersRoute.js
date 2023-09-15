const express = require("express");
const usersRouter = express.Router();
const userController = require("../controllers/UserController")
const auth = require('../middlewares/auth')
const income = require('../income')

usersRouter.get('/', userController.getUsers);
usersRouter.get("/me", auth.checkIfAuth, userController.getUserProfile);
usersRouter.post("/login", userController.loginUser);
usersRouter.get('/:userId', userController.getUser);
usersRouter.post("/", userController.addUser);
usersRouter.patch("/income", income.sumIncome);
usersRouter.patch("/updateUser", auth.checkIfAuth, userController.updateUserConfig);
usersRouter.patch("/addbalance",auth.checkIfAuth, userController.addcash);
usersRouter.patch("/:userId", auth.checkIfAuth, userController.updateUser);
usersRouter.put("/:userId", userController.putUser);
usersRouter.delete("/:userId", userController.deleteUser);
usersRouter.post("/forgotPassword", userController.forgotPassword);



module.exports = usersRouter