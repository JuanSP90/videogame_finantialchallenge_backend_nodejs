const express = require("express");
const realStateRouter = express.Router();
const realStateController = require("../controllers/realStateController")
const auth = require('../middlewares/auth')

realStateRouter.get('/', realStateController.getRealStates);
realStateRouter.get('/:realStateId', realStateController.getRealStateById);
realStateRouter.get('/:realStateName', realStateController.getRealStateByName);
realStateRouter.post("/", realStateController.addRealState);
realStateRouter.put("/:realStateId", realStateController.putRealState);
realStateRouter.patch("/:realStateId", realStateController.updateRealState);
realStateRouter.delete("/:realStateId", realStateController.deleteRealStateById);
realStateRouter.post("/buy/:realStateId", auth.checkIfAuth, realStateController.addRealStateToUser);




module.exports = realStateRouter