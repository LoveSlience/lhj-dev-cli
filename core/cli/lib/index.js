'use strict';
const path = require('path')
const semver = require('semver')
const colors = require('colors/safe')
const userHome = require('user-home')
const pathExists = require('path-exists').sync
const pkg = require('../package.json')
const log = require('@lhj-cli-dev/log')
const { getNpmSemverVersion } = require('@lhj-cli-dev/get-npm-info')

const { LOWEST_NODE_VERSION, DEFAULT_CLI_HOME } = require('./const')

let args

async function core() {
    try {
        checkPakgVersion()
        checkNodeVersion()
        checkRoot()
        checkUserHome()
        checkInputArgs()
        checktEnv()
       await checkoGolbalUpdate()
        log.verbose('debug', 'test debug log')
    } catch (error) {
        log.error(error.message) 
    }
}

function checkPakgVersion(){
  log.notice('cli', pkg.version)
}

function checkNodeVersion() {
    //第一步： 获取当前node版本
    //第二步： duibi
    const currentVersion = process.version

    if(!semver.gte(currentVersion, LOWEST_NODE_VERSION)) {
       throw new Error(colors.red(`lhj-dev-cli 需要安装 v${LOWEST_NODE_VERSION} 以上版本的node.js`))
    }

}

function checkRoot() {
    const rootCheck = require('root-check')
    rootCheck();
}

function checkUserHome() {
    if(!userHome || !pathExists(userHome)) {
        throw new Error(colors.red('当前登录用户主目录不存在'))
    }
}


function checkInputArgs() {
    const minimist = require('minimist')
    args = minimist(process.argv.slice(2))
    checkArgs()
}

function checkArgs() {
    if(args.debug) {
      process.env.LOG_LEVEL = 'verbose'  
    }else {
        process.env.LOG_LEVEL = 'info'  
    }
    log.level = process.env.LOG_LEVEL
}


function checktEnv() {
    const dotenv = require('dotenv')
    const dotenvPath =  path.resolve(userHome, '.env')
    if(pathExists(dotenvPath)) {
        config = dotenv.config({path: dotenvPath})
    }
    createDefaultConfig()
    log.verbose('环境变量', process.env.CLI_HOME_PATH)
}

function createDefaultConfig() {
    const cliConfig = {
        home: userHome
    }
    if(process.env.CLI_HOME) {
        cliConfig['cliHome'] = path.join(userHome, process.env.CLI_HOME)
    } else {
        cliConfig['cliHome'] = path.join(userHome, DEFAULT_CLI_HOME)
    }

    process.env.CLI_HOME_PATH = cliConfig.cliHome
}

async function checkoGolbalUpdate() {
    const currentVersion = pkg.version
    const npmName = pkg.name
    const lastVersion = await getNpmSemverVersion(currentVersion ,npmName)
    if(lastVersion && semver.gt(lastVersion, currentVersion)) {
        log.warn('更新提示', colors.yellow(`请手动更新 ${npmName}, 当前版本为${currentVersion}, 最新版本为${lastVersion}
        更新命令为 npm install -g ${npmName}
        `))
    }
}

module.exports = core;
