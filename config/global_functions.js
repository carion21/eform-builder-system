const { SERVICE_TYPES_FIELDS } = require("./consts")
const { isString, isInteger, isBoolean, isObject, isArray, isNumber, isArrayOfString, isArrayOfInteger, getMoment, getCoreUrl, verifyJwtToken } = require("./utils")

const axios = require('axios');
const validator = require('email-validator');

require('dotenv').config()

const urlapi = getCoreUrl()
const moment = getMoment()


const control_service_data = ((service_type_value, service_data) => {
  let result = {
    success: false
  }

  let error = ""

  try {
    if (isObject(service_data)) {
      let authorized_services = Object.keys(SERVICE_TYPES_FIELDS)

      if (authorized_services.includes(service_type_value)) {
        if (service_type_value == "undefined") {
          result.success = true
        } else {
          let rcontrol_basic = execute_service_basic_control_field(service_type_value, service_data)

          if (rcontrol_basic.success) {
            result.success = true
          } else {
            error = rcontrol_basic.message
          }
        }
      } else {
        error = "service_type is not valid or not implemented"
      }
    } else {
      error = "service_data must be an object"
    }
  } catch (err) {
    error = "big error when controlling service data : " + err.toString()
  }

  if (error != "") {
    result.message = error
  }

  return result
})

const execute_service_basic_control_field = ((service_type_value, service_data) => {
  let result = {
    success: false
  }

  let error = ""

  try {
    let data_fields = Object.keys(service_data)
    let data_values = Object.values(service_data)

    let authorized_fields = SERVICE_TYPES_FIELDS[service_type_value].fields
    let authorized_types = SERVICE_TYPES_FIELDS[service_type_value].types

    let present_fields = data_fields.filter(field => authorized_fields.includes(field))
    let present_types = present_fields.map(field => authorized_types[authorized_fields.indexOf(field)])

    let required_fields = SERVICE_TYPES_FIELDS[service_type_value].required
    // let required_types = required_fields.map(field => authorized_types[authorized_fields.indexOf(field)])
    // verify if each element of required_fields is in data_fields
    if (required_fields.every(field => data_fields.includes(field))) {
      let rcontrol_fields_type = control_fields_type(present_fields, present_types, data_fields, data_values)

      if (rcontrol_fields_type.success) {
        result.success = true
      } else {
        error = rcontrol_fields_type.message
      }
    } else {
      error = "the authorized fields for service_type " + service_type_value + " are : " + authorized_fields.join(", ")
    }
  } catch (err) {
    error = "big error while executing service basic control field : " + err.toString()
  }

  if (error != "") {
    result.message = error
  }

  return result
})

const control_fields_type = ((rfields, rtypes, dfields, dvalues) => {
  let result = {
    success: false
  }

  let error = ""

  result.success = true

  for (let i = 0; i < rfields.length; i++) {
    const field = rfields[i];
    const ftype = rtypes[i];
    const index = dfields.indexOf(field)
    if (index != -1) {
      const value = dvalues[index];
      let rcontrol_field_type = control_field_type(field, value, ftype)
      if (!rcontrol_field_type.success) {
        error = rcontrol_field_type.message
        result.success = false
        break;
      }
    } else {
      error = "the field " + field + " is required"
      result.success = false
      break;
    }
  }

  if (error != "") {
    result.message = error
  }

  return result
})

