// miniprogram/pages/share/share.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    device: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options);
    var that = this;
    const eventChannel = this.getOpenerEventChannel();
    eventChannel.on("sendId", function(data) {
      console.log(data);
      wx.setNavigationBarTitle({
        title: "共享" + data.name
      });
      that.setData({
        device: data
      });
    });
  },
  gotoMan: function() {
    var that = this;
    wx.navigateTo({
      url: "./share_man",
      success: function(e) {
        e.eventChannel.emit("sendIdto", { data: that.data.device });
      }
    });
  },
  gotointernal: function() {
    var that = this;
    wx.navigateTo({
      url: "./share_internal",
      success: function(e) {
        e.eventChannel.emit("sendIdto", { data: that.data.device });
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
