//app.js
App({
  data: {
    openid: 1, 
    roomid: '', //房间号
    userinfo_: {}, //用户信息
    headCount: '',
    seat_data:{
      4: [{ top: '0', left: '50%', 'n': '0' }, { top: '50%', left: '100%', 'n': '0' }, { top: '100%', left: '50%', 'n': '0' }, { top: '50%', left: '0', 'n': '0' }],
      5: [{ top: '6%', left: '80%', n: 0 }, { top: '50%', left: '100%', n: 0 }, { top: '100%', left: '50%', n: 0 }, { top: '50%', left: '0', n: 0 }, { top: '6%', left: '20%', n: 0 }],
      6: [{ top: '6%', left: '80%', n: 0 }, { top: '50%', left: '100%', n: 0 }, { top: '94%', left: '80%', n: 0 }, { top: '94%', left: '20%', n: 0 }, { top: '50%', left: '0', n: 0 }, { top: '6%', left: '20%', n: 0 }],
      7: [{ top: '8%', left: '83%', n: 0 }, { top: '45%', left: '100%', n: 0 }, { top: '79%', left: '97%', n: 0 }, { top: '100%', left: '50%', n: 0 }, { top: '79%', left: '3%', n: 0 }, { top: '45%', left: '0', n: 0 }, { top: '8%', left: '17%', n: 0 }],
      8: [{ top: '0', left: '50%', n: 0 }, { top: '19%', left: '96%', n: 0 }, { top: '50%', left: '100%', n: 0 }, { top: '81%', left: '96%', n: 0 }, { top: '100%', left: '50%', n: 0 }, { top: '81%', left: '4%', n: 0 }, { top: '50%', left: '0', n: 0 }, { top: '19%', left: '4%', n: 0 }],
      9: [{ top: '3.5%', left: '74%', n: 0 }, { top: '25%', left: '99%', n: 0 }, { top: '50%', left: '100%', n: 0 }, { top: '75%', left: '99%', n: 0 }, { top: '100%', left: '50%', n: 0 }, { top: '75%', left: '1%', n: 0 }, { top: '50%', left: '0', n: 0 }, { top: '25%', left: '1%', n: 0 }, { top: '3.5%', left: '26%', n: 0 }],
      10: [{ top: '3.5%', left: '74%', n: 0 }, { top: '25%', left: '99%', n: 0 }, { top: '50%', left: '100%', n: 0 }, { top: '75%', left: '99%', n: 0 }, { top: '96.5%', left: '74%', n: 0 }, { top: '96.5%', left: '26%', n: 0 }, { top: '75%', left: '1%', n: 0 }, { top: '50%', left: '0', n: 0 }, { top: '25%', left: '1%', n: 0 }, { top: '3.5%', left: '26%', n: 0 }],
      11: [{ top: '0', left: '50%', n: 0 }, { top: '7.5%', left: '83%', n: 0 }, { top: '27%', left: '99.5%', n: 0 }, { top: '51%', left: '100%', n: 0 }, { top: '75%', left: '99%', n: 0 }, { top: '96.5%', left: '74%', n: 0 }, { top: '96.5%', left: '26%', n: 0 }, { top: '75%', left: '1%', n: 0 }, { top: '51%', left: '0', n: 0 }, { top: '27%', left: '0.5%', n: 0 }, { top: '7.5%', left: '17%', n: 0 }],
      12: [{ top: '0', left: '50%', n: 0 }, { top: '7%', left: '83%', n: 0 }, { top: '27%', left: '100%', n: 0 }, { top: '50%', left: '100%', n: 0 }, { top: '73%', left: '100%', n: 0 }, { top: '93%', left: '83%', n: 0 }, { top: '100%', left: '50%', n: 0 }, { top: '93%', left: '17%', n: 0 }, { top: '73%', left: '0', n: 0 }, { top: '50%', left: '0', n: 0 }, { top: '27%', left: '0', n: 0 }, { top: '7%', left: '17%', n: 0 }]
    }
  },
  onLaunch: function () {
    if (wx.setKeepScreenOn) {
      wx.setKeepScreenOn({
        keepScreenOn: true
      })
    }
    else {
      // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法保持屏幕常亮，请前往设置里设置屏幕常亮状态参与游戏。'
      })
    }
    //调用API从本地缓存中获取数据
    var that = this;
  },

  getUserInfo: function (cb) {
    var that = this;
    if (that.globalData.userInfo) {
      typeof cb == "function" && cb(that.globalData.userInfo)
    }
    else {
      //调用登录接口
      wx.login({
        success: function (r) {
          var code = r.code;
          wx.getUserInfo({
            success: function (res) {
              //3.解密用户信息 获取unionId
              wx.request({
                url: 'https://rbnight.bidongtu.cn/room/decodeUserInfo/', //自己的服务接口地址
                method: 'post',
                header: {
                  'content-type': 'application/x-www-form-urlencoded'
                },
                data: { encryptedData: res.encryptedData, iv: res.iv, code: code },
                success: function (data) {
                  //4.解密成功后 获取自己服务器返回的结果
                  if (data.data.status == 1) {
                    console.log(data.data);
                    that.data.userinfo_ = data.data.userInfo;
                    that.data.openid = data.data.userInfo.openId;
                  } else {
                    console.log('解密失败');
                  }
                },
                fail: function () {
                  console.log('系统错误');
                }
              })
              that.globalData.userInfo = that.data.userinfo_;
              typeof cb == "function" && cb(that.globalData.userInfo);
            }
          })
        }
      })

    }
  },
  globalData: {
    userInfo: null
  }

})