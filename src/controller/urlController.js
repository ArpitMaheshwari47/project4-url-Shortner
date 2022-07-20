
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
  } catch (error) {
    return res.status(500).send({ status: false,error:error.message});
  }
};

module.exports = {
  createurl,
  geturl,
};
