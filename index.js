#!/usr/bin/env node

const fs = require('fs-extra')
const glob = require('glob')
const debug = require('debug')
const program = require('commander')

program
  .version('0.0.1')
  .usage('[options]')
  .option('-p, --path <p>', 'path')
  .option('-o, --output <p>', 'output')
  .option('-e, --exclude <p>', 'exclude')
  .parse(process.argv);

var exclude = program.exclude &&
  program.exclude.split(',').map(folder => { return folder + '/**' })

var srcPath = program.path ? program.path + '/' : ''

glob(srcPath + '**/*.js', { ignore: exclude }, (err, files) => {
  files.forEach(filename => {
    var inFilename = filename
    var outFilename = ''

    checkPath(filename)
      .then(filename => {
        outFilename = filename
        return checkLicense(inFilename)
      })
      .then(data => {
        return updateLicense(outFilename, data)
      })
      .then((filename) => {
        debug.log('src: ' + inFilename + ' out:' + outFilename)
      })
      .catch(err => {
        debug.log('error: ', err)
      })
  })
})

const checkPath = (filename) => {
  var output = program.output || ''
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

const updateLicense = (filename, data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(filename, ('/* sssyyy */' + data).toString(), 'utf8', err => {
      if (err) {
        reject(err)
      } else {
        resolve(filename)
      }
    })
  })
}
