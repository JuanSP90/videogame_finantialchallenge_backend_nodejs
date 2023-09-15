const RealState = require("../modules/realStateModel");
const Users = require("../modules/userModel");

const realStateController = {
  getRealStates: async (req, res) => {
    try {
      const getData = await RealState.find();
      res.json(getData);
    } catch (error) {
      res.status(500).json({
        error: "error al obtener todas las realState",
      });
    }
  },

  getRealStateById: async (req, res) => {
    const { realStateId } = req.params;
    try {
      const realState = await RealState.findOne({
        _id: realStateId,
      });
      res.json(realState);
    } catch {
      res.status(500).json({
        error: "al buscar realstate por id",
      });
    }
  },

  getRealStateByName: async (req, res) => {
    const { realStateName } = req.params;
    try {
      const realState = await RealState.findOne({
        name: realStateName,
      });
      res.json(realState);
    } catch {
      res.status(500).json({
        error: "al buscar realstate por id",
      });
    }
  },

  addRealState: async (req, res) => {
    const { price, name, description, income } = req.body;
    try {
      const extingRealState = await RealState.findOne({
        name,
      });
      if (extingRealState) {
        return res.status(401).json({
          error: "ya existe un RealState con este nombre",
        });
      }
      const newRealState = new RealState({
        price,
        name,
        description,
        income,
      });

      await newRealState.save();
      res.json({ message: "creada con exito realState" });
    } catch (error) {
      res.status(500).json({
        error: "algo ha salido mal la crear la casa",
      });
    }
  },

  deleteRealStateById: async (req, res) => {
    const { realStateId } = req.params;
    try {
      await RealState.deleteOne({ _id: realStateId });
      res.json("la RealState ha sido eliminada");
    } catch (error) {
      res.status(500).json({
        error: "error al eliminar",
      });
    }
  },

  putRealState: async (req, res) => {
    const { realStateId } = req.params;
    try {
      await RealState.findOneAndReplace({ _id: realStateId }, { ...req.body });
    } catch (error) {
      res.status(500).json({
        error: "error al reemplazar",
      });
    }
  },

  updateRealState: async (req, res) => {
    const { realStateId } = req.params;
    try {
      await RealState.findByIdAndUpdate({ _id: realStateId }, { ...req.body });
    } catch (error) {
      res.status(500).json({
        error: "error al actualizar",
      });
    }
  },
  addRealStateToUser: async (req, res) => {
    try {
      const user = await Users.findById(
        req.userInfo.id
      ).populate("realState");
      const { realStateId } = req.params
      const { price } = await RealState.findById(realStateId)

      if (price > user.balance) {
        res.status(500).json({
          error: "no tienes dinero suficiente",
        });
      } else {
        const newUserBalance = user.balance - price;
        user.realState.push(realStateId);
        user.balance = newUserBalance
        await user.save()
        res.json(user)
      };
    } catch (error) {
      res.status(500).json({
        error: "Ocurrió un error al asignar la casa al jugador",
      });
    }
  },
};

module.exports = realStateController;
