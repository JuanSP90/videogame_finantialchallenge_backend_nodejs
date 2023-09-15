const User = require("../modules/userModel");
const jwt = require("jsonwebtoken");
const mySecret = process.env.MYSECRET;
const bcrypt = require("bcrypt");
const transporter = require("../mailConfig");

const UserController = {
  loginUser: async (req, res) => {
    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ error: "El usuario no existe" });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ error: "Contraseña inválida" });
      }

      const token = jwt.sign({ user: user.email, id: user._id }, mySecret, {
        expiresIn: "1h",
      });
      return res.json({ message: "Inicio de sesión exitoso", token });
    } catch (error) {
      res.status(500).json({ error: "Error al logearse" });
    }
  },

  getUsers: async (req, res) => {
    try {
      const users = await User.find();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Error al traer los usuarios" });
    }
  },

  getUser: async (req, res) => {
    const { userId } = req.params;
    try {
      const user = await User.findOne({ _id: userId });
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Error al buscar el usuario" });
    }
  },

  getUserProfile: async (req, res) => {
    try {
      const { email, _id, balance, realState, userName, role, lastBonoTime } =
        await User.findById(req.userInfo.id).populate("realState");
      res.json({
        email,
        _id,
        balance,
        realState,
        userName,
        role,
        lastBonoTime,
      });
    } catch (error) {
      res.status(500).json({ error: "Error al buscar el usuario en /me" });
    }
  },

  addUser: async (req, res) => {
    const { email, password, userName } = req.body;
    try {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(401).json({ error: "El email ya está registrado" });
      }
      const existingUserName = await User.findOne({ userName });
      if (existingUserName) {
        return res
          .status(401)
          .json({ error: "El nombre de usuario ya está registrado" });
      }
      const newUser = new User({
        email,
        password,
        userName,
        balance: 1000000,
        realState: [],
        role: 1,
        lastBonoTime: 0,
      });
      await newUser.save();

      const token = jwt.sign(
        { user: newUser.email, id: newUser._id },
        mySecret,
        { expiresIn: "1h" }
      );

      const mailOptions = {
        to: newUser.email,
        subject: "Finantial Challenge : Registro finalizado. ",
        text: "Bienvenido a nuestro juego",
      };

      try {
        await transporter.sendMail(mailOptions);
      } catch (error) {
        console.error(error);
      }

      res.json({ message: "Registro exitoso", token });
    } catch (error) {
      res.status(500).json({ error: "Error en el servidor" });
    }
  },

  deleteUser: async (req, res) => {
    const { role } = await User.findById(req.userInfo.id);
    if (role === 2) {
      const { userId } = req.params;
      await User.deleteOne({ _id: userId });
      res.json(`El usuario con id ${userId} ha sido eliminado`);
    }
  },

  putUser: async (req, res) => {
    const { userId } = req.params;
    await User.findOneAndReplace({ _id: userId }, { ...req.body });
    const user = await User.findOne({ _id: userId });
    res.json(user);
  },

  addcash: async (req, res) => {
    const userId = req.userInfo.id;
    const user = await User.findById(userId);
    const balance = user.balance;

    if (user.lastBonoTime >= Date.now() - 15000) {
      const waitingTime = (user.lastBonoTime - (Date.now() - 15000)) / 1000;
      return res.json({
        error: true,
        message: `Te quedan ${waitingTime}s para poder conseguir mas dinero`,
        waitingTime: waitingTime,
      });
    }
    await User.updateOne(
      { _id: userId },
      {
        $set: {
          balance: balance + 1000,
          lastBonoTime: balance ? Date.now() : user.lastBonoTime,
        },
      }
    );
    res.status(200).json("tu balace ha sido actualizado");
  },

  updateUser: async (req, res) => {
    const { userId } = req.params;
    const { userName, password, email, realState, role } = req.body;

    await User.updateOne(
      { _id: userId },
      {
        $set: {
          userName,
          email,
          password,
          realState,
          role,
        },
      }
    );
    const userAfterUpdate = await User.findById(userId);
    res.json(userAfterUpdate);
  },
  updateUserConfig: async (req, res) => {
    const userId = req.userInfo.id;
    const { userName, password, email } = req.body;

    try {
      if (password) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        await User.findByIdAndUpdate(
          userId,
          { $set: { password: hashedPassword } },
          { new: true }
        );
      }

      if (userName) {
        const existingUserName = await User.findOne({ userName });
        if (existingUserName) {
          return res
            .status(401)
            .json({ error: "El nombre de usuario ya está registrado" });
        }
      }

      if (email) {
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
          return res.status(401).json({ error: "El email ya está registrado" });
        }
      }
      const user = await User.findByIdAndUpdate(
        userId,
        { $set: { userName, email } },
        { new: true }
      );

      res.json(user);
    } catch (error) {
      console.error("Error al actualizar el nombre de usuario:", error);
      res
        .status(500)
        .json({ error: "Error al actualizar el nombre de usuario" });
    }
  },
  forgotPassword: async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (user) {
      try {
        const randomPassword =
          Math.floor(Math.random() * (99999 - 10000 + 1)) + 10000;
        user.password = randomPassword;
        await user.save();

        const mailOptions = {
          to: email,
          subject: "Recupera tu contraseña de SharingMe ",
          text: `Aqui le mandamos una nueva contraseña, porfavor entre a su perfil y cambiela.

                Nueva Contraseña: ${randomPassword}
                
                Muchas gracias por confiar en nosotros, SharingMe`,
        };

        await transporter.sendMail(mailOptions);
        return res
          .status(200)
          .json("Email con nueva contraseña enviado con exito");
      } catch (error) {
        console.error("Error al enviar la forgotPassword", error);
        res.status(500).json({ error: "Error al enviar la forgotPassword" });
      }
    }
  },
};

module.exports = UserController;
