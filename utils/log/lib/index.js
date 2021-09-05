'use strict';

const log = require('npmlog')

function index() {
    log.info('test', 'tesifo')
}


log.level = process.env.LOG_LEVEL || 'info'


log.heading = 'lhj'
log.headingStyle = {
    fg: 'white',
    bg: 'red'
}
log.addLevel('success', 2000, {fg: 'green', bold: true})


module.exports = log
