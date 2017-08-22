// pages/index/index.js
var app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    heatnum: [{ num: '8', css: 'active' },
    { num: '9', css: '' },
    { num: '10', css: '' },
    { num: '11', css: '' },
    { num: '12', css: '' },
    { num: '4', css: '' },
    { num: '5', css: '' },
    { num: '6', css: '' },
    { num: '7', css: '' }],
    animation_create: {},
    choosed_heat: 0,
    startPoint: 0,
    picker_deg: 0,
    startNum: 1,
    moveX: 0,
    stopClass: '',
    headCount: null,

    animation_create: {},
    animation_join:{},
    showmodal:false,
    choosed_heat: 0,
    inputValue:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function (userInfo) {
      //更新数据
      that.setData({
        userInfo: userInfo,
      })
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.animation_create = wx.createAnimation({
      timingFunction: 'linear',
    })
    this.animation_join = wx.createAnimation({
      timingFunction: 'linear',
    })
    this.animation_create.scale(0, 0).step({duration : 0})
    this.setData({
      animation_create: this.animation_create.export()
    })
    this.animation_join.scale(0, 0).step({ duration: 0 })
    this.setData({
      animation_join: this.animation_join.export()
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.setData({
      inputValue: '',
      showmodal:false
    })
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    this.setData({
      inputValue:'',
      showmodal:false
    })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },
  //创建房间
  create_fun:function(){
      this.setData({ showmodal:true });
      this.animation_create.scale(1.3).step({ duration: 200 });
      this.animation_create.scale(1, 1).step({ duration: 100 });
      this.setData({
        animation_create: this.animation_create.export()
      })
  },
  //创建房间取消按钮
  create_bl:function(){
    this.setData({ showmodal: false });
    this.animation_create.scale(1.3, 1.3).step({ duration: 100 });
    this.animation_create.scale(0, 0).step({ duration: 200 });
    this.setData({
      animation_create: this.animation_create.export()
    });
  },
  //创建房间确定按钮
  create_br:function(){
    var that = this,
        numList = that.data.heatnum;
    for (var i = 0; i < numList.length; i++) {
      if (numList[i].css == 'active') {
        that.setData({
          headCount: numList[i].num - 0
        });
        break;
      }
    }
    wx.request({
      url: 'https://rbnight.bidongtu.cn/room/create',
      data: {
        openId: app.data.openid,
        headCount: that.data.headCount
      },
      dataType: 'json',
      success: function(res) {
        if(res.statusCode == 200){
          console.log(res.data)
          app.data.roomid = res.data[0].roomId;
          app.data.headCount = res.data[0].headCount;
          wx.navigateTo({
            url: '/pages/active/active?chair_num=' + that.data.headCount,
          })
        }
      },
      fail: function(res) {
        wx.showToast({
          title: '无网络连接',
          duration: 2000
        })
      },
      complete: function(res) {
        that.setData({ showmodal: false });
      },
    });
  },
  //创建房间-当前选择的人数
  heatchange: function (e) {
    this.setData({
      choosed_heat: e.detail.current
    })
  },
  //创建房间-
  mystart: function (e) {
    var startDate = new Date();
    this.setData({
      startPoint: startDate,
      moveX: e.touches[0].pageX - 0.5,
      stopClass: '',
      heatnum: [{ num: '8', css: '' },
      { num: '9', css: '' },
      { num: '10', css: '' },
      { num: '11', css: '' },
      { num: '12', css: '' },
      { num: '4', css: '' },
      { num: '5', css: '' },
      { num: '6', css: '' },
      { num: '7', css: '' }]
    })
  },
  // 创建房间-
  mymove: function (e) {
    var that = this;
    var nowDate = new Date();
    var startDate = that.data.startPoint;
    var timeNum = nowDate - startDate;
    if (timeNum > 16.6) {
      var curPoint = e.touches[0].pageX;
      var moveX = that.data.moveX;
      var step = curPoint - moveX;
      that.stepNum(step);
      that.setData({
        moveX: e.touches[0].pageX,
        startPoint: nowDate
      });
    }
  },
  // 创建房间-
  myend: function (e) {
    var that = this;
    var pickerDeg = that.data.picker_deg;
    var heatnum = that.data.heatnum;
    if (pickerDeg < 0) {
      pickerDeg = -pickerDeg;
      that.pickerSelector(pickerDeg, true, heatnum);
    } else {
      that.pickerSelector(pickerDeg, false, heatnum);
    }
  },
  // 创建房间-
  stepNum: function (step) {
    var that = this;
    var num = that.data.startNum;
    that.setData({
      startNum: num + step,
      picker_deg: num
    })
  },
  // 创建房间-
  stopDegNum: function (num, sign) {
    var that = this;
    if (sign) {
      num = -num;
    };
    that.setData({
      picker_deg: num,
      stopClass: 'stopClass',
      startNum: num
    });
  },
  // 创建房间-
  pickerSelector: function (num, sign, heatnum) {
    var baseNum, indexNum, that, index;
    that = this;
    baseNum = Math.floor(num / 360);
    indexNum = (num % 360) / 40;
    if (indexNum > 0 && indexNum <= 0.5) {
      indexNum = 0;
    } else if (indexNum > 0.5 && indexNum <= 1.5) {
      indexNum = 1;
    } else if (indexNum > 1.5 && indexNum <= 2.5) {
      indexNum = 2;
    } else if (indexNum > 2.5 && indexNum <= 3.5) {
      indexNum = 3;
    } else if (indexNum > 3.5 && indexNum <= 4.5) {
      indexNum = 4;
    } else if (indexNum > 4.5 && indexNum <= 5.5) {
      indexNum = 5;
    } else if (indexNum > 5.5 && indexNum <= 6.5) {
      indexNum = 6;
    } else if (indexNum > 6.5 && indexNum <= 7.5) {
      indexNum = 7;
    } else if (indexNum > 7.5 && indexNum <= 8.5) {
      indexNum = 8;
    } else if (indexNum > 8.5) {
      indexNum = 9;
    };
    switch (indexNum) {
      case 0:
        that.stopDegNum(baseNum * 360 + 0, sign);
        break;
      case 1:
        that.stopDegNum(baseNum * 360 + 40, sign);
        break;
      case 2:
        that.stopDegNum(baseNum * 360 + 80, sign);
        break;
      case 3:
        that.stopDegNum(baseNum * 360 + 120, sign);
        break;
      case 4:
        that.stopDegNum(baseNum * 360 + 160, sign);
        break;
      case 5:
        that.stopDegNum(baseNum * 360 + 200, sign);
        break;
      case 6:
        that.stopDegNum(baseNum * 360 + 240, sign);
        break;
      case 7:
        that.stopDegNum(baseNum * 360 + 280, sign);
        break;
      case 8:
        that.stopDegNum(baseNum * 360 + 320, sign);
        break;
      case 9:
        that.stopDegNum(baseNum * 360 + 360, sign);
        break;
    }
    if (!sign) {
      index = 9 - indexNum;
      heatnum[index >= 9 ? 0 : index].css = 'active';
    } else {
      heatnum[indexNum >= 9 ? 0 : indexNum].css = 'active';
    }
    that.setData({
      heatnum: heatnum
    });
  },

  //加入房间
  join_fun:function(){
    this.setData({ showmodal: true });
    this.animation_join.scale(1.3).step({ duration: 200 });
    this.animation_join.scale(1).step({ duration:200 });
    this.setData({
      animation_join:this.animation_join.export()
    })
  },
  //加入房间取消按钮
  join_bl: function () {
    this.setData({ showmodal: false });
    this.animation_join.scale(1.3, 1.3).step({ duration: 100 });
    this.animation_join.scale(0, 0).step({ duration: 200 });
    this.setData({
      animation_join: this.animation_join.export()
    });
  },
  //加入房间确定按钮
  join_br:function(){
    var that = this,
        roomId = app.data.roomid;
    function checkRate(n) {     //判断输入是否为正整数
      var re = /^(?!1000)[1-9]\d{3}$/;
      if (!re.test(n)){
        return false;
      }else{
        return true;
      }
    }
    if( checkRate(roomId) ){
      wx.request({
        url: 'https://rbnight.bidongtu.cn/room/findRoom?roomId='+roomId,
        success:(res)=>{
          if(res.data.isExist){
            wx.navigateTo({
              url: '/pages/active/active',
            })
            this.setData({ showmodal: false });
          }else{
            wx.showToast({
              title: '房间不存在',
            })
          }
        },
        fail:function(res){
          wx.showToast({
            title: '请求失败',
          })
        }
      })
    }else{
      wx.showToast({
        title: '房间号错误!',
      })
    }
  },
  //房间人数
  heatchange:function(e){
    this.setData({
      choosed_heat: e.detail.current
    })
  },
  //加入房间输入框
  roomNum:function(e){
      app.data.roomid = e.detail.value;
  }
})