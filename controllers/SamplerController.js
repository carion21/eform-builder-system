const express = require('express');
const router = express.Router();

const service = 'sampler'

// routers
const index = require('../routes/' + service + '/index')
const store = require('../routes/' + service + '/store')
const list_session = require('../routes/' + service + '/list_session')
const show_session = require('../routes/' + service + '/show_session')

// routes with each router
router.use('/', index)
router.use('/store', store)
router.use('/list_session', list_session)
router.use('/show_session', show_session)


module.exports = router;