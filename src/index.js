const express = require("express")
const cors = require("cors")

const acvRoutes = require("./routes/acv")

const app = express()
const PORT = 3000

app.use(cors())
app.use(express.json())
app.use('/acv', acvRoutes)

app.listen(PORT, () => {
    console.log(`App running on port: ${PORT}`)
})