const control_field_type = ((field, value, field_type) => {
  let result = {
    success: false
  }

  let error = ""

  switch (field_type) {
    case "string":
      if (isString(value) && value != "") {
        result.success = true
      } else {
        error = "the field " + field + " must be a string"
      }
      break;
    case "string_not_empty":
      if (isString(value) && value != "") {
        result.success = true
      } else {
        error = "the field " + field + " must be a string and not empty"
      }
      break;
    case "string_email":
      if (isString(value) && value != "") {
        if (validator.validate(value)) {
          result.success = true
        } else {
          error = "the field " + field + " must be a string email"
        }
      } else {
        error = "the field " + field + " must be a string and not empty"
      }
      break;
    case "string_date":
      if (isString(value) && value != "") {
        if (moment(value, "YYYY-MM-DD HH:mm:ss").isValid() || moment(value, "YYYY-MM-DD").isValid()) {
          result.success = true
        }
      }
      if (!result.success) {
        error = "the field " + field + " must be a string date"
      }
      break;
    case "string_boolean":
      if (isString(value) && value != "") {
        if (value == "true" || value == "false") {
          result.success = true
        }
      }
      if (!result.success) {
        error = "the field " + field + " must be a string boolean"
      }
      break;
    case "string_integer":
      if (isString(value) && value != "") {
        if (isInteger(parseInt(value))) {
          result.success = true
        }
      }
      if (!result.success) {
        error = "the field " + field + " must be a string integer"
      }
      break;
    case "integer":
      if (isInteger(value)) {
        result.success = true
      } else {
        error = "the field " + field + " must be an integer"
      }
      break;
    case "boolean":
      if (isBoolean(value)) {
        result.success = true
      } else {
        error = "the field " + field + " must be a boolean"
      }
      break;
    case "object":
      if (isObject(value)) {
        result.success = true
      } else {
        error = "the field " + field + " must be an object"
      }
      break;
    case "array":
      if (isArray(value)) {
        result.success = true
      } else {
        error = "the field " + field + " must be an array"
      }
      break;
    case "number":
      if (isNumber(value)) {
        result.success = true
      } else {
        error = "the field " + field + " must be a number"
      }
      break;
    case "array_of_string":
      if (isString(value)) {
        value = [value]
      }
      if (isArrayOfString(value)) {
        result.success = true
      } else {
        error = "the field " + field + " must be an array of string"
      }
      break;
    case "array_of_integer":
      if (isInteger(value)) {
        value = [value]
      }
      if (isArrayOfInteger(value)) {
        result.success = true
      } else {
        error = "the field " + field + " must be an array of integer"
      }
      break;
    case "array_of_string_integer":
      if (isArrayOfString(value)) {
        if (value.every(element => isInteger(parseInt(element)))) {
          result.success = true
        }
      }
      if (!result.success) {
        error = "the field " + field + " must be an array of string integer"
      }
      break;
    case "array_of_object":
      if (isArray(value)) {
        if (value.every(element => isObject(element))) {
          result.success = true
        }
      }
      if (!result.success) {
        error = "the field " + field + " must be an array of object"
      }
      break;
    case "undefined":
      result.success = true
      break;
    default:
      error = "the field " + field + " has an unknown type"
      break;
  }

  if (error != "") {
    result.message = error
  }

  return result
})

const verify_jwt_token = ((jwt_token) => {
  let result = {
    success: false,
  }

  let error = ""

  try {
    // let user_data = decodeJwtToken(jwt_token)
    let decoded = verifyJwtToken(jwt_token)

    // Récupérer l'horodatage actuel (en secondes)
    const now = Math.floor(Date.now() / 1000);

    // Vérification des timestamps iat (Issued At) et exp (Expiration Time)
    if (decoded.iat > now) {
      error = "Le token n'est pas encore valide.";
    } else if (decoded.exp < now) {
      error = "Le token a expiré.";
    } else {
      result.success = true
      result.data = decoded
    }
  } catch (err) {
    error = err.message
  }

  if (error != "") {
    result.message = error
  }

  return result
})


const core_signin = (async (body) => {
  let result = {
    success: false
  }

  let error = ""

  let urlcomplete = urlapi + process.env.ROUTE_OF_CORE_TO_SIGNIN
  try {
    let response = await axios.post(urlcomplete, {
      email: body.email,
      password: body.password
    })
    if (response.status == 201) {
      let rdata = response.data
      result.success = true
      result.data = rdata
    } else {
      error = response.data.message
    }
  } catch (err) {
    error = err.message
    if (err.response) {
      error = err.response.data.message
    }
  }

  if (error != "") {
    result.message = error
  }

  return result
})

const core_make_get_request = (async (
  { main_endpoint, suffix_endpoint, is_protected = false, jwt_token = "" }
) => {
  let result = {
    success: false
  }

  let error = ""

  let urlcomplete = urlapi + main_endpoint + suffix_endpoint
  // console.log("urlcomplete", urlcomplete);
  try {
    const headers = is_protected ? {
      'Authorization': 'Bearer ' + jwt_token
    } : {}

    let response = await axios.get(urlcomplete, {
      headers: headers
    })

    if (response.status == 200) {
      let rdata = response.data
      result.success = true
      result.data = rdata.data ?? rdata
    } else {
      error = response.data.message
    }
  } catch (err) {
    error = err.message
    if (err.response) {
      error = err.response.data.message
    }
  }

  if (error != "") {
    result.message = error
  }

  return result
})


