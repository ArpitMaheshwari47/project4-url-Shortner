const shortid = require("shortid");
const urlModel = require("../model/urlModel");
const redis = require("redis");

const { promisify } = require("util");
//--------------------------------Connect to redis------------------------------------
const redisClient = redis.createClient(
  13190,
  "redis-13190.c301.ap-south-1-1.ec2.cloud.redislabs.com",
  { no_ready_check: true }
);
redisClient.auth("gkiOIPkytPI3ADi14jHMSWkZEo2J5TDG", function (error) {
  if (error) throw error;
});

redisClient.on("connect", async function () {
  console.log("Connected to Redis..");
});

//Connection setup for redis

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);

//------------------------------------validation---------------------------------------
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

    // if (
    //   !/^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(
    //     longUrl
    //   )
    if(!(/(:?^((https|http|HTTP|HTTPS){1}:\/\/)(([w]{3})[\.]{1})?([a-zA-Z0-9]{1,}[\.])[\w]*((\/){1}([\w@?^=%&amp;~+#-_.]+))*)$/.test(longUrl))
    )

    {
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
    urlCode = urlCode.toLowerCase();

    let url = await urlModel
      .findOne({ longUrl })
      .select({ shortUrl: 1, _id: 0 });
      // console.log(url)
    if (url) {
      await SET_ASYNC(`${longUrl}`, JSON.stringify(url));
      return res.status(201).send({
        status: true,
        msg: `${longUrl} is already registered`,
        data: url,
      });
    }
    // console.log(url)
    //------------------------findInCache------------
    const findInCache = await GET_ASYNC(`${longUrl}`);
    console.log(findInCache)
    if (findInCache) {
      let data = JSON.parse(findInCache);
      console.log(data)
      return res
        .status(200)
        .send({
          status: true,
          message: "Entry from cache",
          shortUrl: data.shortUrl,
        });
        
      }

    const shortUrl = baseUrl + "/" + urlCode;
    const urlData = { urlCode, longUrl, shortUrl };
    const newurl = await urlModel.create(urlData);
    await SET_ASYNC(`${longUrl}`, JSON.stringify(newurl));
    await SET_ASYNC(`${urlCode}`, JSON.stringify(newurl));

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
      return res.status(404).send({ status: false, msg: "shortUrl not found" });
    } else {
      await SET_ASYNC(`${urlCode}`, JSON.stringify(checkUrlCodevalid));

      return res.redirect(302, checkUrlCodevalid.longUrl);
    }
  } catch (error) {
    res.status(500).send({ status: false, msg: "Server Error" });
  }
};

module.exports = {
  createurl,
  geturl,
};
