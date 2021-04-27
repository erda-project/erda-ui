const path = require('path')
const process = require('process')
const fs = require('fs')

function Stack(pathname) {
  let curPath = pathname
  let dirArr = []
  while (curPath !== '/' ) {
    dirArr.push(curPath)
    curPath = path.resolve(curPath, '..')
  }
  this._stack = new Array(...(dirArr.reverse()));
}
Stack.prototype = {
  top: function () {
      return this._stack .slice(-1)[0]
  }
}

function getParent(pathname) {
  return path.parse(pathname).dir
}

function getModuleLocation(pathStack, pathname) {
  var parent = pathStack.top()
  let brokeIt = false 
  while (!brokeIt) {
    try {
      fs.lstatSync(path.resolve(parent, 'node_modules', pathname))
      brokeIt = true
      pathname = path.resolve(parent, 'node_modules', pathname)
      return pathname
    } catch {
      parent = getParent(parent)
      if (!parent) {
        brokeIt = true
          return -1
      }
    }
  }
}

const getPath = (pathname) => {
  var entry = path.resolve(process.cwd(), process.argv[1])
  var pathStack = new Stack(getParent(entry))
  var targetModule = getModuleLocation(pathStack, pathname)

  if (-1 === targetModule) {
    throw new Error('文件夹或文件' + pathname + '未找到')
  }
  return targetModule

}

module.exports = {
  getPath
}
