var deviceslist = require('../../model/devices').devicesmanager.getInstance();
var common = require('../../utils/NotificationCen')
var app = getApp();
//经度108.92709,纬度34.30597  测试坐标
//注册腾讯地图的账号再进行开发
Page({
  data: {
    // latitude:34.27,
    // longitude:108.93,  
    latitude:0,
    longitude:0,
    markers: [],
  },
  thisMe:function(){
    let mpCtx = wx.createMapContext("map");
    mpCtx.moveToLocation();
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
          //marker上的气泡框，与title并存时替代title
          callout:{
            content:"设备名称:"+dev.name+"\n"+"设备ID:"+dev.id+"\n"+"经度:"+longitude+"\n"+"纬度:"+latitude,
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