const mongoose = require('mongoose');
require('dotenv').config();
const Users = require("./routes/usersRoute");
const RealState = require('./routes/realStateRoute');
const express = require('express')
const app = express()
const port = 3001
var cors = require('cors')
app.use(express.json())
app.use(cors())
app.use("/users", Users)
app.use("/realStates", RealState)




async function main() {
  return await mongoose.connect(process.env.CONNECTIONDB)
}


main()
  .then(() => console.log('Estamos conectados a la DB'))
  .catch(err => console.log(err))

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});