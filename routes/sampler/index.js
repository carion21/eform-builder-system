const express = require('express');

const { getAppName, getMoment } = require('../../config/utils');
const { APP_NAME, APP_VERSION, APP_DESCRIPTION } = require('../../config/consts');
const { core_find_me } = require('../../config/global_functions');

const router = express.Router();

const moment = getMoment();
const service = "sampler"


router.get('/', async function (req, res, next) {
  let me = {}

  let r_core_me = await core_find_me(req.session.jwt_token)

  if (r_core_me.success) {
    me = r_core_me.data

    console.log('me', me);

    res.render(
      "sampler/index", {
      appName: APP_NAME,
      appVersion: APP_VERSION,
      appDescription: APP_DESCRIPTION,
      service: service,
      user_data: req.session.user_data,
      projects: me.projects,
    })
  } else {
    console.log("Error while retrieving me: " + r_core_me.message)
    // return 404 error
    res.render('security/notfound', {
      appName: APP_NAME,
      appVersion: APP_VERSION,
      appDescription: APP_DESCRIPTION
    })
  }
});


module.exports = router;