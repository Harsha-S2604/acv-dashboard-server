const express = require("express")
const acvHandlers = require("../handlers/acv")

const router = express.Router()

router.get("/", acvHandlers.getACVData)
router.get("/:type", acvHandlers.getACVDataByType)

module.exports = router