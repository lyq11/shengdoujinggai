// pages/Home/registerDevice/registerDevice.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
  },

  registerDevice: function () {
    var token = wx.getStorageSync('token');
    console.log('token');
    console.log(token);
    
    wx.request({
      url: 'http://www.sundaytek.com/device/registerDevice',
      method: "POST",
      header: {
        "content-type": "application/json",
        Authorization: "Bearer " + token
      },
      data: {
        deviceid: '2019110511',
        device_code: '0',
      },
      success(res) {
        console.log('请求成功了');
        console.log(res.data);
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
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

  }
})