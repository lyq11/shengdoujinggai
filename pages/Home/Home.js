// miniprogram/pages/Home.js
var common = require("../../utils/NotificationCen");
var wsser = require("../../utils/ws_ts");
var deviceslist = require("../../model/devices").devicesmanager.getInstance();
var app = getApp();
let ws = wsser.wsmanager.getInstance();
var timers;
Page({
  /**
   * 页面的初始数据
   */
  data: {
    CompanyType: {},
    host: "",
    lowpower_count: 0,
    offline_count: 0,
    warning_count: 0,
    sleep_count: 0,
    online_count: 0,
    fix_count: 0,
    offlinelist: [],
    warninglist: [],
    Locklist: [],
    listData: [],
    currentIndex: 0,
    carouselList: [
      {
        id: "101",
        img: "http://www.sundaytek.com/sd.jpg",
        title: "",
        url: "https://www.sundaytek.com/",
      },
    ],
  },

   //跳转到搜索界面
   searchBind:function(){
    wx.navigateTo({  
      url: './search/search',  
    }) 
  },

  //跳转到注册界面
  registerDevice:function(){
    wx.navigateTo({  
      url: './registerDevice/registerDevice',  
    }) 
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //获得taken值
    var token = wx.getStorageSync("token");
    //如果token值为空则跳转至index
    if (token == null || token == "") {
      wx.reLaunch({
        // url: "../index/index",
        url: "../index/index",
      });
    } else {
      //链接服务器
      ws.start();
      wx.showLoading({
        title: "加载中",
      });
      //发起http请求
      this.getUserInfos();
      var that = this;

      this.requestCarouselListData(); //请求轮播图
      let inits = common.wsmanager.getInstance(); //消息中心的单例  
      //消息中心单例调用eguser(name, callb)方法返回了一个user
      //将当前页面的data数据作为回调函数参数

      // CompanyType: {},
      // host: "",
      // lowpower_count: 0,
      // offline_count: 0,
      // warning_count: 0,
      // sleep_count: 0,
      // online_count: 0,
      // fix_count: 0,
      // offlinelist: [],
      // warninglist: [],
      // Locklist: [],
      // listData: [],
      // currentIndex: 0,
      // carouselList: [
      //   {
      //     id: "101",
      //     img: "http://www.sundaytek.com/sd.jpg",
      //     title: "",
      //     url: "https://www.sundaytek.com/",
      //   },
      // ],


      let brook = inits.eguser("home", (data) => {
        //消息中心的回调
        //全部设备列表  
        var array = deviceslist.list;
        //筛选
        var narray = array.filter((e) => {
          //筛选出type_id==2的设备，井盖设备
          return parseInt(e.type_id) == "2";
        });
        console.log(narray);
        
        // 当前array的值为三个对象
        console.log(deviceslist.list)
       
        //过滤器
        var lowpower_a = narray.filter((e) => {
          //返回电量小于500的设备
          return parseInt(e.device.device_power) <= 500;
        });
        var offline_a = narray.filter((e) => {
          return e.device_isonline == 0;
        });
        var warning_a = narray.filter((e) => {
          return e.warning_status == 1;
        });
        var sleep_a = narray.filter((e) => {
          return e.device_isonline == 2;
        });
        var online_a = narray.filter((e) => {
          return e.device_isonline == 1;
        });
        var fix_a = narray.filter((e) => {
          return e.service_status == 1;
        });

        var current = narray.filter((e) => {
          return e.device_isonline == 0 || e.warning_status != 0;
        });
        var offlinelist = narray.filter((e) => {
          return e.device_isonline == 0;
        });
        var warninglist = [];
        //warninglist = warninglist.concat(lowpower_a)
        //warninglist = warninglist.concat(offline_a)
        warninglist = warninglist.concat(warning_a);
        //warninglist = warninglist.concat(fix_a)
        this.setData({
          warninglist: warninglist,
          lowpower_count: lowpower_a.length,
          offline_count: offline_a.length,
          warning_count: warning_a.length,
          sleep_count: sleep_a.length,
          online_count: online_a.length,
          fix_count: fix_a.length,
        });
      });
    }
  },
  getUserInfos: function () {
    var that = this;
    var token = wx.getStorageSync("token");
    var MainUrl = wx.getStorageSync("MainAddress");
    wx.request({
      url: "https://" + MainUrl + "/api/getUserInfo",
      method: "POST",
      header: {
        "content-type": "application/json",
        Authorization: "Bearer " + token,
      },
      success: function (res) {
        console.log(res.data.status_text);
        app.globalData.UserInfos = res.data.status_text;
        var userinfo = app.globalData.UserInfos;
        wx.setNavigationBarTitle({
          title: userinfo.Home_title,
        });
        var sd = wx.getStorageSync("CompanyType");

        console.log("global de " + app.globalData.UserInfos);
        that.setData({
          CompanyType: sd,
        });
        timers = setInterval(() => {
          that.refresh();
        }, 1000);
      },
      fail: function (e) {
        console.log("失败");
        console.log(e);
      },
    });
  },
  refresh: function () {
    console.log("当前状态", getApp().globalData.isportopen);
    if (getApp().globalData.isportopen == true) {
      var token = wx.getStorageSync("token");
      ws.send("register@" + token);
      wx.hideLoading();
      clearInterval(timers);
    }
  },
  gotodetail: function (e) {
    console.log(e.currentTarget.dataset.typeid);
    wx.navigateTo({
      url: "../Devices/deviceDetail/deviceDetail",
      success: function (res) {
        // 通过eventChannel向被打开页面传送数据
        res.eventChannel.emit("acceptDataFromOpenerPage", {
          data: e.currentTarget.dataset.deviceid,
        });
      },
    });
  },
  requestCarouselListData() {
    var that = this; //注意this指向性问题
    var urlStr = that.data.host + "/xjj/chome_carousel_list.json"; //请求连接注意替换（我用本地服务器模拟）
    console.log("请求轮播图：" + urlStr);
    wx.request({
      url: urlStr,
      data: {
        //这里放请求参数，如果传入参数值不是String，会被转换成String
        // x: '',
        // y: ''
      },
      header: {
        "content-type": "application/json", // 默认值
      },
      success(res) {
        console.log("轮播图返回值：");
        console.log(res.data.result);
        var resultArr = res.data.result;
        that.setData({
          carouselList: resultArr,
        });
      },
    });
  },
  /*app.globalData.FilterData = [
    ["", "", "", ""], //在线 离线 休眠
    ["", "", "", ""], //维保 预警 低电量
    ["", "", "", ""], //设备列表
  ];
  */




  //这里做的是主页不同设备的点击跳转
  gotolist: function (e) {
    console.log("touch", e);
    switch (e.currentTarget.dataset.sel) {
      //电量低设备
      case "1":
        app.globalData.FilterData = [0,3,0]
        console.log("set",app.globalData.FilterData)
        break;
      //离线设备
      case "2":
        app.globalData.FilterData = [2,0,0]
        break;
      //预警设备
      case "3":
        app.globalData.FilterData = [0,2,0]
        break;
      //休眠设备
      case "4":
        app.globalData.FilterData = [3,0,0]
        break;
      //在线设备
      case "5":
        app.globalData.FilterData = [1,0,0]
        break;
      //维护设备
      case "6":
        app.globalData.FilterData = [0,1,0]
        break;
    }
    wx.switchTab({
      //跳转底部tab栏设备
      url: "../Devices/devicelist/devicelist",
      success: function (res) {
        //跳转成功 打印出    
        console.log("sucees",app.globalData.FilterData)
        // success
      },
      fail: function (e) {
        //失败
        console.log("error",e)
      },
      complete: function () {
        // complete
      },
    });
  },
  //点击了轮播图
  chomeCarouselClick: function (event) {
    var urlStr = event.currentTarget.dataset.url;
    console.log("点击了轮播图：" + urlStr);
    // wx.navigateTo({
    //   url: 'test?id=1'
    // })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {},
});
