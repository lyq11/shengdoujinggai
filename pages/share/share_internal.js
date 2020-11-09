// miniprogram/pages/share/share_internal.js
var app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    device: [],
    username: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    console.log(options);
    const eventChannel = this.getOpenerEventChannel();
    eventChannel.on("sendIdto", function(data) {
      console.log(data);
      wx.setNavigationBarTitle({
        title: "内部共享" + data.data.name
      });
      that.setData({
        device: data.data
      });
    });
  },
  input: function(e) {
    console.log(e.detail);
    this.setData({
      username: e.detail.value
    });
  },
  subbt: function(e) {
    var token = wx.getStorageSync("token");
    var that = this;
    wx.request({
      url: "http://" + app.globalData.MainURL + "/device/shareDevice",
      method: "POST",
      data: {
        deviceid: that.data.device.id,
        mobile: that.data.username
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
              content: "分享成功",
              success(res) {
                if (res.confirm) {
                  console.log("用户点击确定");
                  wx.navigateBack();
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
