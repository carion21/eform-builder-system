const express = require('express');

const { getAppName, getMoment } = require('../../config/utils');
const { APP_NAME, APP_VERSION, APP_DESCRIPTION } = require('../../config/consts');
const { core_list_field_type, core_list_project, control_service_data, core_add_form, core_add_field, core_edit_project, core_find_project, core_find_form } = require('../../config/global_functions');

const router = express.Router();

const moment = getMoment();
const service = "build"

router.get('/:formUuid', async function (req, res, next) {
  let formUuid = req.params.formUuid
  // let formUuid = '38d41304-7fc3-4eba-a13e-e58a87bcd5d7'

  let form = {}

  let r_core_form = await core_find_form(req.session.jwt_token, formUuid)
  if (r_core_form.success) {
    form = r_core_form.data

    let ftypes = []
    let projects = []

    let r_core_ftype = await core_list_field_type(req.session.jwt_token)
    if (r_core_ftype.success) {
      ftypes = r_core_ftype.data
    }

    let r_core_projects = await core_list_project(req.session.jwt_token)
    if (r_core_projects.success) {
      projects = r_core_projects.data
    }

    form.Field = form.Field.map(field => {
      field.type = field.fieldType.value
      return field
    })

    res.render(
      "admin/index", {
      appName: APP_NAME,
      appVersion: APP_VERSION,
      appDescription: APP_DESCRIPTION,
      service: service,
      user_data: req.session.user_data,
      template: 'editor',
      form: form,
      ftypes: ftypes,
      projects: projects,
    })
  } else {
    console.log("Error while retrieving form: " + r_core_form.message)
    res.redirect("/build")
  }

});

router.get('/', async function (req, res, next) {
  let ftypes = []
  let projects = []

  let r_core_ftype = await core_list_field_type(req.session.jwt_token)
  if (r_core_ftype.success) {
    ftypes = r_core_ftype.data
  }

  let r_core_projects = await core_list_project(req.session.jwt_token)
  if (r_core_projects.success) {
    projects = r_core_projects.data
  }

  res.render(
    "admin/index", {
    appName: APP_NAME,
    appVersion: APP_VERSION,
    appDescription: APP_DESCRIPTION,
    service: service,
    user_data: req.session.user_data,
    template: 'creator',
    ftypes: ftypes,
    projects: projects,
  })
});




module.exports = router;