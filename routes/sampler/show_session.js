const express = require('express');

const { getAppName, getMoment, isInteger } = require('../../config/utils');
const { APP_NAME, APP_VERSION, APP_DESCRIPTION } = require('../../config/consts');
const { core_list_session, core_find_form, core_list_field_type, core_show_session } = require('../../config/global_functions');
const { parse } = require('dotenv');

const router = express.Router();

const moment = getMoment();
const service = "sampler"

router.get('/:formUuid/:sessionUuid', async function (req, res, next) {
  let formUuid = req.params.formUuid
  let sessionUuid = req.params.sessionUuid

  let form = {}

  let r_core_form = await core_find_form(req.session.jwt_token, formUuid)

  if (r_core_form.success) {
    form = r_core_form.data

    let ftypes = []

    let r_core_ftype = await core_list_field_type(req.session.jwt_token)
    if (r_core_ftype.success) {
      ftypes = r_core_ftype.data
    }

    let datas = {}

    let r_core_session_data = await core_show_session(req.session.jwt_token, {
      sessionUuid: sessionUuid,
      formUuid: formUuid
    })

    if (r_core_session_data.success) {
      datas = r_core_session_data.data[0]

      res.render(
        "sampler/show_session", {
        appName: APP_NAME,
        appVersion: APP_VERSION,
        appDescription: APP_DESCRIPTION,
        service: service,
        user_data: req.session.user_data,
        moment: moment,
        form: form,
        ftypes: ftypes,
        sessionUuid: sessionUuid,
        datas: datas
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
  } else {
    console.log("Error while retrieving form: " + r_core_form.message)
    // return 404 error
    res.render('security/notfound', {
      appName: APP_NAME,
      appVersion: APP_VERSION,
      appDescription: APP_DESCRIPTION
    })
  }

});

module.exports = router;