const core_make_post_request = (async (
  { main_endpoint, suffix_endpoint, is_protected = false, jwt_token = "", payload = {} }
) => {
  let result = {
    success: false
  }

  let error = ""

  let urlcomplete = urlapi + main_endpoint + suffix_endpoint
  // console.log("urlcomplete", urlcomplete);
  try {
    const headers = is_protected ? {
      'Authorization': 'Bearer ' + jwt_token
    } : {}

    let response = await axios.post(urlcomplete, payload, {
      headers: headers
    })


    if (response.status == 201) {
      let rdata = response.data
      result.success = true
      result.data = rdata.data
    } else {
      error = response.data.message
    }
  } catch (err) {
    // console.log(err.response.data);
    error = err.message
    if (err.response) {
      error = err.response.data.message
    }
  }

  if (error != "") {
    result.message = error
  }

  return result
})


const core_make_patch_request = (async (
  { main_endpoint, suffix_endpoint, is_protected = false, jwt_token = "", payload = {} }
) => {
  let result = {
    success: false
  }

  let error = ""

  let urlcomplete = urlapi + main_endpoint + suffix_endpoint
  // console.log("urlcomplete", urlcomplete);
  try {
    const headers = is_protected ? {
      'Authorization': 'Bearer ' + jwt_token
    } : {}

    let response = await axios.patch(urlcomplete, payload, {
      headers: headers
    })

    if (response.status == 200) {
      let rdata = response.data
      result.success = true
      result.data = rdata.data
    } else {
      error = response.data.message
    }
  } catch (err) {
    error = err.message
    if (err.response) {
      error = err.response.data.message
    }
  }

  if (error != "") {
    result.message = error
  }

  return result
})


const core_make_delete_request = (async (
  { main_endpoint, suffix_endpoint, is_protected = false, jwt_token = "" }
) => {
  let result = {
    success: false
  }

  let error = ""

  let urlcomplete = urlapi + main_endpoint + suffix_endpoint

  try {
    const headers = is_protected ? {
      'Authorization': 'Bearer ' + jwt_token
    } : {}

    let response = await axios.delete(urlcomplete, {
      headers: headers
    })

    if (response.status == 204) {
      result.success = true
    } else {
      error = response.data.message
    }
  } catch (err) {
    error = err.message
    if (err.response) {
      error = err.response.data.message
    }
  }

  if (error != "") {
    result.message = error
  }

  return result
})


const core_make_upload_request = (async (
  { main_endpoint, suffix_endpoint, is_protected = false, jwt_token = "", payload = {} }
) => {
  let result = {
    success: false
  }

  let error = ""

  let urlcomplete = urlapi + main_endpoint + suffix_endpoint

  try {
    const headers = is_protected ? {
      'Authorization': 'Bearer ' + jwt_token,
      'Content-Type': 'multipart/form-data'
    } : {
      'Content-Type': 'multipart/form-data'
    }

    let response = await axios.patch(urlcomplete, payload, {
      headers: headers
    })

    if (response.status == 200) {
      let rdata = response.data
      result.success = true
      result.data = rdata
    } else {
      error = response.data.message
    }
  } catch (err) {
    error = err.message
    if (err.response) {
      error = err.response.data.message
    }
  }

  if (error != "") {
    result.message = error
  }

  return result
})

const core_change_password = (async (jwt_token, payload) => {
  return await core_make_post_request({
    main_endpoint: process.env.ROUTE_OF_CORE_TO_CHANGE_PASSWORD,
    suffix_endpoint: "",
    is_protected: true,
    jwt_token: jwt_token,
    payload: payload
  })
})

const core_list_field_type = (async (jwt_token) => {
  return await core_make_get_request({
    main_endpoint: process.env.ROUTE_OF_CORE_FOR_FIELD_TYPE,
    suffix_endpoint: "",
    is_protected: true,
    jwt_token: jwt_token
  })
})

const core_list_project = (async (jwt_token) => {
  return await core_make_get_request({
    main_endpoint: process.env.ROUTE_OF_CORE_FOR_PROJECT,
    suffix_endpoint: "",
    is_protected: true,
    jwt_token: jwt_token
  })
})

const core_find_project = (async (jwt_token, project_id) => {
  return await core_make_get_request({
    main_endpoint: process.env.ROUTE_OF_CORE_FOR_PROJECT,
    suffix_endpoint: "/" + project_id,
    is_protected: true,
    jwt_token: jwt_token
  })
})

