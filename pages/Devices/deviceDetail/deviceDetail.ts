var deviceslist = require("../../../model/devices").devicesmanager.getInstance();
var app = getApp();
var gra1: any;
var gra2: any;
var savedata: any = {};
var savetype: any = {};
var devicedetail: any;
var common = require("../../../utils/NotificationCen");
Page({
  data: {
    opts: {},
    opt: {},
    currentdevice: {},
    currenttype: [],
    deviceProp: [{}],
    currentIndex: 0,
    markers:null
  },
  gotoSetting: function () {
    var that = this;
    wx.navigateTo({
      url: "../devicelist/deviceSetting/deviceSetting",
      success: function (res) {
        // 通过eventChannel向被打开页面传送数据
        res.eventChannel.emit("SettingValue", {
          data: that.data.currentdevice,
        });
      },
    });
  },
  pagechange: function (e: any) {
    if ("touch" === e.detail.source) {
      let currentPageIndex = this.data.currentIndex;
      currentPageIndex = (currentPageIndex + 1) % 2;
      this.setData({
        currentIndex: currentPageIndex,
      });
    }
  },
  //用户点击tab时调用
  titleClick: function (e: any) {
    let currentPageIndex = this.setData({
      //拿到当前索引并动态改变
      currentIndex: e.currentTarget.dataset.idx,
    });
    console.log(currentPageIndex);
  },
  catchTouchMove: function () {
    return false;
  },
  waitingUnlcok() {
    setTimeout(function () {
      wx.hideToast();
    }, 5000);
  },
  unlocksend() {
    var token = wx.getStorageSync("token");
    wx.request({
      url: "https://" + app.globalData.MainURL + "/device/v1/editDevice",
      method: "POST",
      data: {
        deviceid: (this.data.currentdevice as any).device_uni_id,
        type: (this.data.currentdevice as any).type_id.toLowerCase(),
        edit_options: JSON.stringify({
          islocked: "00200",
        }),
      },
      header: {
        "content-type": "application/json",
        Authorization: "Bearer " + token,
      },
      success: function (e: any) {
        console.log(e);
        var ns = e.data.status;
        switch (ns) {
          case 1:
            wx.showModal({
              title: "",
              showCancel: false,
              content: e.data.status_text,
              success(res) {
                if (res.confirm) {
                  console.log("用户点击确定");
                  wx.navigateBack();
                }
              },
            });
            break;
          case -1:
            wx.showModal({
              title: "错误",
              showCancel: false,
              content: e.data.status_text,
            });
            break;
          default:
            wx.showModal({
              title: "错误",
              showCancel: false,
              content: "未知错误",
            });
            break;
        }
      },
      fail: function (e) {
        console.log(e);
      },
    });
  },
  unlock: function () {
    if ((this.data.currentdevice as any).device_isonline == 1) {
      this.unlocksend();
      wx.showLoading({
        title: "正在开锁，等待设备响应",
      });
      setTimeout(function () {
        wx.hideLoading();
      }, 2000);
    }
    if ((this.data.currentdevice as any).device_isonline == 0) {
      wx.showToast({
        title: "设备已离线无法开锁，请检查设备",
        icon: "none",
        duration: 2000,
      });
    }
    if ((this.data.currentdevice as any).device_isonline == 2) {
      this.unlocksend();
      wx.showToast({
        title: "发送开锁指令成功，激活设备即可开锁。",
        icon: "none",
        duration: 2000,
      });
    }
  },
  drawgraph: function (id: string, e: any, x_y: any, dos: any, saved: any) {
    var token = wx.getStorageSync("token");
    // 资金占比模块-资金占比饼状图
    let pie: any = null; // 先声明一个变量用以后面做F2的new

    var fun = function pieChart(
      canvas: any,
      width: any,
      height: any,
      F2: {
        Chart: new (arg0: { el: any; width: any; height: any }) => any;
      }
    ) {
      // F2实现回调的方法，方法名用来最后赋值绑定
      //这里是为让请求接口返回数据能直接赋值给到图表数据渲染，所以用的ES6写法
      new Promise(function (resolve, reject) {
        wx.request({
          url: "http://" + app.globalData.MainURL + "/device/sludge/getRecord",
          method: "POST",
          data: {
            deviceid: id,
            type: e,
          },
          header: {
            "content-type": "application/json",
            Authorization: "Bearer " + token,
          },
          // 请求成功后执行
          success: function (res) {
            var respo: any = res.data;
            var data1 = dos(respo["status_text"]);
            saved(data1);
            console.log(savedata);
            resolve(data1); // 将数据返回给到new上进行then索取
          },
          fail: function (e) {
            console.log(e.errMsg);
            reject("hh");
          },
        });
      }).then((data) => {
        // 刚刚声明的变量就是用在这里，new到F2的指定
        pie = new F2.Chart({
          el: canvas,
          width,
          height,
        });
        pie.source(data, {
          sales: {
            tickCount: 0.1,
          },
        }); // data就是传入的数据。给到F2
        pie.tooltip(false); // 是否显示工具箱
        pie.line().position(x_y);
        pie.render();
        console.log("结束许诺");
      });
      return pie; //最后返回给到pie
      console.log("返回pie");
    };
    return fun;
  },
  make24hours: (data: any) => {
    var now = new Date();
    var cal_date = new Date();
    var datalist = [];
    for (var i = 24; i >= 1; i--) {
      cal_date.setTime(now.getTime() - i * 60 * 60 * 1000);
      console.log(cal_date.getHours());
      var temp = {
        time: cal_date.getHours() + "",
        height: data[cal_date.getHours()],
      };
      datalist.push(temp);
    }
    console.log(datalist);
    return datalist;
  },
  submitcancel: function (e: any) {
    var token = wx.getStorageSync("token");
    console.log(e);
    var id = e.currentTarget.dataset.id;
    wx.request({
      url: "http://" + app.globalData.MainURL + "/device/cancelwarning",
      method: "POST",
      data: {
        deviceid: id,
      },
      header: {
        "content-type": "application/json",
        Authorization: "Bearer " + token,
      },
      // 请求成功后执行
      success: function (res) {
        console.log(res.data);
      },
      fail: function (e) {
        console.log(e);
      },
    });
  },
  make7day: (data: any) => {
    var now = new Date();
    var cal_date = new Date();
    var datalist = new Array();
    for (var i = 6; i >= 1; i--) {
      cal_date.setTime(now.getTime() - i * 24 * 60 * 60 * 1000);
      console.log(cal_date.getDate());
      var temp = {
        days: cal_date.getDate(),
        height: data[cal_date.getDate()],
      };
      datalist.push(temp);
    }
    console.log(datalist);
    return datalist;
  },
  goandsee: function (e: any) {
    console.log(e.currentTarget.dataset.typeid);
    wx.navigateTo({
      url: "canvasD/canvasD",
      success: function (res) {
        // 通过eventChannel向被打开页面传送数据
        res.eventChannel.emit("acceptDataFromOpenerPage", {
          data: savedata[e.currentTarget.dataset.typeid],
          types: savetype[e.currentTarget.dataset.typeid],
        });
      },
    });
  },
  updatedata: function (id: any) {
    var DeviceType = wx.getStorageSync("DeviceType");
    var filterarray = deviceslist.list;
    var data = filterarray.filter((e: any) => {
      return e.device_uni_id == id;
    });
    this.setData({
      currentdevice: data[0],
      currenttype: DeviceType[data[0].type_id],
    });
    var Propertyarray = [];
    var totalProp = DeviceType[data[0].type_id].Property_count;
    for (var i = 1; i <= totalProp; i++) {
      var tempobject = {
        key: DeviceType[data[0].type_id]["Property_" + i + "_name"],
        value:
          data[0]["device"][
            DeviceType[data[0].type_id]["Property_" + i + "_id"]
          ],
      };
      Propertyarray.push(tempobject);
    }
    var filterarray = deviceslist.list;
    var data = filterarray.filter((e: any) => {
      return e.device_uni_id == id;
    });
    this.decode_prop(data);
    this.setData({
      currentdevice: data[0],
      currenttype: DeviceType[data[0].type_id],
    });
  },
  decode_prop: function (data: any) {
    var DeviceType = wx.getStorageSync("DeviceType");
    var Propertyarray = [];
    var totalProp = DeviceType[data[0].type_id].Property_count;
    for (var i = 1; i <= totalProp; i++) {
      var tempobject = {
        key: DeviceType[data[0].type_id]["Property_" + i + "_name"],
        value:
          data[0]["device"][
            DeviceType[data[0].type_id]["Property_" + i + "_id"]
          ],
      };
      Propertyarray.push(tempobject);
    }
    this.setData({
      deviceProp: Propertyarray,
    });
  },
  onLoad: function (e: any) {
    var that = this;
    let inits = common.wsmanager.getInstance(); //消息中心的单例
    var DeviceType = wx.getStorageSync("DeviceType");
    console.log(e);
    var id = "";
    const eventChannel = this.getOpenerEventChannel();
    eventChannel.on("acceptDataFromOpenerPage", function (data: any) {
      id = data.data;
      console.log("传了", id);

      devicedetail = inits.eguser("devicedetail", () => {
        //消息中心的回
        that.updatedata(id);
      });

      var filterarray = deviceslist.list;
      var data = filterarray.filter((e: any) => {
        return e.device_uni_id == id;
      });
      var marker = [{
        iconPath: "../../../img/smart.png",
        id: 0,
        title:"智能井盖1",
        latitude: data[0].device.device_latitue,
        longitude: data[0].device.device_longitute, 
        width: 30,
        height: 30
      }]
      that.setData({
        currentdevice: data[0],
        currenttype: DeviceType[data[0].type_id],
        markers :marker as any
      });
      that.decode_prop(data);
      var filterarray = deviceslist.list;
      var data = filterarray.filter((e: any) => {
        return e.device_uni_id == id;
      });
    });
  },
  onUnload: function () {
    let inits = common.wsmanager.getInstance(); //消息中心的单例
    inits.cguser(devicedetail);
  },
  onShow: function () {},
  onShareAppMessage(options) {
    if (options.from === "button") {
      // 来自页面内转发按钮
      console.log(options.target);
    }
    return {
      title: "我给你共享了一个设备,打开查看哦",
      path: "/page/user?id=123",
    };
  },
});
