// pages/active/active.js
var app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    gamestate:0,
    first:true,
    showmodal: false,//模态层
    cz_switch: false, //村长功能弹窗
    roomId: '',//房间号
    chair_num: '', //座位数
    userInfo: {} , 
    databox:"", 
    setimage:[],
    playsetobj:{},  
    chooseresult:{}, //投票结果
    setid:0,//座位号
    headCount: null,
    pixelRatio: null,
    seatCord:{},
    time:0,//倒计时
    
    isTime:false,
    NoVoted:true,

    cz_sign:{},//村长标志
    all_sign:{},//
    isCz:false,//村长按钮
    czseat:'',//村长座位
    seta1: '',//座位身份
    homeOwner:false, //
    info_switch:false,  //身份信息弹窗开关
    info_id:'', //我的身份

    nigth_choose:false,//选择夜晚开关
    night:'',//睁眼夜晚

    vote_switch:false, //投票信息弹窗开关
    vote_btn:true,//查看投票信息按钮开关
    isVote:false, //投票按钮开关
    voted_num:false,//个人投票窗口开关

    campaign:[],//可以被投出去的座位号
    be_voted:[],//每轮投票结果
    voteheadwrap: 0,//投票信息窗口头部
    turns:0,//投票轮次

    seeBR:{}, //动画
    animation1:'',//动画
    idDeg:-180, //动画角度
    seeIdent:true, //看过身份
    
    win:false,
    winner:'',
    dead:{},//玩家出局
    deadRB:0,//出局者身份
    shutdown:false,//
  },
  //模态层点击事件
  modaltap:function(){
    return false;
  },
  //接受信息
  getinformation:function(){
    var that = this;
    wx.onSocketMessage(function(res){
      var qwe = JSON.parse(res.data); 
      console.log(qwe);
      switch (qwe.statusCode) {
        case '110' :
          wx.showToast({
            title: '请入座！',
            duration:2500
          });
          break;
        case '201' :  //加入房间
          that.setData({
            databox:qwe,
          });
          if(qwe.homeOwner){
            var arr = [];
            for(let i in qwe.playSet){
              arr.push(qwe.playSet[i].identity);
            }
            that.setData({
              czseat:qwe.homeOwner
            })
            that.imCz(that.data.setid-1,qwe.homeOwner-1,arr)
          }
          that.setimage();
          that.playset();
          break;
        case '105': //投票结果
          var obj = qwe.voteResults;
          var arr = that.data.be_voted;
          var t = that.data.turns;
          t++;
          arr.push(obj);
          that.setData({
            isTime:false,
            be_voted:arr,
            isVote:false,
            voteheadwrap:t*160+"rpx",
            turns:t,
            showmodal:true,
            vote_switch:true,
          })
          console.log(that.data.be_voted,that.data.czseat)
          break;
        case '106': //给房主提示发牌
          if (app.data.openid == that.data.databox.roomOwner.openId ){
            that.setData({
              homeOwner:true,
            });
            wx.showToast({
              title: '请发牌!',
              duration:2000
            })
          };
          break;
        case '107':
          wx.showToast({
            title: '还有人没有选择睁眼夜晚！',
            duration:2000
          });
          break;
        case '109':
          wx.showToast({
            title: '输入的房间号不存在',
            duration: 1000,
            success:()=>{
              setTimeout(()=>wx.redirectTo({
                url: '/pages/index/index',
              }),1000)
            }
          })
          break;
        case '131':
          that.setData({
            isTime:true,
            time:qwe.lastTime
          })
          if (qwe.lastTime == 1 && that.data.NoVoted){
            that.vote_someone();
          }
        break;
        case '212':
          var identify = qwe.identityCode;
          var cz_num = that.data.czseat;  //cz_num：村长座位号
          var j = that.data.setid;
          that.animation1.rotateY(-180).step();
          let obj = {};
          for (let k in app.data.seat_data) {
            obj[k] = app.data.seat_data[k]
          }
          that.setData({    //数据重置
            databox:qwe,
            be_voted:[],
            dead:{},
            seeIdent:true,
            turns:0,
            idDeg:-180,
            seeBR: that.animation1.export(),
            voteheadwrap:0,
            seatCord: obj,
            gamestate:0,
          });
          console.log(this.data.seatCord)
          that.imCz(j,cz_num,identify);
          break;
        case '214': //投票出局
          that.setData({
            isVote:true,
            vote_btn:false,
            NoVoted:true,
            vote_switch:false,
            campaign:qwe.campaign,
            voted_num:true,
            showmodal:true,
          });
          wx.showToast({
            title: '请投票',
          });
          break;
        case '217':
          //选择睁眼夜晚
          that.setData({
            shutdown: false
          })
          if (!that.data.isCz) {
            that.setData({
              nigth_choose: true,
              showmodal: true,
            })
          };
          break;
        case '401':
          wx.showToast({
            title: '输入的房间号不存在',
            duration: 1000,
            success:function(){
              setTimeout(function(){
                wx.redirectTo({
                  url: '/pages/index/index',
                });
              },1000)
            }
          })
          break;
        case '500':
          var obj = qwe.whoWin == 1?'村民WIN':"狼人WIN";
          console.log(obj);
          that.setData({
            win:true,
            winner:obj,
            gamestate:1
          });
          setTimeout(
            ()=>that.setData({win:false}),5000
          )
          break;
        case '122':
          var txt1 = '',
              arr = [];
          for(var i in qwe.list){
             txt1+=qwe.list[i]+'号';
             if(i<qwe.list.length-1){
               txt1+=','
             }
          };
          wx.showModal({
            title: '请以下玩家看牌',
            content: txt1,
            showCancel:false,
            shutdown: false,
            confirmText:'好的',
          });
          break;
        case '121':
          wx.playBackgroundAudio({
            dataUrl: 'http://ov0qrxqbc.bkt.clouddn.com/audio/mp3/demo.mp3',
          })
          wx.onBackgroundAudioStop(() => {
            var a = { statusCode: 217 }
              wx.sendSocketMessage({
                data: JSON.stringify(a),
              });
          })
          break;
      }
    })
  },
  //座位渲染函数
  setimage: function () {
    var setimage1 = this.data.databox.playSet,
      setimagearray = [],
      obj = {},
      obj2 = this.data.all_sign;

    for (var i in setimage1) {
      setimagearray.push(setimage1[i])
      if(this.data.gamestate == 1){
        obj[i] = setimage1[i].identity;
        if (setimage1[i].identity == 1) {
          obj2[i - 1].n = '民';
        } else if (setimage1[i].identity == -1) {
          obj2[i - 1].n = '狼';
        }
        console.log(1)
      }else{
        console.log(2)        
        if(setimage1[i].seatState == -1){
          obj[i] = setimage1[i].identity;
          if(obj2.length>1){
            if (setimage1[i].identity == 1){
              obj2[i - 1].n = '民';
            }else if(setimage1[i].identity == -1){
              obj2[i - 1].n = '狼';
            }
          }
        }
      }
    }
    console.log(obj);
    this.setData({
      setimage: setimagearray,
      dead:obj,
      all_sign:obj2
    })
    
  },
  //渲染村长
  imCz:function(j,num,obj){  //j客户端座位号   num村长座位 obj玩家信息playset
    if (obj[j] == 2) {
      this.setData({
        isCz: true,
        info_switch:false,
        info_id: '',
      })
    } else {
      if (obj[j] == -1) {
        this.setData({
          info_switch: true,
          isCz: false,
          info_id: 'b',
        })
      } else if (obj[j] == 1) {
        this.setData({
          info_switch: true,
          isCz: false,
          info_id: 'r',
        })
      }
    }
    console.log(this.data.seatCord)
    var obj2 = this.data.seatCord[this.data.chair_num];
    console.log(obj2)
    if(obj2){
      obj2[num].n = '村';
      this.setData({
        all_sign:obj2,
      })
    }

  },
  //入座
  seat:function(e){
    this.setimage();
    var that = this;
    var seatid = e.currentTarget.dataset.seatid;
    if ( this.data.setimage[seatid - 1].seatState <= 0 ){
      var data = {};
      data.statusCode = 211;  //请求状态码 211
      data.openId = app.data.openid;
      data.startSeatId = that.data.setid;
      data.seatId = seatid;
      wx.sendSocketMessage({
        data: JSON.stringify(data)
      })
      that.setData({
        setid: seatid,
      })
    }
    else {
      wx.showToast({
        title: '该座位已有人',
        duration: 2000
      })
    }
  },
  // 村长按钮
  cz_btn:function(){
    this.setData({
      cz_switch:true,
      showmodal:true,
      vote_btn:false
    })
  },
  // 开始游戏
  gamebegin:function(){
    let data = {};
    data.statusCode = 251;
    this.setData({
      cz_switch: false,
      showmodal:false,
      vote_btn: true,
      shutdown:true,
    });
    wx.sendSocketMessage({
      data: JSON.stringify(data),
    });
  },
  //取消
  cancel:function(){
    this.setData({
      cz_switch: false,
      showmodal: false,
      vote_btn:true
    });
  },
  // 开始投票
  Startvote:function(){
    var a = {statusCode : 214};
    wx.sendSocketMessage({
      data: JSON.stringify(a),
    });
    this.setData({
      cz_switch: false,
      showmodal: false,
      vote_btn:true
    });
  },
  // 发牌
  deal:function(){
    wx.showModal({
      title: '确认发牌吗？',
      content: '游戏即将开始',
      success:(r)=>{
        if(r.confirm){
          this.setData({
            cz_switch: false,
            showmodal: false,
            homeOwner:false,
          })
          var data = {};
          data.statusCode = 216;
          wx.sendSocketMessage({
            data: JSON.stringify(data),
          });
        }
      },
    })
  },
  //选择睁眼夜晚
  choose_night:function(){
    var data = {};
    data.seatId = this.data.setid;
    data.seeCode = this.data.night;
    data.statusCode = 213;
    wx.sendSocketMessage({
      data: JSON.stringify(data),
    });
    console.log('已选择睁眼夜晚')
  },
  choosered:function(){
    this.setData({
      night:1,
      nigth_choose:false,
      showmodal:false
    })
    this.choose_night();
  },
  chooseblack:function(){
    this.setData({
      night:0,
      nigth_choose: false,
      showmodal:false      
    })
    this.choose_night();
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //屏幕高亮
    wx.setKeepScreenOn({
      keepScreenOn: true,
    })
    var that = this,
      n = options.chair_num-0,
      sys;
    
    //指导操作界面提示
    var sw = wx.getStorageSync('first') || false;
    if (sw) {
      that.setData({
        first:false
      })
    }else{
      wx.setStorageSync('first', new Date())
    }

    let obj = {}
    for(let k in app.data.seat_data){
      obj[k] = app.data.seat_data[k]
    }

    if (wx.getSystemInfoSync) {
      sys = wx.getSystemInfoSync();
    }
    that.setData({
      userInfo: app.data.userinfo_,
      headCount: app.data.headCount,
      pixelRatio: sys.pixelRatio,
      roomid: app.data.roomid,
      chair_num:n,
      seatCord:obj
    })
    console.log(this.data.seatCord)
    //建立socket连接
    wx.connectSocket({
      url: 'wss://rbnight.bidongtu.cn/room/' + app.data.roomid + '?imagePath=' + that.data.userInfo.avatarUrl + '&openId=' + app.data.openid,
      success:function(res){
        console.log('连接成功'+JSON.stringify(res))
      },
      fail:function(res){
        console.log('连接失败'+JSON.stringify(res))
      }
    })
    //socketopen
    wx.onSocketOpen(function(){
      console.log('1153+WebSocket连接已打开！')
    })
    //关闭socket
    wx.onSocketClose(function(){
      console.log('1158+socket关闭');
      wx.closeSocket();
    })
    that.getinformation();

    wx.onNetworkStatusChange(function(res){
      that.setData({
        sum:that.data.sum + 1
      })
      console.log(that.data.sum)
      if(res.isConnected){
        wx.closeSocket();
        that.asdf();
        that.setData({
          setid:0
        })
      }else{
        wx.showToast({
          title: '无网络连接',
          duration:2000
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.animation1 = wx.createAnimation({
      duration: 500,
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    wx.setKeepScreenOn({
      keepScreenOn: true
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    wx.closeSocket();
    app.data.roomid = '';
    this.data={}
  },

  //加入房间函数
  asdf: function () {
    var that = this;
    wx.connectSocket({
      url: 'wss://192.168.1.138:8081/room/' + app.data.roomid + '?nickName=' + that.data.userInfo.nickName + '&imagePath=' + that.data.userInfo.avatarUrl + '&openId=' + app.data.openid,
      success: function (res) {
        console.log('3' + that.data.flag)
        console.log('成功连接' + JSON.stringify(res))
        that.setData({
          flag: 1
        })
        console.log('4' + that.data.flag)
      },
      fail: function (res) {
        console.log('连接失败' + JSON.stringify(res))
      }
    });
  },

  playset: function () {
    var that = this;
    var playset1 = that.data.databox.playSet;
    var length = 0;
    for(var i in playset1){
      length++;
    }
    that.setData({
      playsetobj: playset1,
      chair_num : length
    });
  },
  //查看投票信息
  checkVote:function(){
    var that = this;
    this.setData({
      vote_switch: !that.data.vote_switch,
      showmodal:!that.data.showmodal
    })
  },
  //我开始投票
  vote:function(){
    var that = this;
    this.setData({
      showmodal:!that.data.showmodal,
      voted_num:!that.data.voted_num,
      vote_btn:false,
    })
  },
//投票
  vote_someone:function(e){
    var that = this;
    var targetId = e ? e.target.dataset.id:0,
        statusCode = 215,
        data = {};
        data.statusCode = statusCode;
        data.seatId = this.data.setid;
        data.targetId = targetId;
    wx.sendSocketMessage({
      data: JSON.stringify(data),
    });
    this.setData({
      showmodal: false,
      voted_num: false,
      voted_num:false,
      vote_btn: true,
      isVote:false,
      NoVoted : false,
    });
  },
  //查看轮次投票情况
  changeturn:function(e){
    this.setData({
      turns:e.target.dataset.id
    });
  },

  turnCard:function(){
    var deg = this.data.idDeg == 0?-180:0;
    var data = {};
    data.statusCode = 250;
    data.seatId = this.data.setid;
    this.animation1.rotateY(deg).step();
    if(this.data.seeIdent){
      wx.sendSocketMessage({
        data: JSON.stringify(data),
      })
      console.log(this.data.seeIdent)
    }
    this.setData({
      seeBR:this.animation1.export(),
      idDeg:deg,
      seeIdent:false
    })
  },
  getfirst: function () {
    this.setData({
      first: false
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
  onShareAppMessage: function (e) {

  }
})