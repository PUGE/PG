// Thu Jan 09 2020 22:57:42 GMT+0800 (GMT+08:00)
var owo = {tool: {},state: {},};
/* 方法合集 */
var _owo = {}

/* 运行页面初始化方法 */
_owo.runCreated = function (pageFunction) {
  try {
    // console.log(pageFunction)
    if (pageFunction.show) {
      pageFunction.show.apply(pageFunction)
    }
    if (pageFunction["_isCreated"]) return

    // 确保created事件只被执行一次
    pageFunction._isCreated = true
    
    if (pageFunction.created) {
      pageFunction.created.apply(pageFunction)
    }
    
  } catch (e) {
    console.error(e)
  }
}




// 判断是否为手机
_owo.isMobi = navigator.userAgent.toLowerCase().match(/(ipod|ipad|iphone|android|coolpad|mmp|smartphone|midp|wap|xoom|symbian|j2me|blackberry|wince)/i) != null


_owo._run = function (eventFor, event, newPageFunction) {
  // 复制eventFor防止污染
  var eventForCopy = eventFor
  // 待优化可以单独提出来
  // 取出参数
  var parameterArr = []
  var parameterList = eventForCopy.match(/[^\(\)]+(?=\))/g)
  
  if (parameterList && parameterList.length > 0) {
    // 参数列表
    parameterArr = parameterList[0].split(',')
    // 进一步处理参数
    
    for (var i = 0; i < parameterArr.length; i++) {
      var parameterValue = parameterArr[i].replace(/(^\s*)|(\s*$)/g, "")
      // console.log(parameterValue)
      // 判断参数是否为一个字符串
      
      if (parameterValue.charAt(0) === '"' && parameterValue.charAt(parameterValue.length - 1) === '"') {
        parameterArr[i] = parameterValue.substring(1, parameterValue.length - 1)
      }
      if (parameterValue.charAt(0) === "'" && parameterValue.charAt(parameterValue.length - 1) === "'") {
        parameterArr[i] = parameterValue.substring(1, parameterValue.length - 1)
      }
      // console.log(parameterArr[i])
    }
  }
  eventForCopy = eventFor.replace(/\([\d\D]*\)/, '')
  // console.log(newPageFunction, eventForCopy)
  // 如果有方法,则运行它
  if (newPageFunction && newPageFunction[eventForCopy]) {
    // 绑定window.owo对象
    newPageFunction.$event = event
    newPageFunction.$target = event.target
    newPageFunction[eventForCopy].apply(newPageFunction, parameterArr)
  } else {
    (function (temp) {
      try {return eval(temp)} catch (error) {return undefined}
    }).apply(newPageFunction, [eventFor])
  }
}

_owo.bindEvent = function (eventName, eventFor, tempDom, moudleScript) {
  tempDom['on' + eventName] = function(event) {
    _owo._run(eventFor, event || this, moudleScript)
  }
}

