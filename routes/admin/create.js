const express = require('express');

const { getAppName, getMoment } = require('../../config/utils');
const { APP_NAME, APP_VERSION, APP_DESCRIPTION } = require('../../config/consts');
const { core_list_field_type, core_list_project, control_service_data, core_add_form, core_add_field, core_edit_project, core_find_project, core_find_form } = require('../../config/global_functions');

const router = express.Router();

const moment = getMoment();
const service = "build"

router.post('/', async function (req, res, next) {
  const result = {
    success: false,
  }

  let body = req.body
  // console.log("Body", body);


  const SERVICE_TYPE = "new_form"
  let bcontrol = control_service_data(SERVICE_TYPE, body)

  let error = ""

  if (bcontrol.success) {
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
      name: body.name,
      description: body.description,
    }
    let c_form = null
    let r_core_new_form = await core_add_form(req.session.jwt_token, formData)
    // console.log("r_core_new_form", r_core_new_form);

    if (r_core_new_form.success) {
      c_form = r_core_new_form.data

      for (const field of fields) {
        console.log('<><><><');
        // console.log(field);
        if (field.type !== "select" && !field.selectValues) {
          field.selectValues = ""
        }

        field.formId = c_form.id
        let r_core_add_field = await core_add_field(req.session.jwt_token, field)
        if (!r_core_add_field.success) {
          error = r_core_add_field.message
          console.log('-----------------');

          console.log("Field", field);
          // console.log(r_core_add_field);
          break
        }
      }

    } else {
      error = r_core_new_form.message
    }

    if (!error) {
      result.success = true
      result.message = "Formulaire créé avec succès."
      result.data = c_form
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