var deviceslist = require('../../model/devices').devicesmanager.getInstance();
var common = require('../../utils/NotificationCen')
var app = getApp();
Page({
  data: {
    // latitude:34.27,
    // longitude:108.93,
    latitude:0,
    longitude:0,
    markers: [],
  },
  onLoad: function () {
    var that = this;

    this.createmakers();
    wx.getLocation({
      type: 'gcj02',
      success: function(res) {
        var latitude = res.latitude
        var longitude = res.longitude
        that.setData({
          latitude: latitude,
          longitude: longitude,
        })
      },
    })
  },
  createmakers:function(){
    var makerslist_pre = [];
    var makerslist = [];
    var deviceslista = deviceslist.list;
    makerslist_pre = deviceslista.filter((device)=>{
      return device.type_id == 2 || device.type_id == 6  //推测井盖
    })
    makerslist_pre.forEach((dev)=>{
      var s = 0;
      s++;
      makerslist.push(
        {
          iconPath: "../../img/smart.png",
          latitude: dev.device.device_latitue,
          longitude: dev.device.device_longitute,
          width: 30,
          height: 30,
          title:"智能井盖1",
          id:s,
          callout:{
            content:dev.name,
            color:"#EE5E7B",
            borderWidth:1,
            borderColor:"#EE5E78",
            borderRadius:5,
            padding:5,
          }
        }
      )
    })
    this.setData({
      markers:makerslist
    })

  }
})