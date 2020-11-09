// miniprogram/pages/Devices/deviceDetail/canvasD/canvasD.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    width:0,
    height:0,
    opt: {
    },
    dd: [{}],
    tp:[{}]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    const eventChannel = this.getOpenerEventChannel()
    eventChannel.on('acceptDataFromOpenerPage', function (data) {
      that.setData({
        dd: data.data,
        tp: data.types
      })
    })

    this.setData({
      width: wx.getSystemInfoSync().windowWidth,
      height:wx.getSystemInfoSync().windowHeight
    })

    var that = this
    var pie = null
    function chart(canvas, width, height, F2){
      pie = new F2.Chart({
        el: canvas,
        width,
        height
      });
      pie.source(that.data.dd, {
        sales: {
          tickCount: 0.1
        }
      }); // data就是传入的数据。给到F2
      pie.tooltip({
        showItemMarker: false,
        onShow(ev) {
          const { items } = ev;
          items[0].name = null;
          items[0].name = items[0].title;
          items[0].value = '¥ ' + items[0].value;
        }
      }) // 是否显示工具箱
      pie.line().position(that.data.tp);
      pie.render();
    }
    this.setData({
      opt: {
        onInit: chart  //这里就是在js中用到的方法名
      }
    })
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