const shortid = require("shortid");
const urlModel = require("../model/urlModel");

const isValid = function (value) {
  if (typeof value === "undefined" || typeof value === "null") {
    return false;
  }
  if (value.trim().length == 0) {
    return false;
  }
  if (typeof value === "string" && value.trim().length > 0) {
    return true;
  }
};

const isValidRequestBody = function (requestBody) {
  return Object.keys(requestBody).length > 0;
};

const createurl = async function (req, res) {
  try {
    if (!isValidRequestBody(req.body)) {
      return res.status(400).send({
        status: false,
        message: "Invalid request parameters. Please provide URL details",
      });
    }

    if (!isValid(req.body.longUrl)) {
      return res
        .status(400)
        .send({ status: false, message: " Please provide LONG URL" });
    }

    const longUrl = req.body.longUrl.trim();

    if (
      !/^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(
        longUrl
      )
    ) {
      return res.status(400).send({
        status: false,
        message: "Invalid URL Format",
      });
    }

    const baseUrl = "http://localhost:3000";

    let urlCode = shortid
      .generate()
      .match(/[a-z\A-Z]/g)
      .join("");
    console.log(urlCode);
    urlCode = urlCode.toLowerCase();

    let url = await urlModel
      .findOne({ longUrl })
      .select({ urlCode: 1, _id: 0 });
    if (url) {
      return res
        .status(201)
        .send({
          status: true,
          msg: `${longUrl} is already registered`,
          data: url,
        });
    }

    const shortUrl = baseUrl + "/" + urlCode;
    const urlData = { urlCode, longUrl, shortUrl };
    const newurl = await urlModel.create(urlData);

    let currentUrl = {
      urlCode: newurl.urlCode,
      longUrl: newurl.longUrl,
      shortUrl: newurl.shortUrl,
    };
    return res.status(201).send({ data: currentUrl });
  } catch (err) {
    console.log(err);
    res.status(500).send({ status: false, msg: "Server Error" });
  }
};

const geturl = async function (req, res) {
  try {
    let urlCode = req.params.urlCode;
    if (!urlCode) {
      res.status(400).send({ status: false, msg: "please provide UrlCode" });
    }

    let checkUrlCodevalid = await urlModel.findOne({ urlCode });
    if (!checkUrlCodevalid) {
      return res.status(404).send({ status: false, msg: "Invalid UrlCode" });
    } else {
      return res.redirect(302, checkUrlCodevalid.longUrl);
    }
  } catch (error) {}
};

module.exports = {
  createurl,
  geturl,
};