/* owo事件处理 */
// 参数1: 当前正在处理的dom节点
// 参数2: 当前正在处理的模块名称
_owo.handleEvent = function (moudleScript) {
  if (!moudleScript.$el) throw 'error'
  var tempDom = moudleScript.$el
  // 递归处理元素属性
  function recursion(tempDom) {
    if (tempDom.attributes) {
      for (var ind = 0; ind < tempDom.attributes.length; ind++) {
        var attribute = tempDom.attributes[ind]
        // ie不支持startsWith
        var eventFor = attribute.textContent || attribute.value
        // 判断是否为owo的事件
        if (new RegExp("^o-").test(attribute.name)) {
          var eventName = attribute.name.slice(2)
          switch (eventName) {
            case 'tap': {
              // 待优化 可合并
              // 根据手机和PC做不同处理
              if (_owo.isMobi) {
                if (!_owo._event_tap) {console.error('找不到_event_tap方法！'); break;}
                _owo._event_tap(tempDom, eventFor, function (event, eventFor) {
                  _owo._run(eventFor, event || this, moudleScript)
                })
              } else _owo.bindEvent('click', eventFor, tempDom, moudleScript)
              break
            }
            case 'show': {
              var eventFor = attribute.textContent || attribute.value
              // 初步先简单处理吧
              var temp = eventFor.replace(/ /g, '')
              function tempRun (temp) {
                return eval(temp)
              }
              if (tempRun.apply(moudleScript, [temp])) {
                tempDom.style.display = ''
              } else {
                tempDom.style.display = 'none'
              }
              break
            }
            case 'html': {
              var temp = eventFor.replace(/ /g, '')
              tempDom.innerHTML = (function (temp) {
                try {
                  return eval(temp)
                } catch (error) {
                  return undefined
                }
              }).apply(moudleScript, [temp])
              break
            }
            default: {
              _owo.bindEvent(eventName, eventFor, tempDom, moudleScript)
            }
          }
        } else if (attribute.name == 'view') {
          viewName = eventFor
        } else if (attribute.name == 'route') {
          routeName = eventFor
        }
      }
    }
    // 判断是否有子节点需要处理
    if (tempDom.children) {
      // 递归处理所有子Dom结点
      for (var i = 0; i < tempDom.children.length; i++) {
        // 获取子节点实例
        var childrenDom = tempDom.children[i]
        if (!childrenDom.hasAttribute('template')) {
          recursion(childrenDom)
        }
      }
    } else {
      console.info('元素不存在子节点!')
      console.info(tempDom)
    }
  }
  recursion(moudleScript.$el)
  // 递归处理子模板
  for (var key in moudleScript.template) {
    moudleScript.template[key].$el = tempDom.querySelector('[template=' + key + ']')
    _owo.handleEvent(moudleScript.template[key])
  }
}

// 快速选择器
owo.query = function (str) {
  return document.querySelectorAll('.owo[template=' + owo.activePage +'] ' + str)
}

/* 运行页面所属的方法 */
_owo.handlePage = function (newPageFunction, entryDom) {
  /* 判断页面是否有自己的方法 */
  if (!newPageFunction) return
  // console.log(entryDom)
  newPageFunction['$el'] = entryDom
  // console.log(newPageFunction)
  _owo.runCreated(newPageFunction)
  // debugger
  // 判断页面是否有下属模板,如果有运行所有模板的初始化方法
  for (var key in newPageFunction.template) {
    var templateScript = newPageFunction.template[key]
    
    templateScript.$el = entryDom.querySelector('[template="' + key +'"]')
    _owo.runCreated(templateScript)
  }

  owo.state.urlVariable = _owo.getQueryVariable()
  // 判断页面中是否有路由
  if (newPageFunction.view) {
    for (var viewName in newPageFunction.view) {
      var routeList = newPageFunction.view[viewName]
      // 标识是否没有指定显示哪个路由
      var activeRouteIndex = 0
      var urlViewName = owo.state.urlVariable['view-' + viewName]
      for (var routeInd in routeList) {
        var routeItem = routeList[routeInd]
        routeList[routeInd].$el = entryDom.querySelector('[view="' + viewName +'"] [route="' + routeItem._name +'"]')
        // 错误处理
        if (!routeList[routeInd].$el) {
          console.error('找不到视窗 ' + viewName + ' 中的路由: ' + routeItem._name)
          break
        }
        routeList[routeInd].$el.setAttribute('route-ind', routeInd)
        // console.log(urlViewName, )
        if (urlViewName && urlViewName == routeItem._name) {
          activeRouteIndex = routeInd
        }
      }
      // 激活对应路由
      _owo.showViewIndex(routeList, activeRouteIndex)
      _owo.handlePage(routeList[activeRouteIndex], routeList[activeRouteIndex].$el)
    }
  }
}

_owo.showViewIndex = function (routeList, ind) {
  for (var routeIndex = 0; routeIndex < routeList.length; routeIndex++) {
    var element = routeList[routeIndex];
    if (routeIndex == ind) {
      element.$el.style.display = 'block'
      element.$el.classList.add('route-active')
    } else {
      element.$el.style.display = 'none'
      element.$el.classList.remove('route-active')
    }
  }
}

