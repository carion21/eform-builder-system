const express = require('express');
const router = express.Router();

const service = 'security'

// routers
const index = require('../routes/' + service + '/index')

const login = require('../routes/' + service + '/login')
const change_password = require('../routes/' + service + '/change-password')
const logout = require('../routes/' + service + '/logout')


// routes with each router
router.use('/', index)

router.use('/login', login)
router.use('/change-password', change_password)
router.use('/logout', logout)


module.exports = router;
