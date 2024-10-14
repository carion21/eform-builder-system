const express = require('express');
const router = express.Router();

const service = 'sampler'

// routers
const index = require('../routes/' + service + '/index')
const store = require('../routes/' + service + '/store')

// routes with each router
router.use('/', index)
router.use('/store', store)


module.exports = router;