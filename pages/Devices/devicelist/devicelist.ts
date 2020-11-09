var deviceslist = require("../../../model/devices").devicesmanager.getInstance();
var common = require("../../../utils/NotificationCen");
var app = getApp();

function initSubMenuDisplay() {
  return ["hidden", "hidden", "hidden"];
}

//定义初始化数据，用于运行时保存
var initSubMenuHighLight = [
  ["highlight", "", "", ""], //在线 离线 休眠
  ["highlight", "", "", ""], //维保 预警 低电量
  ["highlight", "", "", ""], //设备列表
];
var myCanvasWidth: any;
var myCanvasHeight: any;
var screen = {
  height: 0,
  width: 0,
};
Page({
  data: {
    cover_id: [2, 3, 6],
    subMenuDisplay: initSubMenuDisplay(),
    subMenuHighLight: initSubMenuHighLight,
    animationData: ["", "", ""],
    devicetype: [],
    devicelist: [],
    devicelist_display: [],
    face_value_name: "",
    width: 0,
  },
  jumpto: function (e: any) {
    console.log(e.currentTarget.dataset.typeid);
    wx.navigateTo({
      url: "../deviceDetail/deviceDetail",
      success: function (res) {
        // 通过eventChannel向被打开页面传送数据
        res.eventChannel.emit("acceptDataFromOpenerPage", {
          data: e.currentTarget.dataset.typeid,
        });
      },
    });
  },
  checkfilter:function(){
    var filterdata:any[] = app.globalData.FilterData
    console.log("current filt",filterdata)
    if(filterdata != []){
      var temp = [
        ["", "", "", ""], //在线 离线 休眠
        ["", "", "", ""], //维保 预警 低电量
        ["", "", "", ""], //设备列表
      ];
      temp[0][filterdata[0]] = "highlight";
      temp[1][filterdata[1]] = "highlight";
      temp[2][filterdata[2]] = "highlight";
      app.globalData.FilterData = [0,0,0]
      initSubMenuHighLight = temp
      this.setData({
        subMenuHighLight: initSubMenuHighLight,
      });
      
      // 设置动画
      var olddevicelist = this.data.devicelist;
      this.setfilterlist(olddevicelist)
    }
  },
  onShow: function(){
    this.checkfilter();
  },
  onLoad: function (e) {
    wx.getSystemInfo({
      success: function (res) {
        myCanvasWidth = 350;
        myCanvasHeight = res.windowHeight * 0.009;
        screen.height = res.screenHeight;
        screen.width = res.screenWidth / 2;
      },
    });
    this.setData({
      canvasWidth: myCanvasWidth,
      canvasHeight: myCanvasHeight,
      width: screen.width,
    });

    var DeviceType = wx.getStorageSync("DeviceType");
    console.log("收到的传值是" + e);
    var type_id: any = 2;
    console.log("收到的传值是" + type_id);
    var type_device_list = deviceslist.list;
    var filterlist = type_device_list.filter((e: any) => {
      return e.type_id == type_id;
    });
    var currentType = DeviceType[type_id];
    var totalProp = currentType.Property_count; //总属性数量
    console.log(totalProp);
    console.log(currentType[currentType.type_face_key + "name"]);
    var getFace_value_name = currentType[currentType.type_face_key + "name"]; //关键词 高度

    this.setData({
      devicetype: DeviceType[type_id],
      devicelist: filterlist,
      devicelist_display: filterlist,
      face_value_name: getFace_value_name,
    });
    // for (var device of this.data.devicelist_display) {
    //   var typedevice: any = device;
    //   var context = wx.createCanvasContext("firstCanvas_" + typedevice.id);
    //   var full = typedevice.device.start_height;

    //   context.fillStyle = "#7ec989";
    //   context.fillRect(
    //     0,
    //     0,
    //     (typedevice.facevalue / full) * this.data.width,
    //     50
    //   );
    //   context.fillStyle = "#2793ee";
    //   context.fillRect(
    //     (typedevice.facevalue / full) * this.data.width,
    //     0,
    //     500,
    //     50
    //   );
    //   context.draw();
    // }
  },
  longtaptap: function (e: any) {
    console.log(e);
    wx.showActionSheet({
      itemList: ["分享设备", "删除设备"],
      success(res) {
        console.log(res.tapIndex);

        switch (res.tapIndex) {
          case 0:
            wx.navigateTo({
              url: "../../share/share?id=" + e.currentTarget.dataset.typeid,
              success: function (res) {
                res.eventChannel.emit("sendId", {
                  id: e.currentTarget.dataset.typeid,
                  name: e.currentTarget.dataset.name,
                });
              },
            });
            break;
          case 1:
            console.log("删除本设备" + e.currentTarget.dataset.typeid);
            var token = wx.getStorageSync("token");
            wx.request({
              url:
                "https://" + app.globalData.MainURL + "/device/unregisterDevice",
              method: "POST",
              data: {
                deviceid: e.currentTarget.dataset.typeid,
              },
              header: {
                "content-type": "application/json",
                Authorization: "Bearer " + token,
              },
              success: function (e: any) {
                console.log(e);
                if (e.data.status == 1) {
                  wx.showToast({
                    title: e.data.status_text,
                    icon: "success",
                    duration: 2000,
                  });
                }
              },
              fail: function (e) {
                console.log(e);
              },
            });
            break;
          default:
            break;
        }
      },
      fail(res) {
        console.log(res.errMsg);
      },
    });
  },
  redraw: function (e: any) {
    console.log("开启重绘画");
    for (var device of e) {
      var context = wx.createCanvasContext("firstCanvas_" + device.id);
      var full = device.device.start_height;

      context.fillStyle = "red";
      context.fillRect(0, 0, (device.facevalue / full) * this.data.width, 50);
      context.fillStyle = "blue";
      context.fillRect((device.facevalue / full) * this.data.width, 0, 500, 50);
      context.draw();
    }
  },
  tapMainMenu: function (e: any) {
    //		获取当前显示的一级菜单标识
    var index = parseInt(e.currentTarget.dataset.index);
    // 生成数组，全为hidden的，只对当前的进行显示
    var newSubMenuDisplay = initSubMenuDisplay();
    //		如果目前是显示则隐藏，反之亦反之。同时要隐藏其他的菜单
    if (this.data.subMenuDisplay[index] == "hidden") {
      newSubMenuDisplay[index] = "show";
    } else {
      newSubMenuDisplay[index] = "hidden";
    }
    // 设置为新的数组
    this.setData({
      subMenuDisplay: newSubMenuDisplay,
    });
    // 设置动画
    this.animation(index);
    // console.log(this.data.subMenuDisplay);
  },
  tapSubMenu: function (e: any) {
    // 隐藏所有一级菜单
    this.setData({
      subMenuDisplay: initSubMenuDisplay(),
    });
    console.log("before before setting",initSubMenuHighLight)
    // 处理二级菜单，首先获取当前显示的二级菜单标识
    var indexArray = e.currentTarget.dataset.index.split("-");
    console.log("keys:", indexArray);
    // 初始化状态
    // var newSubMenuHighLight = initSubMenuHighLight;
    for (var i = 0; i < initSubMenuHighLight.length; i++) {
      // 如果点中的是一级菜单，则先清空状态，即非高亮模式，然后再高亮点中的二级菜单；如果不是当前菜单，而不理会。经过这样处理就能保留其他菜单的高亮状态
      if (indexArray[0] == i) {
        for (var j = 0; j < initSubMenuHighLight[i].length; j++) {
          // 实现清空
          initSubMenuHighLight[i][j] = "";
        }
        // 将当前菜单的二级菜单设置回去
      }
    }
    console.log(
      "点击了菜单进行筛选,点击的按钮是:" + e.currentTarget.dataset.index
    );

    console.log(
      "点击了菜单进行筛选,点击的按钮是:" + e.currentTarget.dataset.filter
    );

    // 与一级菜单不同，这里不需要判断当前状态，只需要点击就给class赋予highlight即可
    initSubMenuHighLight[indexArray[0]][indexArray[1]] = "highlight";
    console.log("before setting",initSubMenuHighLight)
    // 设置为新的数组
    this.setData({
      subMenuHighLight: initSubMenuHighLight,
    });
    
    // 设置动画
    var olddevicelist = this.data.devicelist;
    this.setfilterlist(olddevicelist)
    this.animation(indexArray[0]);
  },
  setfilterlist:function(devicelist:any[]){
    var newdevicelist: any = this.menufilter(
      this.data.subMenuHighLight,
      devicelist
    );

    this.setData({
      devicelist_display: newdevicelist,
    });
  },
  menufilter: function (list: Array<any>, datalist: Array<String>) {
    console.log("lis", list);
    var first = list[0].findIndex((e: any) => {
      return e == "highlight";
    });
    var second = list[1].indexOf("highlight");
    var third = list[2].indexOf("highlight");
    console.log("f,s,t", first, second, third);
    return this.filter_dev(
      this.filter_unbt(this.filter_St(datalist, first), second),
      third
    );
  },
  filter_St: function (devices: Array<any>, prop: any) {
    if (prop != 0) {
      console.log("first change", prop);
      switch (prop) {
        case 1:
          return devices.filter((e) => {
            return e.device_isonline == 1;
          });

        case 2:
          return devices.filter((e) => {
            return e.device_isonline == 0;
          });
        case 3:
          return devices.filter((e) => {
            return e.device_isonline == 2;
          });
      }
      return devices;
    } else {
      console.log("nothing change");
      return devices;
    }
  },
  filter_unbt: function (devices: Array<any>, prop: any) {
    switch (prop) {
      case 0:
        console.log("nothing change");
        return devices;
      default:
        switch (prop) {
          case 1:
            return devices.filter((e) => {
              return e.service_status == 1;
            });
  
          case 2:
            return devices.filter((e) => {
              return e.warning_status == 1;
            });
          case 3:
            return devices.filter((e) => {
              return  parseInt(e.device.device_power) <= 500;
            });
        }
        return devices;
    }
  },
  filter_dev: function (devices: Array<any>, prop: any) {
    if (prop != 0) {
      console.log("third change", prop);
      switch (prop) {
        case 1:
          return devices.filter((e) => {
            return e.type_id == 2;  //标准井盖
          });

        case 2:
          return devices.filter((e) => {
            return e.type_id == 6;  //航天城井盖
          });
      }
      return devices;
    } else {
      console.log("nothing change");
      return devices;
    }
  },
  animation: function (index: any) {
    // 定义一个动画
    var animation = wx.createAnimation({
      duration: 400,
      timingFunction: "linear",
    });
    // 是显示还是隐藏
    var flag = this.data.subMenuDisplay[index] == "show" ? 1 : -1;
    // flag = 1;
    // console.log(flag)
    // 使之Y轴平移
    animation
      .translateY(flag * (initSubMenuHighLight[index].length * 34) + 8)
      .step();
    // 导出到数据，绑定给view属性
    var animationStr = animation.export();
    // 原来的数据
    var animationData = this.data.animationData;
    animationData[index] = (animationStr as unknown) as string;
    this.setData({
      animationData: animationData,
    });
  },
});
