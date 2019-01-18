// 页面切换效果

// 获取URL参数
function getQueryString(newUrlParam, name) { 
  var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i")
  var r = newUrlParam.match(reg)
  if (r != null) return unescape(r[2])
  return null; 
}

// 无特效翻页
function dispalyEffect (oldDom, newDom) {
  if (oldDom) {
    // 隐藏掉旧的节点
    oldDom.style.display = 'none'
  }
  // 查找页面跳转后的page
  newDom.style.display = 'block'
}

function switchPage (oldUrlParam, newUrlParam) {
  var oldPage = oldUrlParam
  var newPage = newUrlParam
  let newPagParamList = newPage.split('&')
  if (newPage) newPage = newPagParamList[0]
  // 查找页面跳转前的page页(dom节点)
  // console.log(oldUrlParam)
  // 如果源地址获取不到 那么一般是因为源页面为首页
  if (oldPage === undefined) {
    oldPage = globalConfig.entry
  } else {
    oldPage = oldPage.split('&')[0]
  }
  var oldDom = document.getElementById('ox-' + oldPage)
  var newDom = document.getElementById('ox-' + newPage)
  if (!newDom) {
    console.error('页面不存在!')
    return
  }
  // 判断是否有动画效果
  if (newPagParamList.length > 1) {
    var animationIn = getQueryString(newUrlParam, 'in')
    var animationOut = getQueryString(newUrlParam, 'out')
    // 如果没用动画参数则使用默认效果
    if (!animationIn || !animationOut) {
      dispalyEffect(oldDom, newDom)
      return
    }
    oldDom.style.position = 'absolute'

    newDom.style.display = 'block'
    newDom.style.position = 'absolute'
    // document.body.style.overflow = 'hidden'
    animationIn.split(',').forEach(value => {
      oldDom.classList.add('ox-page-' + value)
    })
    animationOut.split(',').forEach(value => {
      newDom.classList.add('ox-page-' + value)
    })
    oldDom.addEventListener("animationend", function() {
      // 隐藏掉旧的节点
      oldDom.style.display = 'none'
      // oldDom.style.position = ''
      // 清除临时设置的class
      animationIn.split(',').forEach(value => {
        oldDom.classList.remove('ox-page-' + value)
      })
    })
    newDom.addEventListener("animationend", function() {
      // 清除临时设置的style
      // newDom.style.position = ''
      animationOut.split(',').forEach(value => {
        newDom.classList.remove('ox-page-' + value)
      })
    })
  } else {
    dispalyEffect(oldDom, newDom)
  }
  
  window.ozzx.activePage = newPage
  runPageFunction(newPage, newDom)
}