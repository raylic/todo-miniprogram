const app = getApp()

Page({
  data: {
    //记录本月一号是周几
    weekday: 5,
    //已经连续完成计划days天
    days: 0,
    //条形图的位置参数
    position: ["102rpx", "208rpx", "314rpx", "420rpx", "526rpx", "632rpx"],
    //高度
    //和条形图的取值比值是 10：1
    situation: ["100rpx", "200rpx", "100rpx", "150rpx", "200rpx", "300rpx"],
    //月份
    time: {
      year: 1970,
      month: 1,
      date: 1
    },
    //当月日期，需要计算
    calender: [
    ],
    //当前界面显示logs的下标
    currentLog: -1,
    //记录本张日历的完成情况,需要从全局获取
    logs:[],
    finish:[],
    //用来区分本月和本月以外的日期,需要计算
    thisMonth: [
    ],
    
    //获取用户信息所要用到的
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  onReady: function() {
    //读取全局数据
    this.setData({
      logs: app.globalData.logs,
      finish: app.globalData.finish,
    });
  },
  onLoad: function () {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse){
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
    this.getCurrentTime();
    this.getCalender();
  },
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  getCurrentTime: function() {
     var date = new Date();
     var y = date.getFullYear();
     var m = date.getMonth() + 1;
     var d = date.getDate();
     this.setData({
       'time.year': y,
       'time.month': m,
       'time.date': d
     })
  },
  //更新calender数组
  //和thisMonth数组
  getCalender: function() {
    //每个月的天数
    var monthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    var d = new Date();
    var y = d.getFullYear();
    var m = d.getMonth();
    var day = app.getFirstDayOfThisMonth();
    var array = new Array(35);
    var ifThisMonth = new Array(35);
    var n = 0;//表示数组下标
    var date = monthDays[(m + 12 - 1) % 12] - day + 1;//表示上一个月的周日的日期
    //闰月
    if(y % 4) montDays[1] ++;

    //前一个月的日期
    while(n < day) {
      ifThisMonth[n] = 0;
      array[n++] = date++; 
    }
    //本月的日期
    for(var i = 1; i <= monthDays[m]; i++){
      ifThisMonth[n] = 1;
      array[n++] = i;
    }
    //下个月的日期
    for(var i = 1; n < 35; n++) {
      ifThisMonth[n] = 0;
      array[n] = i++;
    }
    //更新数组
    this.setData({
      weekday: day,
      calender: array,
      thisMonth: ifThisMonth,
    })
  },
  setCurrentLog: function(e){
    console.log(e);
    //得到id转换为logs数组下标
    var date = parseInt(e.currentTarget.id) + app.getFirstDayOfThisMonth() - 1;
    //date表示当前所按下的数组下标
    console.log(date);
    var total = 0;
    var tempArray = new Array();
    var currentLog = -1;
    for(var i = 0; i < this.data.finish.length; i++) {
      if(this.data.finish[i] != 0) {
        tempArray.push(i);
        total++;
      }
    }
    console.log(tempArray);
    for(var i = 0; i < total; i++) {
      if(tempArray[i] == date) {
        currentLog = i;
        break;
      } 
    }
    //设定logs数组下标
    this.setData({
      currentLog: currentLog,
    })
  },
  
})