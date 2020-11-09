var deviceslist = require('../../model/devices').devicesmanager.getInstance();
var common = require('../../utils/NotificationCen')
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    devicelists:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    console.log( "列表是啥" + deviceslist.list )
    let inits = common.wsmanager.getInstance(); //消息中心的单例
    let deviceList = inits.eguser('deviceList', (data) => {  //消息中心的回调
      console.log("回调列表" + deviceslist.list)
      that.refresh
    });

  },
  adddevice:function(e){
    wx.scanCode({
      success(res) {
        console.log(res)
      }
    })
  },
  add_device:function(){
    wx.navigateTo({
      url: './addDevice/addDevice',
      success:function(e){

      }
    }
    )
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
    var DeviceType = wx.getStorageSync("DeviceType")
    var deviceslista = deviceslist.list;
    console.log("deviceslist" + deviceslista)
    var currentList = [];
    var currentList2 = [];
    deviceslista.forEach((ele)=>{
      currentList.push(ele.type_id)
    })
    var mySet = new Set(currentList);
    var finalArr = Array.from(mySet);

    for (var list of finalArr){
      var tot = deviceslista.filter((e)=>{
        return e.type_id == list
        console.log("过滤ing：" + e.type_id)
      })
      var online = deviceslista.filter((e) => {
        return e.type_id == list && e.device_isonline == 1
        console.log("过滤ing：" + e.type_id)
      })
      let totle = tot.length
      let onlinetotle = online.length

      var sdd = {}
      console.log("错误之前来一把" + DeviceType)
      sdd["id"] = DeviceType[list].id
      sdd["type_id"] = DeviceType[list].type_id
      sdd["type_name"] = DeviceType[list].type_name
      sdd["type_face_key"] = DeviceType[list].type_face_key
      sdd["type_img_id"] = "http://" + app.globalData.MainURL + DeviceType[list].type_img_id
      sdd["Property_1_id"] = DeviceType[list].Property_1_id
      sdd["Property_1_name"] = DeviceType[list].Property_1_name
      sdd["online"] = onlinetotle
      sdd["total"] = totle
      currentList2.push(sdd)
    }
    this.setData({
      devicelists: currentList2
    })
  },
  refresh:function(){
    var DeviceType = wx.getStorageSync("DeviceType")
    var deviceslista = deviceslist.list;
    console.log("deviceslist" + deviceslista)
    var currentList = [];
    var currentList2 = [];
    deviceslista.forEach((ele)=>{
      currentList.push(ele.type_id)
    })
    var mySet = new Set(currentList);
    var finalArr = Array.from(mySet);

    for (var list of finalArr){
      var tot = deviceslista.filter((e)=>{
        return e.type_id == list
        console.log("过滤ing：" + e.type_id)
      })
      var online = deviceslista.filter((e) => {
        return e.type_id == list && e.device_isonline == 1
        console.log("过滤ing：" + e.type_id)
      })
      let totle = tot.length
      let onlinetotle = online.length

      var sdd = {}
      console.log("错误之前来一把" + DeviceType)
      sdd["id"] = DeviceType[list].id
      sdd["type_id"] = DeviceType[list].type_id
      sdd["type_name"] = DeviceType[list].type_name
      sdd["type_face_key"] = DeviceType[list].type_face_key
      sdd["type_img_id"] = "http://" + app.globalData.MainURL + DeviceType[list].type_img_id
      sdd["Property_1_id"] = DeviceType[list].Property_1_id
      sdd["Property_1_name"] = DeviceType[list].Property_1_name
      sdd["online"] = onlinetotle
      sdd["total"] = totle
      currentList2.push(sdd)
    }
    this.setData({
      devicelists: currentList2
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },
  jumpto:function(e){
    console.log(e.currentTarget.dataset.typeid)
wx.navigateTo({
  url: '../Devices/devicelist/devicelist?typeid=' + e.currentTarget.dataset.typeid,
})
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