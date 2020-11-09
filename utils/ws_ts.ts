var common = require("/NotificationCen");
var deviceservice = require("../model/devices");
var notiservice = require("../model/noti");
var shareservice = require("../model/share");
var wsconnected = false;
interface device {
  id: string | number;
  type_id: string | number;
  co_id: string | number;
  p_id: string | number;
  device_uni_id: string | number;
  service_status: string | number;
  warning_status: string | number;
  name: any;
  device_isonline: string | number;
  device_last_online: string | number;
  pcb_ver: any;
  firmware_var: any;
  created_at: any;
  updated_at: any;
  facevalue: any;
  device: any;
}
// interface noti {
//   info: string;
//   device_id: string;
//   warning_type: string;
//   warning_id: string;
//   warning_noti_type: string;
//   current_value: string | any;
//   warning_line: string | any;
//   isread: any;
//   date: any;
// }
interface share {
  info: string;
  status: string;
  id: string;
  type: string;
  isread: any;
  date: any;
}
export class wsmanager {
  private static instance = new wsmanager();
  private noti: any;
  private times: number = 0;
  // 将 constructor 设为私有属性，防止 new 调用
  private constructor() {
    var service = common.wsmanager.getInstance();
    this.noti = service.eguser("ws");
  }

  static getInstance(): wsmanager {
    return wsmanager.instance;
  }
  heart() {
    var that = this;

    var timer = setInterval(() => {
      wx.sendSocketMessage({
        data: "heart",
        success: function() {
          console.log("服务器心跳ing");
          that.times = 0;
        },
        fail: () => {
          that.times++;
          if (that.times >= 3) {
            console.log("服务器断开连接");
            clearInterval(timer);
          }
        }
      });
    }, 10000);
  }
  start() {
    var that = this;
    var token = wx.getStorageSync("token");
    console.log("当前的token",token)
    wx.connectSocket({
      url: "wss://www.sundaytek.com/wss",
      header: {
        "content-type": "application/json",
      },
      success() {
        getApp().globalData.isconnected = true;
        console.log("链接成功");
      },
      fail() {
        getApp().globalData.isconnected = false;
        console.log("链接失败");
      }
    }),
      wx.onSocketOpen(() => {
        wsconnected = true;
        that.heart();
        getApp().globalData.isportopen = true;
      }),
      wx.onSocketError(res => {
        console.log(res)
        wsconnected = false;
        getApp().globalData.isportopen = false;
      }),
      wx.onSocketClose(()=>{
        wsconnected = false;
        getApp().globalData.isportopen = false;
      })
      wx.onSocketMessage(function(res) {

        var datas = JSON.parse(res.data as string);
        console.log('收到',datas)
        let key = datas.key;
        let c = deviceservice.devicesmanager.getInstance();
        switch (key) {
          case "register":
            switch(datas.value){
              case "1":
                that.send("update");
                break;
              case "-1":
                wx.removeStorage({
                  key: 'token',
                  success () {
                    
                  }
                })
                wx.reLaunch({
                  url:"Home",
                  success:function(e){
                    console.log(e)
                  },
                  fail:function(e){
                    console.log(e)
                  }
                })
                break;
              default:
                break;
            }
            
            break;
          case "Home":
            c.clear()
            for (let id of datas.value) {
              var device_new: device = {
                id: id.device_uni_id,
                type_id: id.type_id,
                co_id: id.co_id,
                p_id: id.p_id,
                device_uni_id: id.device_uni_id,
                service_status: id.service_status,
                warning_status: id.warning_status,
                name: id.name,
                device_isonline: id.device_isonline,
                device_last_online: id.device_last_online,
                pcb_ver: id.pcb_ver,
                firmware_var: id.firmware_var,
                created_at: id.created_at,
                updated_at: id.updated_at,
                facevalue: id.facevalue,
                device: id.devicedata
              };
              c.add(device_new);
            }
            that.noti.sendMsg("", "home");
            that.noti.sendMsg("", "deviceList");

            break;
          case "Config":
            var values = datas.value;
            var data_decode = values;
            c.edit(
              data_decode.device_uni_id,
              data_decode.key,
              data_decode.value
            );
            that.noti.sendMsg("", "home");
            that.noti.sendMsg("", "deviceList");
            that.noti.sendMsg("", "devicedetail");
            break;
          case "nofity":
            var value = datas.value;
   
            var data_decode = JSON.parse(value);
          
            var values = data_decode["data"];

            var time = new Date();
            values["date"] =
              time.toLocaleDateString() + time.toLocaleTimeString();
            values["isread"] = 0;
            var nots = notiservice.notimanager.getInstance();
            nots.add(values);
            nots.show();
            break;
          case "User":
            var value = datas.value;
            var data_decode = JSON.parse(value);
 
            var values = data_decode["data"];
            var time = new Date();
            var newvalues: share = {
              info: values.info,
              status: values.status,
              id: values.id,
              type: values.type,
              date: time.toLocaleDateString() + time.toLocaleTimeString(),
              isread: 0
            };
            var share = shareservice.sharemanager.getInstance();
            share.add(newvalues);
            share.show();
            break;
          default:
            console.log(res.data);
            break;
        }
      });
  }
  send(data: string) {
    console.log("准备发数据" + data);
    if (wsconnected) {
      // socketOpened变量在wx.onSocketOpen时设置为true
      wx.sendSocketMessage({
        data: data,
        success: function() {
          console.log(data + "数据已发给服务器");
        },
        fail: () => {
          console.log("数据发送失败");
        }
      });
    } else {
      // 发送的时候，链接还没建立
      console.log("准备不好,不能发数据");
    }
  }
  disconnect(){
    wx.onSocketClose(function(res) {
      console.log('WebSocket 已关闭！',res)
      wsconnected = false;
      getApp().globalData.isportopen = false;
      })
  }
}
