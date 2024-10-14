const express = require('express');

const axios = require('axios');

const { getMoment, getCoreUrl } = require('../../config/utils');
const router = express.Router();

const urlapi = getCoreUrl();
const moment = getMoment();
const service = "security"

router.get('/', async function (req, res, next) {
  if (req.session.user_data) {
    req.session.destroy();
  }
  res.redirect('/security');

});


module.exports = router;