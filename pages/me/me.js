// pages/shop/user/user.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    sharecode: "",
    bp: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    
  },
  getBP: function () {
   
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
    var that = this;

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

  },
  logout:function(){
      console.log("log out");
      wx.showModal({
        title: '提示',
        content: '确定要退出吗?',
        success (res) {
          if (res.confirm) {
            console.log('用户点击确定')
            wx.closeSocket();
            wx.removeStorage({
              key: 'token',
              success (res) {
                wx.reLaunch({
                  url: '../index/index',
                })
              }
            })
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
  },

  //进入个人中心界面
  usCenten:function(){
    wx.navigateTo({
      url: './usCenten/usCenten',
    })
  },

  gototest: function (e) {
    wx.navigateTo({
      url: './orderlist/orderlist?id=' + e.currentTarget.dataset.id + '&ids=' + e.currentTarget.dataset.ids,
    })
  }
  ,
  sharepic: function () {
    wx.navigateTo({
      url: './sharepic/sharepic',
    })
  },
})