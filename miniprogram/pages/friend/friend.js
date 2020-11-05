const app = getApp();
const db = wx.cloud.database();

Page({
  data:{
    hasFriend: false,
    numberShow: false,
    addShow: false,
    unlinkShow: false,
    friendAvatar: '',
    friendName: '',
    friendinfo:{},
    userInfo:{}
  },
  onLoad: function() {
    console.log("friendload")
    //判断openid是否
    if(app.globalData.openid == null) {
      wx.cloud.callFunction({
        name: 'login',
        complete: res => {
          app.globalData.openid = res.result.openid;
          this.getFriendinfo();
        }
      })
    } else 
    this.getFriendinfo();
    //用户自己的信息
    this.setData({
      userInfo: app.globalData.userInfo,
    })
  },
  getFriendinfo: function() {
    console.log("尝试获取好友信息");
    db.collection('friendship').doc(app.globalData.openid).get({
      success: res => {
        //获取好友的计划列表
        db.collection('plans').doc(res.data.friendId).get({
          success: res => {
            console.log("成功获取好友数据");
            this.setData({
              friendinfo: res.data,
              hasFriend: true
            })
          },
          fail: err => {
            console.log("获取好友数据失败");
          }
        })
        //获取好友基本信息
        db.collection('user').doc(res.data.friendId).get({
          success: res => {
            console.log("成功获取好友头像");
            this.setData({
              friendAvatar: res.data.userinfo.avatarUrl,
              friendName: res.data.userinfo.nickName,
            })
          },
          fail: err => {
            console.log("获取好友头像失败");
          }
        })
      },
      fail: err => {
        console.log("该用户还没有建立连接");
      }
    })
  },
  setUerInfo: function(e) {
    console.log(e.detail.value);
    //关掉弹窗
    this.setData({
      numberShow: false,
    })
    db.collection('user').doc(app.globalData.openid).set({
      data: {
        userinfo: app.globalData.userInfo,
        password: e.detail.value.password,
        nickName: app.globalData.userInfo.nickName
      },
      success: res => {
        console.log('成功')
        wx.showToast({
          icon: 'none',
          title: '设置成功'
        })
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '网络错误'
        })
      }
    })
  },

  link2user:function(friendId,name) {
    //在连接前确保没有连接别的用户
    console.log("查询结果:");
    let cnt = 0;
    db.collection("friendship").where({
      _openid: app.globalData.userInfo._openid
    }).get({
      success: res => {
        //该用户绑定过其他用户，直接返回
        console.log(res.data);
        if(res.data.length > 0) {
          console.log("该用户已经绑定好友");
          wx.showToast({
          icon: 'none',
          title: '您已绑定好友，无法重复绑定'
        })
        return;
        }
        //当该用户没有绑定别的用户的时候
        db.collection('friendship').add({
          data: {
            _id: app.globalData.openid,
            friendId: friendId,
            friendName: name,
          },
          success: res => {
            console.log("绑定成功");
            wx.showToast({
              icon: 'none',
              title: '绑定成功'
            });
            //获取朋友的计划列表、头像、名字
            this.getFriendinfo();
          },
          fail: err=> {
            console.log("绑定失败");
            wx.showToast({
              icon: 'none',
              title: '绑定失败'
            });
          }
        })
      }
    });
  },
  unlink: function(e) {
    console.log("解除联系")
    this.setData({
      unlinkShow: false,
      hasFriend: false,
    })
    //利用用户的openid查找friendship，并删除记录
    db.collection("friendship").doc(app.globalData.openid).remove({
      success: res => {
        console.log("解除成功");
        wx.showToast({
          icon: 'none',
          title: '解除成功'
        })
      },
      fail: err => {
        console.log("解除失败");
        wx.showToast({
          icon: 'none',
          title: '解除失败'
        })
      }
    });
    //清空本地好友消息
    this.setData({
      hasFriend: false,
    })
  },
  upload: function() {
    app.upload();
  },
  queryUserInfo: function(e) {
    this.setData({
      addShow: false
    });
    console.log("用户的输入：", e.detail.value);
    let that = this;
    db.collection('user').where({
      password: e.detail.value.number,
      nickName: e.detail.value.nickname
    }).get({
      success: res => {
        console.log("user表中的查询结果：" + res.data);
        //结果为空直接返回
        if(res.data.length == 0){
          wx.showToast({
            icon: 'none',
            title: '昵称或者暗号错误'
          })
           return;
        } else if(res.data.length > 1) {
          wx.showToast({
            icon: 'none',
            title: '查找结果中有重复内容，请告知系统管理员'
          })
           return;
        }
        //绑定两个人
        console.log(res.data[0]);
        this.link2user(res.data[0]._openid, res.data[0].userinfo.nickName);
        
      },
      fail: err => {
        console.log(err);
        //输出失败信息
        wx.showToast({
          icon: 'none',
          title: '无法连接到后台服务器，请检查网络或者联系系统管理员'
        })
      } 
    })
  },
  setNumberShow: function(e) {
    this.setData({
      numberShow: true
    })
  },
  setAddShow: function(e) {
    this.setData({
      addShow: true
    })
  },
  unlinkShow: function(e) {
    this.setData({
      unlinkShow: true
    })
  }
})