const core_edit_project = (async (jwt_token, payload) => {
  return await core_make_patch_request({
    main_endpoint: process.env.ROUTE_OF_CORE_FOR_PROJECT,
    suffix_endpoint: "/" + payload.id,
    is_protected: true,
    jwt_token: jwt_token,
    payload: payload
  })
})

const core_find_form = (async (jwt_token, form_uuid) => {
  return await core_make_get_request({
    main_endpoint: process.env.ROUTE_OF_CORE_FOR_FORM,
    suffix_endpoint: "/by-uuid/" + form_uuid,
    is_protected: true,
    jwt_token: jwt_token
  })
})

const core_add_form = (async (jwt_token, payload) => {
  return await core_make_post_request({
    main_endpoint: process.env.ROUTE_OF_CORE_FOR_FORM,
    suffix_endpoint: "",
    is_protected: true,
    jwt_token: jwt_token,
    payload: payload
  })
})

const core_update_form = (async (jwt_token, payload) => {
  return await core_make_patch_request({
    main_endpoint: process.env.ROUTE_OF_CORE_FOR_FORM,
    suffix_endpoint: "/" + payload.id,
    is_protected: true,
    jwt_token: jwt_token,
    payload: payload
  })
})

const core_add_field = (async (jwt_token, payload) => {
  return await core_make_patch_request({
    main_endpoint: process.env.ROUTE_OF_CORE_FOR_FORM,
    suffix_endpoint: "/add-field/" + payload.formId,
    is_protected: true,
    jwt_token: jwt_token,
    payload: payload
  })
})

const core_update_fields = (async (jwt_token, formId, payload) => {
  return await core_make_patch_request({
    main_endpoint: process.env.ROUTE_OF_CORE_FOR_FORM,
    suffix_endpoint: "/update-fields/" + formId,
    is_protected: true,
    jwt_token: jwt_token,
    payload: payload
  })
})

const core_store_data = (async (jwt_token, payload) => {
  return await core_make_post_request({
    main_endpoint: process.env.ROUTE_OF_CORE_FOR_STORE,
    suffix_endpoint: "",
    is_protected: true,
    jwt_token: jwt_token,
    payload: payload
  })
})

const core_find_me = (async (jwt_token) => {
  return await core_make_get_request({
    main_endpoint: process.env.ROUTE_OF_CORE_FOR_USER,
    suffix_endpoint: "/me",
    is_protected: true,
    jwt_token: jwt_token
  })
})

const core_list_kpi = (async (jwt_token) => {
  return await core_make_get_request({
    main_endpoint: process.env.ROUTE_OF_CORE_FOR_KPI + "/result",
    suffix_endpoint: "",
    is_protected: true,
    jwt_token: jwt_token
  })
})

const core_fill_kpi = (async (jwt_token, payload) => {
  return await core_make_patch_request({
    main_endpoint: process.env.ROUTE_OF_CORE_FOR_PROJECT,
    suffix_endpoint: "/fill-kpi/" + payload.projectId,
    is_protected: true,
    jwt_token: jwt_token,
    payload: payload
  })
})

const core_get_kpi_data = (async (jwt_token, payload) => {
  return await core_make_get_request({
    main_endpoint: process.env.ROUTE_OF_CORE_FOR_KPI,
    suffix_endpoint: "/data/" + payload.projectId,
    is_protected: true,
    jwt_token: jwt_token
  })
})

const core_list_session = (async (jwt_token, payload) => {
  return await core_make_get_request({
    main_endpoint: process.env.ROUTE_OF_CORE_FOR_STORE,
    suffix_endpoint: "/list-session/" + payload.formUuid,
    is_protected: true,
    jwt_token: jwt_token
  })
})

const core_show_session = (async (jwt_token, payload) => {
  return await core_make_get_request({
    main_endpoint: process.env.ROUTE_OF_CORE_FOR_STORE,
    suffix_endpoint: "/show-session/" + payload.formUuid + "/" + payload.sessionUuid,
    is_protected: true,
    jwt_token: jwt_token
  })
})


module.exports = {
  control_service_data,
  verify_jwt_token,
  core_signin,
  core_change_password,

  core_make_get_request,
  core_make_post_request,
  core_make_patch_request,
  core_make_delete_request,

  core_list_field_type,
  core_list_project,
  core_find_project,
  core_edit_project,
  core_find_form,
  core_add_form,
  core_update_form,
  core_add_field,
  core_update_fields,

  core_store_data,
  core_list_session,
  core_show_session,

  core_find_me,
  core_list_kpi,
  core_fill_kpi,

  core_get_kpi_data
}