//app.js
App({
  onLaunch: function () {
    //初始化云服务
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        // env: 'my-env-id',
        traceUser: true,
      })
      wx.cloud.callFunction({
        name: 'login',
        complete: res => {
          this.globalData.openid = res.result.openid;
        }
      })
    }
    //读取存储到全局变量
    this.globalData.plans = wx.getStorageSync('plans') || [];
    this.globalData.reward = wx.getStorageSync("reward") || "";
    this.globalData.time = wx.getStorageSync('time') || [8,0,10,0];
  //  this.globalData.logs = wx.getStorageSync('historyLogs') || [];
    this.globalData.finish = //wx.getStorageSync("finish") ||
        [ 0,0,0,0,0,0,0,
          0,0,0,0,0,0,0,
          0,0,0,0,0,0,0,
          0,0,0,0,0,0,0,
          0,0,0,0,0,0,0,
          0,0,0,0,0,0,0
        ];
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  },
  //全局方法返回本周第一天是星期几
  getFirstDayOfThisMonth: function() {
    var date = new Date();
    var d = date.getDate();
    var weekDay = date.getDay();
    var ans = weekDay - d + 1;
    //确保返回值在 1 - 7
    if(ans > 7) ans %= 7;
    else if( ans <= 0 ){
      do{
        ans += 7;
      } while( ans < 0);
    } 
    return ans;
  },
  //全局方法，将当前的所有都添加到记录上
  addOneLog: function() {
    var d = new Date();
    var dateText = (d.getMonth() + 1) + '.' + d.getDate();
    if(this.globalData.logs[this.globalData.logs.length -1] != null && dateText == this.globalData.logs[this.globalData.logs.length -1].dateText) return;
    var logs = this.globalData.logs;
    var i = this.getFirstDayOfThisMonth() + d.getDate() - 1;//数组下标
    var newLog = {};
    newLog.date = dateText;
    newLog.plans = this.globalData.plans;
    newLog.reward = this.globalData.reward;
    //添加进记录
    logs.push(newLog);
    //修改全局变量
    this.globalData.finish[i] = true;
    this.globalData.logs = logs;
    //修改内存
    wx.setStorageSync('historyLogs', logs);
  },
  //全局方法,保存全局数据
  save: function() {
    console.log("全局变量保存")
    wx.setStorageSync('plans', this.globalData.plans);
    wx.setStorageSync('time', this.globalData.time);
    wx.setStorageSync('reward', this.globalData.reward);
    wx.setStorageSync('finish', this.globalData.finish);
  },
  globalData: {
    userInfo: null,
    plans: [],
    time: [8,0,10,0],
    reward: {
      body: "",
      isFinished: false,
      focus: false,
    },
    //当前日历的完成情况
    finish: [],
    //当前日历下的历史记录，需要从内存中获取
    logs: [],
  },
  //全局方法，将当前计划上传到云端
  upload: function() {
    const db = wx.cloud.database();
    db.collection('plans').doc(this.globalData.openid).set({
      data: {
        nickName: this.globalData.userInfo.nickName,
        plans: this.globalData.plans
      }
    })
  }
})