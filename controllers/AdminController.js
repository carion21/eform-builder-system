const express = require('express');
const router = express.Router();

const service = 'admin'

// routers
const index = require('../routes/' + service + '/index')
const create = require('../routes/' + service + '/create')
const edit = require('../routes/' + service + '/edit')
const view = require('../routes/' + service + '/view')

// routes with each router
router.use('/', index)
router.use('/create', create)
router.use('/edit', edit)
router.use('/view', view)

module.exports = router;