const fs = require("fs")
const path = require("path")

const ACV_CONFIG = {
    "customer_type": {"file": "customer_type.json", "query_key": "Cust_Type"},
    "acct_industry": { "file": "acc_industry.json", "query_key": "Acct_Industry" },
    "acv_range": { "file": "acv_range.json", "query_key": "ACV_Range" },
    "team": { "file": "team.json", "query_key": "Team" },
}

const getACVDataByType = (req, res) => {
    try {
        const { type } = req.params
        const fileName = ACV_CONFIG[type].file
        if (!fileName) {
            throw new Error("No such file exists")
        }

        const filePath = path.resolve(path.join(__dirname, `../data/${fileName}`))
        const fileData = fs.readFileSync(filePath, 'utf-8') // later replace with aws s3

        const responseObject = {
            status: "OK",
            data: fileData
        }
        res.send(responseObject)
    } catch (error) {
        console.error("Failed to get the acv data", error)
        const responseObject = {
            status: "ERROR",
            message: "Something went wrong, Please try again later",
            data: []
        }
        res.send(responseObject)
    }
}

const getACVData = async (req, res) => {
    let responseObject = {}
    try {
        const data = []
        const fileDataPromises = []
        const acvKeys = Object.keys(ACV_CONFIG) // to maintain the order

        for (let i = 0; i < acvKeys.length; i++) {
            const acv_key = acvKeys[i]
            const fileName = ACV_CONFIG[acv_key].file
            if (!fileName) {
                throw new Error("No such file exists")
            }

            const filePath = path.resolve(path.join(__dirname, `../data/${fileName}`))
            const fileDataPromise = new Promise((resolve, reject) => {
                fs.readFile(filePath, 'utf-8', (err, data) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(data)
                    }
                })
            })  // later replace with aws s3
            fileDataPromises.push(fileDataPromise)
        }

        const filesData = await Promise.all(fileDataPromises)

        for (let i = 0; i < acvKeys.length; i++) {
            const acvData = {}
            const acvKey = acvKeys[i]

            const query_key = ACV_CONFIG[acvKey].query_key
            const fileData = JSON.parse(filesData[i])

            for (let j = 0; j < fileData.length; j++) {
                const acvData = fileData[j]
                const query_value = acvData[query_key]
                delete acvData[query_key]
                acvData["type"] = query_value
            }

            acvData["type"] = acvKey
            acvData["acvData"] = fileData

            data.push(acvData)
        }

        responseObject = {
            status: "OK",
            data: JSON.stringify(data)
        }

    } catch (error) {
        console.error("Failed to get the acv data", error)
        responseObject = {
            status: "ERROR",
            message: "Something went wrong, Please try again later",
            data: []
        }
    }

    res.send(responseObject)
}

module.exports = {
    getACVDataByType,
    getACVData
}