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
  //回到当前位置
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
  // 点击callout时触发
  bindcallouttap:function(e){
    console.log("点击了标记");
    //e.detail是marker的ID
    console.log(e);

   
        wx.navigateTo({
            url: "../Devices/deviceDetail/deviceDetail",
            success: function (res) {
                res.eventChannel.emit("acceptDataFromOpenerPage", {
                    data: e.detail,
                });
            },
        });
    
  },
  createmakers:function(){
    var makerslist_pre = [];
    var makerslist = [];
    var deviceslista = deviceslist.list;
    makerslist_pre = deviceslista.filter((device)=>{
      return device.type_id == 2 || device.type_id == 6  //推测井盖
    })
    makerslist_pre.forEach((dev)=>{
      // var s = 0;
      // s++;
      console.log("这是dev的值：");
      console.log(dev.device_uni_id);
      makerslist.push(
        {
          iconPath: "../../img/smart.png",
          latitude: dev.device.device_latitue,
          longitude: dev.device.device_longitute,
          width: 30,
          height: 30,
          title:"智能井盖1",
          //测试数据ID  MH2020040901  
          // id:dev.device_uni_id,
          id:111111,
          //marker上的气泡框，与title并存时替代title
          callout:{
            content:"名称:"+dev.name+"\n"+"ID:"+dev.id+"\n"+"经度 n :"+dev.device.device_longitute+"\n"+"纬度:"+dev.device.device_latitue+"\n"+"井盖详情→",
            color:"#000",
            borderWidth:1,
            borderColor:"#EE5E78",
            borderRadius:5,
            padding:5
          }
        }
      )
    })
    this.setData({
      markers:makerslist
    })

  }
})