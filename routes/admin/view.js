const express = require('express');

const { getAppName, getMoment } = require('../../config/utils');
const { APP_NAME, APP_VERSION, APP_DESCRIPTION } = require('../../config/consts');
const { core_list_field_type, core_list_project, control_service_data, core_find_form } = require('../../config/global_functions');

const router = express.Router();

const moment = getMoment();
const service = "admin"

router.get('/:formUuid', async function (req, res, next) {
  let formUuid = req.params.formUuid

  let form = {}

  let r_core_form = await core_find_form(req.session.jwt_token, formUuid)
  console.log(r_core_form);

  if (r_core_form.success) {
    form = r_core_form.data

    let ftypes = []

    let r_core_ftype = await core_list_field_type(req.session.jwt_token)
    if (r_core_ftype.success) {
      ftypes = r_core_ftype.data
    }

    res.render(
      "view/index", {
      appName: APP_NAME,
      appVersion: APP_VERSION,
      appDescription: APP_DESCRIPTION,
      service: service,
      user_data: req.session.user_data,
      form: form,
      ftypes: ftypes,
    })
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