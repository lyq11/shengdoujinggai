// pages/Home/search/search.js
var deviceslist = require("../../../model/devices").devicesmanager.getInstance();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 设备列表
    deviceslist: [],
    // 查询结果
    searchResult:[],
    // 标签
    flag:false
  },
   //点击卡片事件
   jumpto: function (e) {
    console.log(e.currentTarget.dataset.typeid);
    
    wx.navigateTo({
        url: "../../Devices/deviceDetail/deviceDetail",
        success: function (res) {
            res.eventChannel.emit("acceptDataFromOpenerPage", {
                data: e.currentTarget.dataset.typeid,
            });
        },
    });
},
  search: function (e) {
    var that=this;
    //设备列表
    var devlist=this.data.deviceslist;
    //输入框内容
    var input=e.detail.value;
    //过滤不符合的设备
    var newResult=devlist.filter((e) => {
      // return input==e.name;
      return e.name.indexOf(input)>=0 || e.id.indexOf(input)>=0;
    });
    //搜索到的结果
    console.log(newResult);
    
    
    //传值给data
    this.setData({
      searchResult:newResult
    })
    if(newResult!=""){
      this.setData({
        flag:true
      })
    }else{
      this.setData({
        flag:false
      })
    }

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //获取设备信息赋值给data
    this.setData({
      deviceslist:deviceslist.list
    });
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