const express = require('express');

const { getAppName, getMoment, isInteger } = require('../../config/utils');
const { APP_NAME, APP_VERSION, APP_DESCRIPTION } = require('../../config/consts');
const { core_find_me, core_list_kpi, core_find_project, core_fill_kpi, core_get_kpi_data } = require('../../config/global_functions');
const { parse } = require('dotenv');

const router = express.Router();

const moment = getMoment();
const service = "supervisor"


router.get('/:projectId', async function (req, res, next) {
  const projectId = req.params.projectId

  if (isInteger(parseInt(projectId))) {
    let project = {}

    let r_core_project = await core_find_project(req.session.jwt_token, projectId)

    if (r_core_project.success) {
      project = r_core_project.data

      let kpis = []

      let r_core_kpis = await core_list_kpi(req.session.jwt_token)
      if (r_core_kpis.success) {
        kpis = r_core_kpis.data
      }

      let kpiDatas = {}

      let r_core_get_kpi_data = await core_get_kpi_data(req.session.jwt_token, {
        projectId: parseInt(projectId)
      })
      if (r_core_get_kpi_data.success) {
        kpiDatas = r_core_get_kpi_data.data
      }

      res.render(
        "supervisor/fillkpi", {
        appName: APP_NAME,
        appVersion: APP_VERSION,
        appDescription: APP_DESCRIPTION,
        service: service,
        user_data: req.session.user_data,
        project: project,
        kpis: kpis,
        kpiDatas: kpiDatas
      })
    } else {
      console.log("Error while retrieving project: " + r_core_project.message)
      // return 404 error
      res.render('security/notfound', {
        appName: APP_NAME,
        appVersion: APP_VERSION,
        appDescription: APP_DESCRIPTION
      })
    }

  } else {
    // return 404 error
    res.render('security/notfound', {
      appName: APP_NAME,
      appVersion: APP_VERSION,
      appDescription: APP_DESCRIPTION
    })
  }

});


router.post('/:projectId', async function (req, res, next) {
  const projectId = req.params.projectId

  if (isInteger(parseInt(projectId))) {
    let project = {}

    let r_core_project = await core_find_project(req.session.jwt_token, projectId)

    if (r_core_project.success) {
      project = r_core_project.data

      let kpis = []

      let r_core_kpis = await core_list_kpi(req.session.jwt_token)
      if (r_core_kpis.success) {
        kpis = r_core_kpis.data
      }

      let kpiDatas = {}

      let r_core_get_kpi_data = await core_get_kpi_data(req.session.jwt_token, {
        projectId: parseInt(projectId)
      })
      if (r_core_get_kpi_data.success) {
        kpiDatas = r_core_get_kpi_data.data
      }

      let body = req.body

      let error = ""

      let kpi_data = {
        projectId: parseInt(projectId),
        kpiDatas: {}
      }
      for (let key of Object.keys(body)) {
        kpi_data.kpiDatas[key] = parseInt(body[key])
      }

      let r_core_fill_kpi = await core_fill_kpi(req.session.jwt_token, kpi_data)

      if (r_core_fill_kpi.success) {
        res.render(
          "supervisor/fillkpi", {
          appName: APP_NAME,
          appVersion: APP_VERSION,
          appDescription: APP_DESCRIPTION,
          service: service,
          user_data: req.session.user_data,
          project: project,
          kpis: kpis,
          kpiDatas: kpiDatas,
          message: "Les KPIs ont été enregistrés avec succès."
        })
      } else {
        error = r_core_fill_kpi.message
      }

      if (error) {
        res.render(
          "supervisor/fillkpi", {
          appName: APP_NAME,
          appVersion: APP_VERSION,
          appDescription: APP_DESCRIPTION,
          service: service,
          user_data: req.session.user_data,
          project: project,
          kpis: kpis,
          kpiDatas: kpiDatas,
          rbody: body,
          error: error
        })
      }

    } else {
      console.log("Error while retrieving project: " + r_core_project.message)
      // return 404 error
      res.render('security/notfound', {
        appName: APP_NAME,
        appVersion: APP_VERSION,
        appDescription: APP_DESCRIPTION
      })
    }

  } else {
    // return 404 error
    res.render('security/notfound', {
      appName: APP_NAME,
      appVersion: APP_VERSION,
      appDescription: APP_DESCRIPTION
    })
  }

});


module.exports = router;