_owo.showViewName = function (routeList, name) {
  for (var routeIndex = 0; routeIndex < routeList.length; routeIndex++) {
    var element = routeList[routeIndex];
    if (element._name == name) {
      element.$el.style.display = 'block'
      element.$el.classList.add('route-active')
    } else {
      element.$el.style.display = 'none'
      element.$el.classList.remove('route-active')
    }
  }
}

// 获取URL中的参数
_owo.getQueryVariable = function () {
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  var temp = {}
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split("=");
    temp[pair[0]] = pair[1];
  }
  return temp;
}
/*
 * 传递函数给whenReady()
 * 当文档解析完毕且为操作准备就绪时，函数作为document的方法调用
 */
_owo.ready = (function() {               //这个函数返回whenReady()函数
  var funcs = [];             //当获得事件时，要运行的函数
  
  //当文档就绪时,调用事件处理程序
  function handler(e) {
    //如果发生onreadystatechange事件，但其状态不是complete的话,那么文档尚未准备好
    if(e.type === 'onreadystatechange' && document.readyState !== 'complete') {
      return
    }
    // 确保事件处理程序只运行一次
    if(window.owo.state.isRrady) return
    window.owo.state.isRrady = true
    
    // 运行所有注册函数
    for(var i=0; i<funcs.length; i++) {
      funcs[i].call(document);
    }
    funcs = null;
  }
  //为接收到的任何事件注册处理程序
  if (document.addEventListener) {
    document.addEventListener('DOMContentLoaded', handler, false)
    document.addEventListener('readystatechange', handler, false)            //IE9+
    window.addEventListener('load', handler, false)
  } else if(document.attachEvent) {
    document.attachEvent('onreadystatechange', handler)
    window.attachEvent('onload', handler)
  }
  //返回whenReady()函数
  return function whenReady (fn) {
    if (window.owo.state.isRrady) {
      fn.call(document)
    } else {
      funcs.push(fn)
    }
  }
})()

// 单页面-页面资源加载完毕事件
_owo.showPage = function() {
  // 查找入口
  var entryDom = document.querySelector('[template]')
  if (entryDom) {
    owo.entry = entryDom.getAttribute('template')
    owo.activePage = owo.entry
    _owo.handlePage(window.owo.script[owo.activePage], entryDom)
    _owo.handleEvent(window.owo.script[owo.activePage])
  } else {
    console.error('找不到页面入口!')
  }
  // 路由列表
  var viewList = entryDom.querySelectorAll('[view]')
  // 获取url参数
  owo.state.urlVariable = _owo.getQueryVariable()
  for (var index = 0; index < viewList.length; index++) {
    var viewItem = viewList[index];
    var viewName = viewItem.getAttribute('view')
    var viewValue = owo.state.urlVariable['view-' + viewName]
    if (viewValue) {
      _owo.showViewName(viewItem, viewValue)
    } else {
      _owo.showViewIndex(viewItem, 0)
    }
  }
}

// 执行页面加载完毕方法
_owo.ready(_owo.showPage)

_owo._event_tap = function (tempDom, eventFor, callBack) {
  // 变量
  var startTime = 0
  var isMove = false
  tempDom.addEventListener('touchstart', function() {
    startTime = Date.now();
  })
  tempDom.addEventListener('touchmove', function() {
    isMove = true
  })
  tempDom.addEventListener('touchend', function(e) {
    if (Date.now() - startTime < 300 && !isMove) {
      callBack(e, eventFor)
    }
    // 清零
    startTime = 0;
    isMove = false
  })
}
/**
 * 改变数据
 * @return {object} 屏幕信息
 */

_owo.getValueFromScript = function (arr, data) {
  var returnData = data
  for (let index = 0; index < arr.length; index++) {
    const element = arr[index];
    if (returnData[element] !== undefined) {
      returnData = returnData[element]
    } else {
      return undefined
    }
  }
  return returnData
}

