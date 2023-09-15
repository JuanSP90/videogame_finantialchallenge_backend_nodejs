const User = require("./modules/userModel");

const income = {

    sumIncome: async (req, res) => {
        try {

            const users = await User.find({}).populate("realState");

            for (let i = 0; i < users.length; i++) {
                const user = users[i];
                const realState = user.realState;

                const numberIncome = realState.reduce(
                    (totalIncome, currentRealState) => totalIncome + currentRealState.income,
                    0
                );

                const sum = user.balance + numberIncome * 5;


                await User.updateOne(
                    { _id: user._id },
                    {
                        $set: {
                            balance: sum
                        },
                    }
                );
            }

            return res.json(`Dinero cargado a todos los usuarios`);
        } catch (error) {
            res.status(500).json({ error: "Error al sumar el income a los usuarios en el archivo income.js" });
        }

    }
}

module.exports = income;
