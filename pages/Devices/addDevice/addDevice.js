// miniprogram/pages/Devices/addDevice/addDevice.js
var wsser = require('../../../utils/ws_ts')
let ws = wsser.wsmanager.getInstance();
var app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {},

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {},
  formInputChange(e) {
    console.log(e);
    var { field } = e.currentTarget.dataset;
    this.setData({
      [`formData.${field}`]: e.detail.value
    });
  },
  cancel:function(){
    wx.navigateBack({
      
    })
  },
  subm(e) {
    var token = wx.getStorageSync("token");
    var that = this;
    wx.request({
      url: "https://" + app.globalData.MainURL + "/device/registerDevice",
      method: "POST",
      data: {
        deviceid: that.data.formData.id,
        device_code: that.data.formData.pw
      },
      header: {
        "content-type": "application/json",
        Authorization: "Bearer " + token
      },
      success: function(e) {
        console.log(e);
        var ns = e.data.status;
        switch (ns) {
          case 1:
            wx.showModal({
              title: "",
              showCancel: false,
              content: "注册成功",
              success(res) {
                if (res.confirm) {
                  console.log("用户点击确定");
                  wx.navigateBack();
                  ws.send("update");
                }du
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
      },
      fail: function(e) {
        console.log(e);
      }
    });
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
