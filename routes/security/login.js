const express = require('express');
const axios = require('axios');

const { getMoment, getDirectusUrl, getRouteDeBase, getCoreUrl } = require('../../config/utils');
const { APP_NAME, APP_VERSION, APP_DESCRIPTION, DEFAULT_ROUTE_BUILD, DEFAULT_PROFILE_SUPERVISOR, DEFAULT_PROFILE_SAMPLER, DEFAULT_ROUTE_STORE, DEFAULT_PROFILE_ADMIN } = require('../../config/consts');
const { control_service_data, core_signin, verify_jwt_token } = require('../../config/global_functions');
const router = express.Router();

const SERVICE_TYPE = "security_login"

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
      "security/login", {
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
      "security/login", {
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
      let r_core_user = await core_signin(body)

      if (r_core_user.success) {
        const user_data = r_core_user.data.data.user
        const profile_value = user_data.profile.value

        if (
          [
            DEFAULT_PROFILE_ADMIN,
            DEFAULT_PROFILE_SUPERVISOR,
            DEFAULT_PROFILE_SAMPLER
          ].includes(profile_value)
        ) {
          let route = '/' + profile_value
          console.log("Redirecting to: " + route);

          req.session.user_data = r_core_user.data.data.user
          req.session.jwt_token = r_core_user.data.data.jwt

          res.redirect(route)
        }

        else {
          error = "Votre profil n'est pas autorisé à accéder à l'application"
        }
      } else {
        error = r_core_user.message
      }

    } else {
      error = bcontrol.message
    }

    if (error) {
      console.log('rbody', body);

      res.render(
        "security/login", {
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
    let r_core_user = await core_signin(body)

    if (r_core_user.success) {
      const user_data = r_core_user.data.data.user
      const profile_value = user_data.profile.value

      if (
        [
          DEFAULT_PROFILE_ADMIN,
          DEFAULT_PROFILE_SUPERVISOR,
          DEFAULT_PROFILE_SAMPLER
        ].includes(profile_value)
      ) {
        let route = '/' + profile_value
        console.log("Redirecting to: " + route);

        req.session.user_data = r_core_user.data.data.user
        req.session.jwt_token = r_core_user.data.data.jwt

        res.redirect(route)
      }

      else {
        error = "Votre profil n'est pas autorisé à accéder à l'application"
      }
    } else {
      error = r_core_user.message
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