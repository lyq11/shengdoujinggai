// miniprogram/pages/share/share_man.js
var app = getApp();
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
    var that = this;
    console.log(options);
    const eventChannel = this.getOpenerEventChannel();
    eventChannel.on("sendIdto", function(data) {
      console.log(data);
      wx.setNavigationBarTitle({
        title: data.data.name + "的共享管理"
      });
      that.setData({
        device: data.data
      });
      that.fresh();
    });
    this.setData({
      icon: "",
      slideButtons: [
        {
          type: "warn",
          text: "删除",
          extClass: "del",
          src: "/page/weui/cell/icon_del.svg" // icon的路径
        }
      ]
    });
  },
  slideButtonTap(e) {
    console.log("slide button tap", e.detail);
    var list = this.data.list;
    console.log("TCL: slideButtonTap -> list", list);
    var user = list[e.detail.index];
    console.log("TCL: slideButtonTap -> user", user);
    var that = this;
    wx.showModal({
      title: "确认",
      content: "确认取消共享本设备给" + user["get_users"][0].name + "吗?",
      success: function(e) {
        if (e.confirm) {
          var token = wx.getStorageSync("token");

          var up_id = that.data.device.id;
          wx.request({
            url: "http://" + app.globalData.MainURL + "/device/sharedel",
            method: "POST",
            data: {
              deviceid: up_id,
              share_id: user.id,
              tag: user.tag,
              mobile: user["get_users"][0].mobile
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
                    content: "删除成功",
                    success: function(e) {
                      if (e.confirm) {
                        that.fresh();
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
                    title: "警告",
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
        }
      },
      fail: function(e) {}
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    
  },
  fresh: function() {
    var token = wx.getStorageSync("token");
    var that = this;
    wx.request({
      url: "http://" + app.globalData.MainURL + "/device/sharelist",
      method: "POST",
      data: {
        deviceid: that.data.device.id
      },
      header: {
        "content-type": "application/json",
        Authorization: "Bearer " + token
      },
      success: function(e) {
        console.log(e);
        if (e.data.status == 1) {
          that.setData({
            list: e.data.status_text
          });
        }
      },
      fail: function(e) {
        console.log(e);
      }
    });
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
