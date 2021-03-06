let storage = {
  clear: function () {
    this.watcherFile = {}
    this.animationList = []
    this.animateList = new Set()
    this.pageAnimationList = new Set()
    this.plugList = new Set()
    this.fileCache = {}
    this.resource = []
  },
  resource: [],
  // 需要监控的目录
  watcherFile: {},
  // 使用到的效果列表
  animationList: [],
  // 动画列表
  animateList: new Set(),
  // 页面切换代码
  pageAnimationList: new Set(),
  // 插件列表
  plugList: new Set(),
  // 文件缓存
  fileCache: {}
}

export default storage