//index.js
//获取用户设置的时间
const app = getApp();
var clearAnimation = wx.createAnimation({      duration: 0    });

var windowHeight;
wx.getSystemInfo({
  success: function (res) {
   windowHeight = res.windowHeight;
  }
});
Page({
  data: {
    buttons: [{text: '确定'}],
    //奖励界面的显现
    rewardShow: false,
    fireShow: false,
    //当前车的位置
    currentFinishTarget: 0,
    //需要更具当前完成情况初始化
    currentCarPosition: -1,
    targetPlan: 0,
    isCarLeft: true,
    dialogShow: false,
    timePer: "", //黄条的百分比
    timeValue: "138rpx", //黄条的宽度值
    vhs:[
      "9vh",
      "19vh",
      "23vh",
      "40vh",
      "40vh",
      "50vh",
      "57vh",
      "74vh"
    ],
    lefts: [
      '280rpx',
      "550rpx",
      "150rpx",
      "120rpx",
      "520rpx",
      "320rpx",
      "57rpx",
      "157rpx"
    ],
    carPosition: ["500rpx", "81vh"],
    reward: [],
    plans: [],
    time:[],
    shortPlans: [],
  },
  onLoad: function() {
    console.log("load");
    //创建动画
    this.animation = wx.createAnimation();
  },
  onShow: function(options) {
    //设定默认的值
    console.log("show")
    var time = app.globalData.time;
    var per = getPer( time );
    var timePer = parseInt(per * 100) + "%";
    var width = per * 234;
    var plans = app.globalData.plans;
    var reward = app.globalData.reward;
    var short = [];
    var str;
    
    //初始化精简版的plan
    for(var i = 0; i < plans.length; i++){
      short.push(plans[i].body.length > 4 ? 
                  plans[i].body.slice(0,4) + '…' : 
                  plans[i].body);
    };
    //宽度不能小于高度
    if(width < 48 ) width = 48
    
    //更新target
    var target = -2;
    for(var i = 0; i < plans.length; i++) {
        if(!plans[i].isFinished) {
          target = i - 1;
          break;
        }
      }
    if(target == -2) target = plans.length - 1;
    this.setData({
      targetPlan: target,
      reward: reward,
      plans: plans,
      time: time,
      shortPlans: short,
      timePer: timePer,
      timeValue: width + "rpx",
    })
    this.move();
  },
  setPlanFinish: function(e) {
      var arr = this.data.plans;
      var i = parseInt(e.currentTarget.id);
      var j = -2;
      var d = new Date()
      //设定为转换完成状态
      arr[i].isFinished = !arr[i].isFinished;
      //更新完成时间
      arr[i].finishTime = formatTime( d.getHours() ) + ':' + formatTime( d.getMinutes() );
      console.log(arr[i]);
      for(var i = 0; i < arr.length; i++) {
        if(!arr[i].isFinished) {
          j = i - 1;
          break;
        }
      }
      //所有都已设置为完成
      if(j == -2) j = this.data.shortPlans.length - 1;
      this.setData({
        plans: arr,
        //设置targetPlan
        targetPlan: j,
      })
      //调用动画
      if(this.data.targetPlan >= 0) {
        this.move();
      }
      //保存
      this.save();
      app.save();
      //上传数据到云端
      app.upload();
  },
  //当前的数据同步全局数据
  save: function() {
    app.globalData.time = this.data.time;
    app.globalData.plans = this.data.plans;
    
  },

  //移动逻辑，根据当前数据判断应该如何移动
  move: function(){
    var i = this.data.currentCarPosition + 1;//当前位置的下一个位置
    //目标应该是从下往上第一个没有完成的计划的位置
    var target = this.data.targetPlan + 8 - this.data.shortPlans.length;//目的地
    //计划下标和位置下标转化公式： 位置下标 = 目标计划下标 + 8 - 当前计划数
    if(target >= i) {//是否需要移动
      this.translate(i, target)
    }
  },
  resetPosition: function(){
    this.animation = clearAnimation;
  },
  //从第 i-1 号位置前进到到第 j 号位置，并更新currentCarPosition变量
  translate: function (i, j) {
    console.log('tanslate' + i + 'to' + j);
    var that = this;
    switch(i){
      case 0:
        this.animation.translate(-140, -25/600*windowHeight).step();
        this.setData({
          animation: this.animation.export(),
        })
        break;
      case 1:
        this.animation.translate(-200, -80/600*windowHeight).step();
        this.setData({
          animation: this.animation.export(),
        })
        break;
      case 2:
        this.animation.translate(-70, -120/600*windowHeight).step();
        this.setData({
          animation: this.animation.export(),
          isCarLeft: false,
        })
        break;
      case 3:
          this.animation.translate(0, -180/600*windowHeight).step();
          this.setData({
            animation: this.animation.export(),
          })
          break;
      case 4:
      this.animation.translate(-160, -220/600*windowHeight).step();
      this.setData({
        animation: this.animation.export(),
        isCarLeft: true,
      })
      break;
      case 5:
      this.animation.translate(-160, -280/600*windowHeight).step();
      this.setData({
        animation: this.animation.export(),
        isCarLeft: false,
      })
      break;
      case 6:
        this.animation.translate(-10, -330/600*windowHeight).step();
        this.setData({
          animation: this.animation.export(),
          isCarLeft: false,
        })
        break;
      case 7:
        this.animation.translate(-80, -370/600*windowHeight).step();
        this.setData({
          animation: this.animation.export(),
          isCarLeft: true,
        })
        break;
    }
    if(i < j) {
      setTimeout(function() {
        that.translate(i+1, j);
        that.setData({
          currentCarPosition: i+1,
        })
      }, 500)
    }
  },
  reset: function () {
    var that = this;
    console.log("reset")
    this.animation.translate(0,0)
                  .step({duration: 0})
    this.setData({
      animation: this.animation.export(),
      currentCarPosition: -1,
      isCarLeft: true,
    })
    setTimeout(function() {
      that.move();
    }, 500)
  },
  setFinish: function() {
    console.log("添加记录")
    //加条件一天一次，而且必须要plans全完成
    for(var i = 0; i < this.data.plans.length; i++) {
      if(!this.data.plans[i].isFinished) return;
    }
    this.setData({
      rewardShow: true,
      fireShow: true,
    })
  },
  planDialogButton: function(e) {
    app.addOneLog();
    this.setData({
    rewardShow: false,
    });
  }
})

//逻辑如下
//若当前时间早于开始时间，则进度条是100%
//若晚于结束时间，则进度条是0
//若结束时间早于开始时间，则自动将结束时间增加一天
//当前时间处于开始和结束时间之间则正常显示百分比
function getPer( time ) {
  var d = new Date();
  var all = (time[2] - time[0]) * 60 + (time[3] - time[1]);
  var now = (d.getHours() - time[0]) * 60 + (d.getMinutes() - time[1]);
  //当开始时间大于结束时间的时候，自动计算为第二天
  if ( all <= 0 )  all += 1440;
  if( now < 0 ) {
    return 1;
  } else if (now <= all && now > 0 ) {
    return  1 - (now / all) ;
  } else return 0;
}
function formatTime(num) {
  var n = Number(num);
  if(n < 10) 
    return '0' + n;
  else
    return num;
}

