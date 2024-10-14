const express = require('express');

const { getAppName, getMoment } = require('../../config/utils');
const { APP_NAME, APP_VERSION, APP_DESCRIPTION } = require('../../config/consts');
const { core_list_field_type, control_service_data, core_update_form, core_find_form, core_update_fields } = require('../../config/global_functions');

const router = express.Router();

const moment = getMoment();
const service = "build"

router.post('/', async function (req, res, next) {
  const result = {
    success: false,
  }

  let body = req.body

  const SERVICE_TYPE = "edit_form"
  let bcontrol = control_service_data(SERVICE_TYPE, body)

  let error = ""

  if (bcontrol.success) {
    let ftypes = []
    let project = {}

    let r_core_ftype = await core_list_field_type(req.session.jwt_token)
    if (r_core_ftype.success) {
      ftypes = r_core_ftype.data
    }

    let r_core_form = await core_find_form(req.session.jwt_token, body.formUuid)

    if (r_core_form.success) {
      form = r_core_form.data

      let ftypes = []

      let r_core_ftype = await core_list_field_type(req.session.jwt_token)
      if (r_core_ftype.success) {
        ftypes = r_core_ftype.data
      }

      let fields = body.fields
      fields.forEach(field => {
        let ftype = ftypes.find(ftype => ftype.value === field.type)
        field.fieldTypeId = ftype.id
      });

      let formData = {
        id: form.id,
        name: body.name,
        description: body.description,
      }
      let c_form = null
      let r_core_update_form = await core_update_form(req.session.jwt_token, formData)

      if (r_core_update_form.success) {
        c_form = r_core_update_form.data

        console.log("body.fields", body.fields);
        

        let r_core_update_fields = await core_update_fields(req.session.jwt_token, form.id, {
          fields: body.fields
        })

        if (r_core_update_fields.success) {
          result.success = true
          result.data = r_core_update_fields.data
        } else {
          error = r_core_update_fields.message
        }

      } else {
        error = r_core_update_form.message
      }


    } else {
      error = r_core_form.message
    }

  } else {
    error = bcontrol.message
  }

  if (error) {
    result.message = error
  }

  res.json(result);
});

module.exports = router;