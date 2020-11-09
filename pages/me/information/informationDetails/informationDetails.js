// miniprogram/pages/me/information/informationDetails/informationDetails.js
var notiservice = require("../../../../model/noti");
var nots = notiservice.notimanager.getInstance();
var app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    notilist: []
  },
  sub: function(e, code) {
    var token = wx.getStorageSync("token");
    var that = this;
    console.log(e);
    var ids = e.currentTarget.dataset.ids;
    wx.request({
      url: "http://" + app.globalData.MainURL + "/device/shareres",
      method: "POST",
      data: {
        deviceid: e.currentTarget.dataset.deviceid,
        token: e.currentTarget.dataset.token,
        events_id: e.currentTarget.dataset.event_id,
        code: code
      },
      header: {
        "content-type": "application/json",
        Authorization: "Bearer " + token
      },
      success: function(e) {
        console.log(e);
        nots.edit(ids, "isread", 1);
        var ns = e.data.status;
        switch (ns) {
          case 1:
            wx.showModal({
              title: "",
              showCancel: false,
              content: e.data.status_text,
              success(res) {
                if (res.confirm) {
                  console.log("用户点击确定");
                }
              }
            });
            break;
          case -1:
            wx.showModal({
              title: "错误",
              showCancel: false,
              content: e.data.status_text
            });
            break;
          default:
            wx.showModal({
              title: "错误",
              showCancel: false,
              content: "未知错误"
            });
            break;
        }
        that.refresh();
      },
      fail: function(e) {
        console.log(e);
      }
    });
  },
  agree: function(e) {
    this.sub(e, "1");
  },
  reject: function(e) {
    this.sub(e, "0");
  },
  gotodetail: function(e) {
    console.log(e.currentTarget.dataset.typeid);
    wx.navigateTo({
      url: "../../../Devices/deviceDetail/deviceDetail",
      success: function(res) {
        // 通过eventChannel向被打开页面传送数据
        res.eventChannel.emit("acceptDataFromOpenerPage", {
          data: e.currentTarget.dataset.deviceid
        });
      }
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options);
    var listname = "";
    try {
      var value = wx.getStorageSync("NotiType");
      if (value) {
        listname = value[options.id];
        console.log(listname);
        this.setData({
          id: options.id,
          listname: listname
        });
        this.refresh();
      }
    } catch (e) {
      // Do something when catch error
    }
  },
  refresh: function(listname) {
    var listname = this.data.listname;
    try {
      var value = wx.getStorageSync("notilist");
      if (value) {
        var ary = value;
        var ss = ary.filter(details => {
          return details.type == listname.type;
        });
        console.log("fenx", ss);
        this.setData({
          notilist: ss
        });
      }
    } catch (e) {
      // Do something when catch error
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {}
});
