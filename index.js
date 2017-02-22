#!/usr/bin/env node

'use strict'

const fs = require('fs-extra')
const glob = require('glob')
const debug = require('debug')
const program = require('commander')
const chalk = require('chalk')

program
  .version('0.0.1')
  .usage('[options]')
  .option('-p, --path <p>', 'path')
  .option('-o, --output <p>', 'output')
  .option('-t, --template <p>', 'template')
  .option('-i, --ignore <p>', 'ingnore')
  .parse(process.argv);

const ignoreList = program.ignore &&
  program.ignore.split(',').map(folder => { return folder + '/**' })

let srcPath = program.path ? program.path + '/' : ''

let templateFile = program.template

let template

try {
  template = fs.readFileSync(templateFile, 'utf8')
}
catch (err) {
  debug.log(chalk.red('could not find ', templateFile))
  return 1
}

glob(srcPath + '**/*.js', { ignore: ignoreList }, (err, files) => {
  files.forEach(filename => {
    var inFilename = filename
    var outFilename = ''

    checkPath(filename)
      .then(filename => {
        outFilename = filename
        return checkLicense(inFilename)
      })
      .then(data => {
        return updateLicense(outFilename, template, data)
      })
      .then((filename) => {
        debug.log(chalk.green('src: ' + inFilename + ' out:' + outFilename))
      })
      .catch(err => {
        debug.log(chalk.red('error: ', err))
      })
  })

})

const checkPath = (filename) => {
  let output = program.output || ''
  if (output) {
    output = output + '/'
  }
  output += filename

  return new Promise((resolve, reject) => {
    fs.ensureFile(output, err => {
      if (err) {
        reject(err)
      } else {
        resolve(output)
      }
    })
  })
}

const checkLicense = (filename) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filename, 'utf8', (err, data) => {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })
}

const updateLicense = (filename, template, data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(filename, (template + data).toString(), 'utf8', err => {
      if (err) {
        reject(err)
      } else {
        resolve(filename)
      }
    })
  })
}
