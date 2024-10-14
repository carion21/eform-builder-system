const express = require('express');
const router = express.Router();

const service = 'supervisor'

// routers
const index = require('../routes/' + service + '/index')
const fillkpi = require('../routes/' + service + '/fillkpi')

// routes with each router
router.use('/', index)
router.use('/fillkpi', fillkpi)


module.exports = router;