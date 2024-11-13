const express = require('express');

const { getAppName, getMoment, isInteger } = require('../../config/utils');
const { APP_NAME, APP_VERSION, APP_DESCRIPTION } = require('../../config/consts');
const { core_list_session } = require('../../config/global_functions');
const { parse } = require('dotenv');

const router = express.Router();

const moment = getMoment();
const service = "sampler"

router.get('/:formUuid', async function (req, res, next) {
  let formUuid = req.params.formUuid

  let sessions = []

  let r_core_sessions = await core_list_session(req.session.jwt_token, {
    formUuid: formUuid
  })

  if (r_core_sessions.success) {
    sessions = r_core_sessions.data

    res.render(
      "sampler/list_session", {
      appName: APP_NAME,
      appVersion: APP_VERSION,
      appDescription: APP_DESCRIPTION,
      service: service,
      user_data: req.session.user_data,
      moment: moment,
      sessions: sessions
    })
  } else {
    console.log("Error while retrieving sessions: " + r_core_sessions.message)
    // return 404 error
    res.render('security/notfound', {
      appName: APP_NAME,
      appVersion: APP_VERSION,
      appDescription: APP_DESCRIPTION
    })
  }

});

module.exports = router;