// miniprogram/pages/me/information/information.js
var notiservice = require("../../../model/noti").notimanager.getInstance();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    list: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    notiservice.show();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    var array = [];
    var NotiType = wx.getStorageSync("NotiType");
    var lista = notiservice.list;
    console.log("deviceslist");
    console.log(lista);
    
    for (var a in NotiType) {
      console.log(NotiType[a]);
      array.push(NotiType[a]);
    }

    this.setData({
      list: array
    });
    // var currentList = [];
    // var currentList2 = [];
    // lista.forEach(ele => {
    //   var option = {
    //     type: ele.type,
    //     name: ele.name
    //   };
    //   currentList.push(option);
    // });
    // this.setData({
    //   list: currentList
    // });
  },

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