owo.tool.change = function (environment, obj) {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      environment.data[key] = value
    }
  }
  
  var showList = environment.$el.querySelectorAll('[o-show]')
  for (var ind = 0; ind < showList.length; ind++) {
    var showDom = showList[ind]
    var temp = showDom.getAttribute('o-show').replace(/ /g, '')
    function tempRun (temp) {
      return eval(temp)
    }
    if (tempRun.apply(environment, [temp])) {
      showDom.style.display = ''
    } else {
      showDom.style.display = 'none'
    }
  }
  var valueList = environment.$el.querySelectorAll('[o-value]')
  for (var ind = 0; ind < valueList.length; ind++) {
    var valueDom = valueList[ind]
    var temp = valueDom.getAttribute('o-value').replace(/ /g, '')
    const value = (function (temp) {
      try {
        return eval(temp)
      } catch (error) {
        return undefined
      }
    }).apply(environment, [temp])
    // console.log(value)
    valueDom.value = value
  }
  for (var key in environment.template) {
    const templateItem = environment.template[key]
    for (var key2 in templateItem.propMap) {
      const propMapItem = templateItem.propMap[key2]
      templateItem.prop[key2] = _owo.getValueFromScript(propMapItem.split('.'), environment)
    }
  }
  var htmlList = environment.$el.querySelectorAll('[o-html]')
  for (var ind = 0; ind < htmlList.length; ind++) {
    var valueDom = htmlList[ind]
    var temp = valueDom.getAttribute('o-html').replace(/ /g, '')
    const value = (function (temp) {
      try {
        return eval(temp)
      } catch (error) {
        return undefined
      }
    }).apply(environment, [temp])
    // console.log(value)
    valueDom.innerHTML = value
  }
  // console.log(environment, key, value)
}

// 事件推送方法
owo.tool.emit = function (eventName) {
  var argumentsList = []
  for (var ind = 1; ind < arguments.length; ind++) {
    argumentsList.push(arguments[ind])
  }
  function recursion(obj) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        var page = obj[key];
        if (page.broadcast && page.broadcast[eventName]) {
          if (!page.$el) page.$el = document.querySelector('[template="' + key + '"]')
          page.broadcast[eventName].apply(page, argumentsList)
        }
        // 判断是否有组件
        if (page.template) {
          recursion(page.template)
        }
        if (page.view) {
          for (var viewKey in page.view) {
            var template = page.view[viewKey];
            recursion(template)
          }
        }
      }
    }
  }

  recursion(owo.script)
}
owo.tool.remind = function (text, time) {
  if (!text) return
  time = time || 6000
  var alertBox = document.createElement('div')
  alertBox.style.cssText = 'position: fixed;top: -40px;transition: top 1s;background-color: red;width: 100%;z-index: 9;text-align: center;line-height: 40px;color: white;font-size: 16px;'
  alertBox.innerHTML = text
  document.body.insertBefore(alertBox, document.body.lastChild)
  setTimeout(function () {
    alertBox.style.top = '0px'
  }, 0)
  setTimeout(function () {
    alertBox.style.top = '-40px'
  }, 6000)
}




// 这是用于代码调试的自动刷新代码，他不应该出现在正式上线版本!
if ("WebSocket" in window) {
  // 打开一个 web socket
  if (!window._owo.ws) window._owo.ws = new WebSocket("ws://" + window.location.host)
  window._owo.ws.onmessage = function (evt) { 
    if (evt.data == 'reload') {
      location.reload()
    }
  }
  window._owo.ws.onclose = function() { 
    console.info('与服务器断开连接')
  }
} else {
  console.error('浏览器不支持WebSocket')
}







function switchPage (oldUrlParam, newUrlParam) {
  var oldPage = oldUrlParam ? oldUrlParam.split('&')[0] : owo.entry
  var newPage = newUrlParam ? newUrlParam.split('&')[0] : owo.entry
  // 查找页面跳转前的page页(dom节点)
  var oldDom = document.querySelector('[template=' + oldPage + ']')
  var newDom = document.querySelector('.owo[template="' + newPage + '"]')
  
  if (!newDom) {
    console.error('页面不存在!')
    return
  }

  if (oldDom) {
    // 隐藏掉旧的节点
    oldDom.style.display = 'none'
  }

  newDom.style.display = 'block'
  // 查找页面跳转后的page
  
  window.owo.activePage = newPage
  // 不可调换位置
  _owo.handlePage(window.owo.script[newPage], newDom)
  _owo.handleEvent(window.owo.script[newPage])
}