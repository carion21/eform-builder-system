const express = require('express');

const { getAppName, getMoment, formatData } = require('../../config/utils');
const { APP_NAME, APP_VERSION, APP_DESCRIPTION } = require('../../config/consts');
const { core_list_field_type, core_list_project, control_service_data, core_find_form, core_store_data, core_find_me } = require('../../config/global_functions');

const router = express.Router();

const moment = getMoment();
const service = "build"

router.get('/:formUuid', async function (req, res, next) {
  let formUuid = req.params.formUuid

  let form = {}

  let r_core_form = await core_find_form(req.session.jwt_token, formUuid)

  if (r_core_form.success) {
    form = r_core_form.data

    let ftypes = []

    let r_core_ftype = await core_list_field_type(req.session.jwt_token)
    if (r_core_ftype.success) {
      ftypes = r_core_ftype.data
    }

    res.render(
      "supervisor/store", {
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

router.post('/:formUuid', async function (req, res, next) {
  let formUuid = req.params.formUuid

  let form = {}

  let r_core_form = await core_find_form(req.session.jwt_token, formUuid)

  if (r_core_form.success) {
    form = r_core_form.data

    let ftypes = []

    let r_core_ftype = await core_list_field_type(req.session.jwt_token)
    if (r_core_ftype.success) {
      ftypes = r_core_ftype.data
    }

    let body = req.body

    let error = ""

    let vtypes = {}
    for (let key in body) {
      const field = form.Field.find(f => f.slug === key)
      vtypes[key] = field.fieldType.value
    }
    const data = formatData(body, vtypes)

    let store_data = {
      formUuid: formUuid,
      data: data
    }
    // console.log('store_data', store_data);

    let r_core_store_data = await core_store_data(req.session.jwt_token, store_data)

    if (r_core_store_data.success) {
      res.render(
        "supervisor/store", {
        appName: APP_NAME,
        appVersion: APP_VERSION,
        appDescription: APP_DESCRIPTION,
        service: service,
        user_data: req.session.user_data,
        form: form,
        ftypes: ftypes,
        message: "Les données ont été enregistrées avec succès"
      })
    } else {
      error = r_core_store_data.message
    }

    if (error) {
      res.render(
        "supervisor/store", {
        appName: APP_NAME,
        appVersion: APP_VERSION,
        appDescription: APP_DESCRIPTION,
        service: service,
        user_data: req.session.user_data,
        form: form,
        ftypes: ftypes,
        rbody: body,
        error: error
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