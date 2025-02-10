const express = require('express');
const axios = require('axios');

const { getMoment, getDirectusUrl, getRouteDeBase, getCoreUrl } = require('../../config/utils');
const { APP_NAME, APP_VERSION, APP_DESCRIPTION, DEFAULT_ROUTE_BUILD, DEFAULT_PROFILE_SUPERVISOR, DEFAULT_PROFILE_SAMPLER, DEFAULT_ROUTE_STORE, DEFAULT_PROFILE_ADMIN } = require('../../config/consts');
const { control_service_data, core_signin, verify_jwt_token, core_change_password } = require('../../config/global_functions');
const router = express.Router();

const SERVICE_TYPE = "security_change_password"

const urlapi = getCoreUrl();
const moment = getMoment();
const service = "security"

router.get('/:jwt_token', async function (req, res, next) {
  if (req.session.user_data) {
    let route = DEFAULT_ROUTE_BUILD
    res.redirect(route)
  } else {
    let jwt_token = req.params.jwt_token

    let user_data = null

    let r_jwt = verify_jwt_token(jwt_token)
    if (r_jwt.success) {
      user_data = r_jwt.data
      user_data.jwt_token = jwt_token
    }


    res.render(
      "security/change-password", {
      appName: APP_NAME,
      appVersion: APP_VERSION,
      appDescription: APP_DESCRIPTION,
      service: service,
      user_data: user_data,
    })
  }

});

router.get('/', async function (req, res, next) {
  if (req.session.user_data) {
    profile_value = req.session.user_data.profile.value
    let route = '/' + profile_value
    res.redirect(route)
  } else {
    res.render(
      "security/change-password", {
      appName: APP_NAME,
      appVersion: APP_VERSION,
      appDescription: APP_DESCRIPTION,
      service: service
    })
  }
});

router.post('/:jwt_token', async function (req, res, next) {
  let jwt_token = req.params.jwt_token

  let user_data = null

  let r_jwt = verify_jwt_token(jwt_token)
  if (r_jwt.success) {
    user_data = r_jwt.data
    user_data.jwt_token = jwt_token

    let error = ""

    let body = req.body
    body.email = user_data.email

    let bcontrol = control_service_data(SERVICE_TYPE, body)

    if (bcontrol.success) {

      if (body.newpassword == body.cnfpassword) {
        let r_core_user = await core_change_password(jwt_token, {
          oldPassword: body.oldpassword,
          newPassword: body.newpassword,
        })

        if (r_core_user.success) {
          res.redirect("/security/login/" + jwt_token)
        } else {
          error = r_core_user.message
        }

      } else {
        error = "Les mots de passe ne correspondent pas"
      }

    } else {
      error = bcontrol.message
    }

    if (error) {

      res.render(
        "security/change-password", {
        appName: APP_NAME,
        appVersion: APP_VERSION,
        appDescription: APP_DESCRIPTION,
        service: service,
        user_data: user_data,
        rbody: body,
        error: error
      })
    }
  } else {
    res.redirect("/security/login")
  }

});

router.post('/', async function (req, res, next) {
  let body = req.body
  let bcontrol = control_service_data(SERVICE_TYPE, body)

  let error = ""

  if (bcontrol.success) {

    if (body.newpassword == body.cnfpassword) {
      let r_core_user = await core_change_password(jwt_token, {
        oldPassword: body.oldpassword,
        newPassword: body.newpassword,
      })

      if (r_core_user.success) {
        res.redirect("/security/login")
      } else {
        error = r_core_user.message
      }

    } else {
      error = "Les mots de passe ne correspondent pas"
    }

  } else {
    error = bcontrol.message
  }

  if (error) {
    res.render(
      "security/login", {
      appName: APP_NAME,
      appVersion: APP_VERSION,
      appDescription: APP_DESCRIPTION,
      service: service,
      rbody: body,
      error: error
    })
  }
});

module.exports = router;