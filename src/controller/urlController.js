// const validUrl = require('valid-url');
const shortid = require('shortid')
const urlModel = require('../model/urlModel')

const isValid = function (value) {
    if (typeof (value) === 'undefined' || typeof (value) === 'null') { return false }
    if (value.trim().length == 0) { return false }
    if (typeof (value) === 'string' && value.trim().length > 0) { return true }

}

const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0
}

// //
// function isUrlValid(userInput) {
//     var res = userInput.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
//     // if (res == null)
    //     return false;
    // else
    //     return true;
// }
//
const createurl = async function (req, res) {

    try {
        if (!isValidRequestBody(req.body)) {
            res.status(400).send({ status: false, message: 'Invalid request parameters. Please provide URL details' })
            return
        }
        if (!isValid(req.body.longUrl)) {
            return res.status(400).send({ status: false, message: ' Please provide LONG URL' })
        }

        const longUrl = req.body.longUrl.trim()

        if (!(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g).test(longUrl)) {
            return res.status(400).send({
                status: false,
                message:
                    "Invalid URL Format",
            });
        }

        const baseUrl = 'http://localhost:3000'

        let urlCode = shortid.generate().match(/[a-z\A-Z]/g).join("")
        console.log(urlCode);
        urlCode = urlCode.toLowerCase()



        let url = await urlModel.findOne({ longUrl })
        if (url) {
            return res.status(200).send({ status: true, "data": url })
        }

        const shortUrl = baseUrl + '/' + urlCode
        const urlData = { urlCode, longUrl, shortUrl }
        const newurl = await urlModel.create(urlData);
        return res.status(201).send({ status: true, msg: `URL created successfully`, data: newurl });
    } catch (err) {
        console.log(err)
        res.status(500).send({ status: false, msg: 'Server Error' })
    }
}





module.exports = {
    createurl
    // geturl
}