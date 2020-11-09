// app.ts
var noti = require("/utils/NotificationCen");
//
var updateDevice = 0;
var updateCompany = 0;
var updateNoti = 0;
App<IAppOption>({
  globalData: {
    MainURL: "",
    FilterData:[0,0,0]
  },
  onLaunch() {
    var that = this;
    let service = noti.wsmanager.getInstance();
    service.eguser("system");
    console.log("开始获取配置");
    console.log(that.globalData.MainURL);
    wx.request({
      url: "https://www.sundaytek.com/api/getconfig", //
      header: {
        "content-type": "application/json" // 默认值
      },
      success(res) {
        var temp = res.data as any;
        var configdatas = temp["data"];
        console.log(configdatas);
        console.log("获取成功");
        for (var config of configdatas as any) {
          //遍历服务器获取的key-value
          try {
            var Localvalue = wx.getStorageSync(config.config_name); //设置目录
            if (Localvalue == config.config_value) {
              //两个值一样
              // console.log("版本一致");
              switch (config.config_name) {
                case "MainAddress":
                  var mainURL = wx.getStorageSync("MainAddress");
                  that.globalData.MainURL = mainURL;
                  // console.log("赋值更新");
                  break;
                case "DeviceTypeVersion":
                  var sd = wx.getStorageSync("DeviceType");
                  if (!sd) {
                    // console.log("需要更新设备类型");
                    updateDevice = 1;
                  }

                  break;
                case "CompanyTypeVersion":
                  var sd = wx.getStorageSync("CompanyType");
                  if (!sd) {
                    // console.log("需要更新单位类型");
                    updateCompany = 1;
                  }
                  break;
                case "NotiTypeVersion":
                  var sd = wx.getStorageSync("NotiType");
                  if (!sd) {
                    updateNoti = 1;

                    // console.log("需要更新类型");
                  }
                  break;

                default:
                  // console.log("萱萱说,出错啦~");
                  break;
              }
            } else {
              // console.log("版本不一致");

              switch (config.config_name) {
                case "MainAddress":
            
                  that.globalData.MainURL = config.config_value;
                  console.log("i am here");
                  console.log("my value is",config.config_value)
                   console.log(that.globalData.MainURL);

                 
                  break;
                default:
                  break;
              }
              if (config.config_name == "DeviceTypeVersion") {
                // console.log("需要更新设备类型");
                updateDevice = 1;
                
              }

              if (config.config_name == "CompanyTypeVersion") {
                updateCompany = 1;
                
                // console.log("需要更新单位类型");
              }
              if (config.config_name == "NotiTypeVersion") {
                updateNoti = 1;
                
                // console.log("需要更新类型");
              }

              wx.setStorage({
                key: config.config_name,
                data: config.config_value,
                success: function() {
                  // console.log("存储成功");
                },
                fail: function() {
                  // console.log("存储失败");
                }
              });
            }
          } catch (e) {
            console.log("没有版本信息");
            wx.setStorage({
              key: config.config_name,
              data: config.config_value,
              success: function() {
                // console.log("存储成功");
              },
              fail: function() {
                // console.log("存储失败");
              }
            });
          }
        }
        that.checkUpdate();
      }
    });
  },
  checkUpdate(): void {
    var that = this;
    console.log("运行了");
    if (updateDevice == 1) {
      that.updateDeviceType();
    }
    if (updateCompany == 1) {
      that.updateCompanyType();
    }
    if (updateNoti == 1) {
      that.updateNotiType();
    }
  },
  updateDeviceType() {
    var that = this;
    console.log(that.globalData.MainURL);
    // console.log("正在更新设备类型");
    // console.log("主地址是:" + that.globalData.MainURL);
    wx.request({
      url: "https://" + that.globalData.MainURL + "/api/getdevicetype", //仅为示例，并非真实的接口地址
      method: "POST",
      header: {
        "content-type": "application/json" // 默认值
      },
      success(res) {
        var temp = res.data as any;
        var forwvalue = temp["data"];
        var lists: any = {};
        for (var device of forwvalue) {
          lists[device.id] = device;
        }
        try {
          wx.setStorageSync("DeviceType", lists);
        } catch (e) {
          console.log("出错了" + e);
        }
      }
    });
  },
  updateCompanyType() {
    var that = this;
    // console.log("正在更新公司类型");
    // console.log("主地址是:" + that.globalData.MainURL);
    wx.request({
      url: "https://" + that.globalData.MainURL + "/api/getCompanytypes", //仅为示例，并非真实的接口地址
      method: "POST",
      header: {
        "content-type": "application/json" // 默认值
      },
      success(res) {
        var temp = res.data as any;
        var forwvalue = temp["data"];
        var lists: any = {};
        for (var device of forwvalue) {
          lists[device.id] = device;
        }
        try {
          wx.setStorageSync("CompanyType", lists);
        } catch (e) {
          console.log("公司更新出错了" + e);
        }
      }
    });
  },
  updateNotiType() {
    var that = this;
    // console.log("正在更新信息类型");
    // console.log("主地址是:" + that.globalData.MainURL);
    wx.request({
      url: "https://" + that.globalData.MainURL + "/api/getNotificationstype", //仅为示例，并非真实的接口地址
      method: "POST",
      header: {
        "content-type": "application/json" // 默认值
      },
      success(res) {
        var temp = res.data as any;
        var forwvalue = temp["data"];
        var lists: any = {};
        for (var device of forwvalue) {
          lists[device.id] = device;
        }
        try {
          wx.setStorageSync("NotiType", lists);
        } catch (e) {
          console.log("出错了" + e);
        }
      }
    });
  }
});
