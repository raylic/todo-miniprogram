const app = getApp();
const date = new Date();
const hours = [];
const minutes = [];
for(var i = 0; i < 24; i++){
  hours.push(i);
}
for(var i = 0; i < 60; i++){
  minutes.push(i);
}

Page({
    data: {
      //不存储的数据
      maxCount: 8,
      dateText: '',
      dialogShow: false,
      buttons: [{text: '否'}, {text: '是'}],
      currentDeleteTarget: 0,
      hours: hours,
      minutes: minutes,
      //需要存储的数据
      //应该是全局变量
      plans: [],
      time: [8,0,10,0],
      reward: {
        body: "",
        focus: false,
      }
    },
    //初始化
    onLoad: function(e) {
      console.log("everyday load");
      //更新日期
      var datetext = date.getFullYear() + '.' + (date.getMonth()+ 1) + '.' + date.getDate();
      //获取数据
      var plans = app.globalData.plans;
      var time = app.globalData.time;
      var reward = app.globalData.reward;
      //初始化
      for(var i = 0; i < plans.length; i++) {
        plans[i].focus = false;
      }
      reward.focus = false;
      this.setData({
        dateText: datetext, 
        plans: plans,
        time: time,
        reward: reward,
        hours: hours,
        minutes: minutes
      })
    },
    //退出保存
    onUnload: function(e) {
      this.save();
      app.save();
    },
    //保存数据
    save: function () {
      console.log("everyday save");
      app.globalData.plans = this.data.plans;
      app.globalData.reward = this.data.reward;
      app.globalData.time = this.data.time;
    },

    //计划相关函数
    //设置点击出现焦点
    focusPlan: function(e) {
      var index = parseInt(e.currentTarget.dataset.index);
      var key = "plans["+index+"].focus";
      this.setData({
        [key]: true,
      })
    },
    blurPlan: function(e) {
      console.log()
      this.save();
      var index = parseInt(e.currentTarget.dataset.index);
      var key = "plans["+index+"].focus";
      this.setData({
        [key]: false,
      })
    },
    //添加一个空白计划
    addPlan: function(e){
      var arr = this.data.plans ? this.data.plans : new Array();
      var obj = {
        body: "" , 
        isFinished: false,
        finishTime: "",
        focus: false,
      };
      arr.push(obj);
      this.setData({
        plans: arr
      })
    },
    //利用键盘输入时间双向绑定更新
    updatePlan: function(e) {
      var arr = this.data.plans;
      var obj = arr[e.currentTarget.dataset.index];
      obj.body = e.detail.value;
      this.setData({
        plans: arr
      })
    },
    //删除
    deletePlan: function (e) {
      console.log('delete:' + e.currentTarget.id);
      //弹出窗口
      this.setData({
        dialogShow: true, 
        currentDeleteTarget: e.currentTarget.id,
      })
    },
     //弹窗确定界面
     planDialogButton: function(e) {
      console.log(e.detail);
      if(e.detail.index == 0) {//点了取消按钮
        this.setData({
          dialogShow: false,
        })
      } else {
        var arr = this.data.plans;
        arr.splice(this.data.currentDeleteTarget, 1);
        this.setData({
        plans: arr,
        dialogShow: false,
        })
      }
    },
    alert: function(e) {
      wx.showToast({
        title: '最多添加8个',
        icon: 'none',
        duration: 1000
      })
    },

    //奖励界面
    //代码还没有调试完整
    focusReward: function(e) {
      this.setData({
        'reward.focus': true,
      })
    },
    blurReward: function(e) {
      this.setData({
        'reward.focus': false,
      })
      this.save();
    },
    //利用键盘输入时间双向绑定更新
    updateReward: function(e) {
      this.setData({
        'reward.body': e.detail.value
      })
    },
    pickerChange: function(e) {
      const val = e.detail.value;
      console.log(val);
      this.setData({
        'time[0]': this.data.hours[val[0]],
        'time[1]': this.data.minutes[val[1]],
        'time[2]': this.data.hours[val[2]],
        'time[3]': this.data.minutes[val[3]],
      })
      this.save();
    }
})