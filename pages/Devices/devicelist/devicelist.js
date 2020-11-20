"use strict";
//导入了devices模块中的devicesmanager类中的getInstance方法
var deviceslist = require("../../../model/devices").devicesmanager.getInstance();
var common = require("../../../utils/NotificationCen");
var app = getApp();
function initSubMenuDisplay() {
    return ["hidden", "hidden", "hidden"];
}
var initSubMenuHighLight = [
    ["highlight", "", "", ""],
    ["highlight", "", "", ""],
    ["highlight", "", "", ""],
];
var myCanvasWidth;
var myCanvasHeight;
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
        //卡片的顶部颜色，与首页的卡片颜色统一
        rgb:"rgba(255, 255, 38, 1.000)"
    },
    
    //点击卡片事件
    jumpto: function (e) {
        console.log(e.currentTarget.dataset.typeid);
        wx.navigateTo({
            url: "../deviceDetail/deviceDetail",
            success: function (res) {
                res.eventChannel.emit("acceptDataFromOpenerPage", {
                    data: e.currentTarget.dataset.typeid,
                });
            },
        });
    },
    checkfilter: function () {
        var filterdata = app.globalData.FilterData;
        console.log("current filt", filterdata);
        if (filterdata != []) {
            var temp = [
                ["", "", "", ""],
                ["", "", "", ""],
                ["", "", "", ""],
            ];
            temp[0][filterdata[0]] = "highlight";
            temp[1][filterdata[1]] = "highlight";
            temp[2][filterdata[2]] = "highlight";
            app.globalData.FilterData = [0, 0, 0];
            initSubMenuHighLight = temp;
            this.setData({
                subMenuHighLight: initSubMenuHighLight,
            });
            var olddevicelist = this.data.devicelist;
            this.setfilterlist(olddevicelist);
        }
    },
    onShow: function () {
        this.checkfilter();
    },

    //这是列表详情的加载完成事件
    onLoad: function (e) {
        //获取系统信息
        wx.getSystemInfo({
            success: function (res) {
                myCanvasWidth = 350;
                myCanvasHeight = res.windowHeight * 0.009;
                screen.height = res.screenHeight;
                screen.width = res.screenWidth / 2;
            },
        });
        //画布宽高赋值
        this.setData({
            canvasWidth: myCanvasWidth,
            canvasHeight: myCanvasHeight,
            width: screen.width,
        });

        //拿到缓存数据中DeviceType的数据
        var DeviceType = wx.getStorageSync("DeviceType");
        console.log(e);
        //
        var type_id = 2;
        console.log("收到的传值是" + type_id);
        //设备列表(当前的设备是全部设备)
        var type_device_list = deviceslist.list;
        //筛选出了所有的井盖子
        var filterlist = type_device_list.filter((e) => {
            // return e.type_id == type_id;
            return e.type_id == 2 || e.type_id == 4 || e.type_id == 6 || e.type_id == 7;
        });
        console.log('aa');
        console.log(filterlist);
        //filterlist设备列表   device_power电池电量<20为电量低 
        for(let listnum=0;listnum<filterlist.length;listnum++){
            if(filterlist[listnum].device_isonline){
            if(filterlist[listnum].device_isonline==0){
                console.log('这个设备是离线的');
                this.setData({
                    rgb:"rgba(109, 105, 104, 1.000)"
                })
            }else if(filterlist[listnum].device_isonline==1){
                console.log('这个设备是在线的');
                this.setData({
                    rgb:"rgba(0, 255, 1, 1.000)"
                })
            }else if(filterlist[listnum].device_isonline==2){
                this.setData({
                    rgb:"rgba(17, 250, 219, 1.000)"
                })
            }
        }
        }
        
         
        //定义缓存数据DeviceType数组  当前拿出的数据DeviceType[2]  智能井盖----圣豆电子
        var currentType = DeviceType[type_id];
       
        //Property_count==7
        var totalProp = currentType.Property_count;
        console.log(currentType[currentType.type_face_key + "name"]);
        var getFace_value_name = currentType[currentType.type_face_key + "name"];
        this.setData({
            devicetype: DeviceType[type_id],
            devicelist: filterlist,
            devicelist_display: filterlist,
            face_value_name: getFace_value_name,
        });
    },

    //长按卡片功能
    longtaptap: function (e) {
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
                            url: "https://" + app.globalData.MainURL + "/device/unregisterDevice",
                            method: "POST",
                            data: {
                                deviceid: e.currentTarget.dataset.typeid,
                            },
                            header: {
                                "content-type": "application/json",
                                Authorization: "Bearer " + token,
                            },
                            success: function (e) {
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
    //没有调用的函数
    redraw: function (e) {
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

    //点击了顶部三个标签
    tapMainMenu: function (e) {
        var index = parseInt(e.currentTarget.dataset.index);
        var newSubMenuDisplay = initSubMenuDisplay();
        if (this.data.subMenuDisplay[index] == "hidden") {
            newSubMenuDisplay[index] = "show";
        }
        else {
            newSubMenuDisplay[index] = "hidden";
        }
        this.setData({
            subMenuDisplay: newSubMenuDisplay,
        });
        this.animation(index);
    },


    //点击了顶部的扩展栏
    tapSubMenu: function (e) {
        this.setData({
            //initSubMenuDisplay() 返回的是一个数组  ["hidden", "hidden", "hidden"]
            subMenuDisplay: initSubMenuDisplay(),
        });
       
    // initSubMenuHighLight的返回值 [
    //     ["highlight", "", "", ""],
    //     ["highlight", "", "", ""],
    //     ["highlight", "", "", ""],
    // ]
        console.log("before before setting", initSubMenuHighLight);

        var indexArray = e.currentTarget.dataset.index.split("-");
        console.log("keys:", indexArray);
        //将已经下拉的tab置为空
        for (var i = 0; i < initSubMenuHighLight.length; i++) {
            if (indexArray[0] == i) {
                for (var j = 0; j < initSubMenuHighLight[i].length; j++) {
                    initSubMenuHighLight[i][j] = "";
                }
            }
        }
        console.log("点击了菜单进行筛选,点击的按钮是:" + e.currentTarget.dataset.index);
        console.log("点击了菜单进行筛选,点击的按钮是:" + e.currentTarget.dataset.filter);
        initSubMenuHighLight[indexArray[0]][indexArray[1]] = "highlight";
        console.log("before setting", initSubMenuHighLight);
        //传递菜单已经设置好的二级菜单属性值至data
        this.setData({
            subMenuHighLight: initSubMenuHighLight,
        });
        //设备列表
        var olddevicelist = this.data.devicelist;
        //调用过滤设备列表函数  将设备列表以参数传入
        this.setfilterlist(olddevicelist);
        //调用动画函数
        this.animation(indexArray[0]);
    },
    //过滤设备列表函数
    setfilterlist: function (devicelist) {
        //调用菜单过滤函数  将二级菜单属性以及设备列表传入
        var newdevicelist = this.menufilter(this.data.subMenuHighLight, devicelist);
        this.setData({
            devicelist_display: newdevicelist,
        });
    },
    //菜单过滤函数
    menufilter: function (list, datalist) {
        // list:二级菜单属性  datalist：设备列表
        console.log("lis", list);
        //查找二级菜单属性第一列属性=="highlight"的值   findIndex返回的是索引号
        var first = list[0].findIndex((e) => {
            return e == "highlight";
        });
        //查找二级菜单属性第二列属性=="highlight"的值
        var second = list[1].indexOf("highlight");
        //查找二级菜单属性第三列属性=="highlight"的值
        var third = list[2].indexOf("highlight");
        console.log("f,s,t", first, second, third);


    //从内到外的一个三级查找  filter_St返回第一列查找结果(devices，prop)   filter_unb第二列   filter_dev第三列
        return this.filter_dev(this.filter_unbt(this.filter_St(datalist, first), second), third);
    },
    filter_St: function (devices, prop) {
        //devices接入设备 prop第一列二级菜单属性属性
        if (prop != 0) {
            //第一列改变了
            console.log("first change", prop);
            switch (prop) {
                case 1:
                    return devices.filter((e) => {
                        //在线
                        return e.device_isonline == 1;
                    });
                case 2:
                    return devices.filter((e) => {
                        //离线
                        return e.device_isonline == 0;
                    });
                case 3:
                    return devices.filter((e) => {
                        //休眠
                        return e.device_isonline == 2;
                    });
            }
            return devices;
        }
        else {
            console.log("nothing change");
            //没有改变 返回所有状态设备
            return devices;
        }
    },
    filter_unbt: function (devices, prop) {
         //devices接入设备 prop第二列二级菜单属性属性
        switch (prop) {
            case 0:
                console.log("nothing change");
            //所有设备
                return devices;
            default:
                switch (prop) {
                    case 1:
                        return devices.filter((e) => {
                            //维保
                            return e.service_status == 1;
                        });
                    case 2:
                        return devices.filter((e) => {
                            //预警
                            return e.warning_status == 1;
                        });
                    case 3:
                        return devices.filter((e) => {
                            //低电量
                            return parseInt(e.device.device_power) <= 500;
                        });
                }
                return devices;
        }
    },

    filter_dev: function (devices, prop) {
         //devices接入设备 prop第三列二级菜单属性属性
        if (prop != 0) {
            console.log("third change", prop);
            //第三列改变了
            switch (prop) {
                case 1:
                    return devices.filter((e) => {
                        //智能井盖
                        return e.type_id == 2;
                    });
                case 2:
                    return devices.filter((e) => {
                      //智能井盖子-HT
                        return e.type_id == 6;
                    });
            }
            return devices;
        }
        else {
            console.log("nothing change");
            //没有改变
            return devices;
        }
    },
    animation: function (index) {
        var animation = wx.createAnimation({
            duration: 400,
            timingFunction: "linear",
        });
        var flag = this.data.subMenuDisplay[index] == "show" ? 1 : -1;
        animation
            .translateY(flag * (initSubMenuHighLight[index].length * 34) + 8)
            .step();
        var animationStr = animation.export();
        var animationData = this.data.animationData;
        animationData[index] = animationStr;
        this.setData({
            animationData: animationData,
        });
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGV2aWNlbGlzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRldmljZWxpc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLElBQUksV0FBVyxHQUFHLE9BQU8sQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztBQUNqRixJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsZ0NBQWdDLENBQUMsQ0FBQztBQUN2RCxJQUFJLEdBQUcsR0FBRyxNQUFNLEVBQUUsQ0FBQztBQUVuQixTQUFTLGtCQUFrQjtJQUN6QixPQUFPLENBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztBQUN4QyxDQUFDO0FBR0QsSUFBSSxvQkFBb0IsR0FBRztJQUN6QixDQUFDLFdBQVcsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQztJQUN6QixDQUFDLFdBQVcsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQztJQUN6QixDQUFDLFdBQVcsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQztDQUMxQixDQUFDO0FBQ0YsSUFBSSxhQUFrQixDQUFDO0FBQ3ZCLElBQUksY0FBbUIsQ0FBQztBQUN4QixJQUFJLE1BQU0sR0FBRztJQUNYLE1BQU0sRUFBRSxDQUFDO0lBQ1QsS0FBSyxFQUFFLENBQUM7Q0FDVCxDQUFDO0FBQ0YsSUFBSSxDQUFDO0lBQ0gsSUFBSSxFQUFFO1FBQ0osUUFBUSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDbkIsY0FBYyxFQUFFLGtCQUFrQixFQUFFO1FBQ3BDLGdCQUFnQixFQUFFLG9CQUFvQjtRQUN0QyxhQUFhLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQztRQUMzQixVQUFVLEVBQUUsRUFBRTtRQUNkLFVBQVUsRUFBRSxFQUFFO1FBQ2Qsa0JBQWtCLEVBQUUsRUFBRTtRQUN0QixlQUFlLEVB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QVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUV0QyxJQUFJLGFBQWEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQztRQUM1QyxhQUFhLENBQUMsS0FBSyxDQUFDLEdBQUksWUFBa0MsQ0FBQztRQUMzRCxJQUFJLENBQUMsT0FBTyxDQUFDO1lBQ1gsYUFBYSxFQUFFLGFBQWE7U0FDN0IsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztDQUNGLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbInZhciBkZXZpY2VzbGlzdCA9IHJlcXVpcmUoXCIuLi8uLi8uLi9tb2RlbC9kZXZpY2VzXCIpLmRldmljZXNtYW5hZ2VyLmdldEluc3RhbmNlKCk7XG52YXIgY29tbW9uID0gcmVxdWlyZShcIi4uLy4uLy4uL3V0aWxzL05vdGlmaWNhdGlvbkNlblwiKTtcbnZhciBhcHAgPSBnZXRBcHAoKTtcblxuZnVuY3Rpb24gaW5pdFN1Yk1lbnVEaXNwbGF5KCkge1xuICByZXR1cm4gW1wiaGlkZGVuXCIsIFwiaGlkZGVuXCIsIFwiaGlkZGVuXCJdO1xufVxuXG4vL+WumuS5ieWIneWni+WMluaVsOaNru+8jOeUqOS6jui/kOihjOaXtuS/neWtmFxudmFyIGluaXRTdWJNZW51SGlnaExpZ2h0ID0gW1xuICBbXCJoaWdobGlnaHRcIiwgXCJcIiwgXCJcIiwgXCJcIl0sIC8v5Zyo57q/IOemu+e6vyDkvJHnnKBcbiAgW1wiaGlnaGxpZ2h0XCIsIFwiXCIsIFwiXCIsIFwiXCJdLCAvL+e7tOS/nSDpooToraYg5L2O55S16YePXG4gIFtcImhpZ2hsaWdodFwiLCBcIlwiLCBcIlwiLCBcIlwiXSwgLy/orr7lpIfliJfooahcbl07XG52YXIgbXlDYW52YXNXaWR0aDogYW55O1xudmFyIG15Q2FudmFzSGVpZ2h0OiBhbnk7XG52YXIgc2NyZWVuID0ge1xuICBoZWlnaHQ6IDAsXG4gIHdpZHRoOiAwLFxufTtcblBhZ2Uoe1xuICBkYXRhOiB7XG4gICAgY292ZXJfaWQ6IFsyLCAzLCA2XSxcbiAgICBzdWJNZW51RGlzcGxheTogaW5pdFN1Yk1lbnVEaXNwbGF5KCksXG4gICAgc3ViTWVudUhpZ2hMaWdodDogaW5pdFN1Yk1lbnVIaWdoTGlnaHQsXG4gICAgYW5pbWF0aW9uRGF0YTogW1wiXCIsIFwiXCIsIFwiXCJdLFxuICAgIGRldmljZXR5cGU6IFtdLFxuICAgIGRldmljZWxpc3Q6IFtdLFxuICAgIGRldmljZWxpc3RfZGlzcGxheTogW10sXG4gICAgZmFjZV92YWx1ZV9uYW1lOiBcIlwiLFxuICAgIHdpZHRoOiAwLFxuICB9LFxuICBqdW1wdG86IGZ1bmN0aW9uIChlOiBhbnkpIHtcbiAgICBjb25zb2xlLmxvZyhlLmN1cnJlbnRUYXJnZXQuZGF0YXNldC50eXBlaWQpO1xuICAgIHd4Lm5hdmlnYXRlVG8oe1xuICAgICAgdXJsOiBcIi4uL2RldmljZURldGFpbC9kZXZpY2VEZXRhaWxcIixcbiAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uIChyZXMpIHtcbiAgICAgICAgLy8g6YCa6L+HZXZlbnRDaGFubmVs5ZCR6KKr5omT5byA6aG16Z2i5Lyg6YCB5pWw5o2uXG4gICAgICAgIHJlcy5ldmVudENoYW5uZWwuZW1pdChcImFjY2VwdERhdGFGcm9tT3BlbmVyUGFnZVwiLCB7XG4gICAgICAgICAgZGF0YTogZS5jdXJyZW50VGFyZ2V0LmRhdGFzZXQudHlwZWlkLFxuICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgfSk7XG4gIH0sXG4gIGNoZWNrZmlsdGVyOmZ1bmN0aW9uKCl7XG4gICAgdmFyIGZpbHRlcmRhdGE6YW55W10gPSBhcHAuZ2xvYmFsRGF0YS5GaWx0ZXJEYXRhXG4gICAgY29uc29sZS5sb2coXCJjdXJyZW50IGZpbHRcIixmaWx0ZXJkYXRhKVxuICAgIGlmKGZpbHRlcmRhdGEgIT0gW10pe1xuICAgICAgdmFyIHRlbXAgPSBbXG4gICAgICAgIFtcIlwiLCBcIlwiLCBcIlwiLCBcIlwiXSwgLy/lnKjnur8g56a757q/IOS8keecoFxuICAgICAgICBbXCJcIiwgXCJcIiwgXCJcIiwgXCJcIl0sIC8v57u05L+dIOmihOitpiDkvY7nlLXph49cbiAgICAgICAgW1wiXCIsIFwiXCIsIFwiXCIsIFwiXCJdLCAvL+iuvuWkh+WIl+ihqFxuICAgICAgXTtcbiAgICAgIHRlbXBbMF1bZmlsdGVyZGF0YVswXV0gPSBcImhpZ2hsaWdodFwiO1xuICAgICAgdGVtcFsxXVtmaWx0ZXJkYXRhWzFdXSA9IFwiaGlnaGxpZ2h0XCI7XG4gICAgICB0ZW1wWzJdW2ZpbHRlcmRhdGFbMl1dID0gXCJoaWdobGlnaHRcIjtcbiAgICAgIGFwcC5nbG9iYWxEYXRhLkZpbHRlckRhdGEgPSBbMCwwLDBdXG4gICAgICBpbml0U3ViTWVudUhpZ2hMaWdodCA9IHRlbXBcbiAgICAgIHRoaXMuc2V0RGF0YSh7XG4gICAgICAgIHN1Yk1lbnVIaWdoTGlnaHQ6IGluaXRTdWJNZW51SGlnaExpZ2h0LFxuICAgICAgfSk7XG4gICAgICBcbiAgICAgIC8vIOiuvue9ruWKqOeUu1xuICAgICAgdmFyIG9sZGRldmljZWxpc3QgPSB0aGlzLmRhdGEuZGV2aWNlbGlzdDtcbiAgICAgIHRoaXMuc2V0ZmlsdGVybGlzdChvbGRkZXZpY2VsaXN0KVxuICAgIH1cbiAgfSxcbiAgb25TaG93OiBmdW5jdGlvbigpe1xuICAgIHRoaXMuY2hlY2tmaWx0ZXIoKTtcbiAgfSxcbiAgb25Mb2FkOiBmdW5jdGlvbiAoZSkge1xuICAgIHd4LmdldFN5c3RlbUluZm8oe1xuICAgICAgc3VjY2VzczogZnVuY3Rpb24gKHJlcykge1xuICAgICAgICBteUNhbnZhc1dpZHRoID0gMzUwO1xuICAgICAgICBteUNhbnZhc0hlaWdodCA9IHJlcy53aW5kb3dIZWlnaHQgKiAwLjAwOTtcbiAgICAgICAgc2NyZWVuLmhlaWdodCA9IHJlcy5zY3JlZW5IZWlnaHQ7XG4gICAgICAgIHNjcmVlbi53aWR0aCA9IHJlcy5zY3JlZW5XaWR0aCAvIDI7XG4gICAgICB9LFxuICAgIH0pO1xuICAgIHRoaXMuc2V0RGF0YSh7XG4gICAgICBjYW52YXNXaWR0aDogbXlDYW52YXNXaWR0aCxcbiAgICAgIGNhbnZhc0hlaWdodDogbXlDYW52YXNIZWlnaHQsXG4gICAgICB3aWR0aDogc2NyZWVuLndpZHRoLFxuICAgIH0pO1xuXG4gICAgdmFyIERldmljZVR5cGUgPSB3eC5nZXRTdG9yYWdlU3luYyhcIkRldmljZVR5cGVcIik7XG4gICAgY29uc29sZS5sb2coXCLmlLbliLDnmoTkvKDlgLzmmK9cIiArIGUpO1xuICAgIHZhciB0eXBlX2lkOiBhbnkgPSAyO1xuICAgIGNvbnNvbGUubG9nKFwi5pS25Yiw55qE5Lyg5YC85pivXCIgKyB0eXBlX2lkKTtcbiAgICB2YXIgdHlwZV9kZXZpY2VfbGlzdCA9IGRldmljZXNsaXN0Lmxpc3Q7XG4gICAgdmFyIGZpbHRlcmxpc3QgPSB0eXBlX2RldmljZV9saXN0LmZpbHRlcigoZTogYW55KSA9PiB7XG4gICAgICByZXR1cm4gZS50eXBlX2lkID09IHR5cGVfaWQ7XG4gICAgfSk7XG4gICAgdmFyIGN1cnJlbnRUeXBlID0gRGV2aWNlVHlwZVt0eXBlX2lkXTtcbiAgICB2YXIgdG90YWxQcm9wID0gY3VycmVudFR5cGUuUHJvcGVydHlfY291bnQ7IC8v5oC75bGe5oCn5pWw6YePXG4gICAgY29uc29sZS5sb2codG90YWxQcm9wKTtcbiAgICBjb25zb2xlLmxvZyhjdXJyZW50VHlwZVtjdXJyZW50VHlwZS50eXBlX2ZhY2Vfa2V5ICsgXCJuYW1lXCJdKTtcbiAgICB2YXIgZ2V0RmFjZV92YWx1ZV9uYW1lID0gY3VycmVudFR5cGVbY3VycmVudFR5cGUudHlwZV9mYWNlX2tleSArIFwibmFtZVwiXTsgLy/lhbPplK7or40g6auY5bqmXG5cbiAgICB0aGlzLnNldERhdGEoe1xuICAgICAgZGV2aWNldHlwZTogRGV2aWNlVHlwZVt0eXBlX2lkXSxcbiAgICAgIGRldmljZWxpc3Q6IGZpbHRlcmxpc3QsXG4gICAgICBkZXZpY2VsaXN0X2Rpc3BsYXk6IGZpbHRlcmxpc3QsXG4gICAgICBmYWNlX3ZhbHVlX25hbWU6IGdldEZhY2VfdmFsdWVfbmFtZSxcbiAgICB9KTtcbiAgICAvLyBmb3IgKHZhciBkZXZpY2Ugb2YgdGhpcy5kYXRhLmRldmljZWxpc3RfZGlzcGxheSkge1xuICAgIC8vICAgdmFyIHR5cGVkZXZpY2U6IGFueSA9IGRldmljZTtcbiAgICAvLyAgIHZhciBjb250ZXh0ID0gd3guY3JlYXRlQ2FudmFzQ29udGV4dChcImZpcnN0Q2FudmFzX1wiICsgdHlwZWRldmljZS5pZCk7XG4gICAgLy8gICB2YXIgZnVsbCA9IHR5cGVkZXZpY2UuZGV2aWNlLnN0YXJ0X2hlaWdodDtcblxuICAgIC8vICAgY29udGV4dC5maWxsU3R5bGUgPSBcIiM3ZWM5ODlcIjtcbiAgICAvLyAgIGNvbnRleHQuZmlsbFJlY3QoXG4gICAgLy8gICAgIDAsXG4gICAgLy8gICAgIDAsXG4gICAgLy8gICAgICh0eXBlZGV2aWNlLmZhY2V2YWx1ZSAvIGZ1bGwpICogdGhpcy5kYXRhLndpZHRoLFxuICAgIC8vICAgICA1MFxuICAgIC8vICAgKTtcbiAgICAvLyAgIGNvbnRleHQuZmlsbFN0eWxlID0gXCIjMjc5M2VlXCI7XG4gICAgLy8gICBjb250ZXh0LmZpbGxSZWN0KFxuICAgIC8vICAgICAodHlwZWRldmljZS5mYWNldmFsdWUgLyBmdWxsKSAqIHRoaXMuZGF0YS53aWR0aCxcbiAgICAvLyAgICAgMCxcbiAgICAvLyAgICAgNTAwLFxuICAgIC8vICAgICA1MFxuICAgIC8vICAgKTtcbiAgICAvLyAgIGNvbnRleHQuZHJhdygpO1xuICAgIC8vIH1cbiAgfSxcbiAgbG9uZ3RhcHRhcDogZnVuY3Rpb24gKGU6IGFueSkge1xuICAgIGNvbnNvbGUubG9nKGUpO1xuICAgIHd4LnNob3dBY3Rpb25TaGVldCh7XG4gICAgICBpdGVtTGlzdDogW1wi5YiG5Lqr6K6+5aSHXCIsIFwi5Yig6Zmk6K6+5aSHXCJdLFxuICAgICAgc3VjY2VzcyhyZXMpIHtcbiAgICAgICAgY29uc29sZS5sb2cocmVzLnRhcEluZGV4KTtcblxuICAgICAgICBzd2l0Y2ggKHJlcy50YXBJbmRleCkge1xuICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgIHd4Lm5hdmlnYXRlVG8oe1xuICAgICAgICAgICAgICB1cmw6IFwiLi4vLi4vc2hhcmUvc2hhcmU/aWQ9XCIgKyBlLmN1cnJlbnRUYXJnZXQuZGF0YXNldC50eXBlaWQsXG4gICAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uIChyZXMpIHtcbiAgICAgICAgICAgICAgICByZXMuZXZlbnRDaGFubmVsLmVtaXQoXCJzZW5kSWRcIiwge1xuICAgICAgICAgICAgICAgICAgaWQ6IGUuY3VycmVudFRhcmdldC5kYXRhc2V0LnR5cGVpZCxcbiAgICAgICAgICAgICAgICAgIG5hbWU6IGUuY3VycmVudFRhcmdldC5kYXRhc2V0Lm5hbWUsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwi5Yig6Zmk5pys6K6+5aSHXCIgKyBlLmN1cnJlbnRUYXJnZXQuZGF0YXNldC50eXBlaWQpO1xuICAgICAgICAgICAgdmFyIHRva2VuID0gd3guZ2V0U3RvcmFnZVN5bmMoXCJ0b2tlblwiKTtcbiAgICAgICAgICAgIHd4LnJlcXVlc3Qoe1xuICAgICAgICAgICAgICB1cmw6XG4gICAgICAgICAgICAgICAgXCJodHRwczovL1wiICsgYXBwLmdsb2JhbERhdGEuTWFpblVSTCArIFwiL2RldmljZS91bnJlZ2lzdGVyRGV2aWNlXCIsXG4gICAgICAgICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXG4gICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICBkZXZpY2VpZDogZS5jdXJyZW50VGFyZ2V0LmRhdGFzZXQudHlwZWlkLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBoZWFkZXI6IHtcbiAgICAgICAgICAgICAgICBcImNvbnRlbnQtdHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICBBdXRob3JpemF0aW9uOiBcIkJlYXJlciBcIiArIHRva2VuLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbiAoZTogYW55KSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZSk7XG4gICAgICAgICAgICAgICAgaWYgKGUuZGF0YS5zdGF0dXMgPT0gMSkge1xuICAgICAgICAgICAgICAgICAgd3guc2hvd1RvYXN0KHtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IGUuZGF0YS5zdGF0dXNfdGV4dCxcbiAgICAgICAgICAgICAgICAgICAgaWNvbjogXCJzdWNjZXNzXCIsXG4gICAgICAgICAgICAgICAgICAgIGR1cmF0aW9uOiAyMDAwLFxuICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBmYWlsOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGUpO1xuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBmYWlsKHJlcykge1xuICAgICAgICBjb25zb2xlLmxvZyhyZXMuZXJyTXNnKTtcbiAgICAgIH0sXG4gICAgfSk7XG4gIH0sXG4gIHJlZHJhdzogZnVuY3Rpb24gKGU6IGFueSkge1xuICAgIGNvbnNvbGUubG9nKFwi5byA5ZCv6YeN57uY55S7XCIpO1xuICAgIGZvciAodmFyIGRldmljZSBvZiBlKSB7XG4gICAgICB2YXIgY29udGV4dCA9IHd4LmNyZWF0ZUNhbnZhc0NvbnRleHQoXCJmaXJzdENhbnZhc19cIiArIGRldmljZS5pZCk7XG4gICAgICB2YXIgZnVsbCA9IGRldmljZS5kZXZpY2Uuc3RhcnRfaGVpZ2h0O1xuXG4gICAgICBjb250ZXh0LmZpbGxTdHlsZSA9IFwicmVkXCI7XG4gICAgICBjb250ZXh0LmZpbGxSZWN0KDAsIDAsIChkZXZpY2UuZmFjZXZhbHVlIC8gZnVsbCkgKiB0aGlzLmRhdGEud2lkdGgsIDUwKTtcbiAgICAgIGNvbnRleHQuZmlsbFN0eWxlID0gXCJibHVlXCI7XG4gICAgICBjb250ZXh0LmZpbGxSZWN0KChkZXZpY2UuZmFjZXZhbHVlIC8gZnVsbCkgKiB0aGlzLmRhdGEud2lkdGgsIDAsIDUwMCwgNTApO1xuICAgICAgY29udGV4dC5kcmF3KCk7XG4gICAgfVxuICB9LFxuICB0YXBNYWluTWVudTogZnVuY3Rpb24gKGU6IGFueSkge1xuICAgIC8vXHRcdOiOt+WPluW9k+WJjeaYvuekuueahOS4gOe6p+iPnOWNleagh+ivhlxuICAgIHZhciBpbmRleCA9IHBhcnNlSW50KGUuY3VycmVudFRhcmdldC5kYXRhc2V0LmluZGV4KTtcbiAgICAvLyDnlJ/miJDmlbDnu4TvvIzlhajkuLpoaWRkZW7nmoTvvIzlj6rlr7nlvZPliY3nmoTov5vooYzmmL7npLpcbiAgICB2YXIgbmV3U3ViTWVudURpc3BsYXkgPSBpbml0U3ViTWVudURpc3BsYXkoKTtcbiAgICAvL1x0XHTlpoLmnpznm67liY3mmK/mmL7npLrliJnpmpDol4/vvIzlj43kuYvkuqblj43kuYvjgILlkIzml7bopoHpmpDol4/lhbbku5bnmoToj5zljZVcbiAgICBpZiAodGhpcy5kYXRhLnN1Yk1lbnVEaXNwbGF5W2luZGV4XSA9PSBcImhpZGRlblwiKSB7XG4gICAgICBuZXdTdWJNZW51RGlzcGxheVtpbmRleF0gPSBcInNob3dcIjtcbiAgICB9IGVsc2Uge1xuICAgICAgbmV3U3ViTWVudURpc3BsYXlbaW5kZXhdID0gXCJoaWRkZW5cIjtcbiAgICB9XG4gICAgLy8g6K6+572u5Li65paw55qE5pWw57uEXG4gICAgdGhpcy5zZXREYXRhKHtcbiAgICAgIHN1Yk1lbnVEaXNwbGF5OiBuZXdTdWJNZW51RGlzcGxheSxcbiAgICB9KTtcbiAgICAvLyDorr7nva7liqjnlLtcbiAgICB0aGlzLmFuaW1hdGlvbihpbmRleCk7XG4gICAgLy8gY29uc29sZS5sb2codGhpcy5kYXRhLnN1Yk1lbnVEaXNwbGF5KTtcbiAgfSxcbiAgdGFwU3ViTWVudTogZnVuY3Rpb24gKGU6IGFueSkge1xuICAgIC8vIOmakOiXj+aJgOacieS4gOe6p+iPnOWNlVxuICAgIHRoaXMuc2V0RGF0YSh7XG4gICAgICBzdWJNZW51RGlzcGxheTogaW5pdFN1Yk1lbnVEaXNwbGF5KCksXG4gICAgfSk7XG4gICAgY29uc29sZS5sb2coXCJiZWZvcmUgYmVmb3JlIHNldHRpbmdcIixpbml0U3ViTWVudUhpZ2hMaWdodClcbiAgICAvLyDlpITnkIbkuoznuqfoj5zljZXvvIzpppblhYjojrflj5blvZPliY3mmL7npLrnmoTkuoznuqfoj5zljZXmoIfor4ZcbiAgICB2YXIgaW5kZXhBcnJheSA9IGUuY3VycmVudFRhcmdldC5kYXRhc2V0LmluZGV4LnNwbGl0KFwiLVwiKTtcbiAgICBjb25zb2xlLmxvZyhcImtleXM6XCIsIGluZGV4QXJyYXkpO1xuICAgIC8vIOWIneWni+WMlueKtuaAgVxuICAgIC8vIHZhciBuZXdTdWJNZW51SGlnaExpZ2h0ID0gaW5pdFN1Yk1lbnVIaWdoTGlnaHQ7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpbml0U3ViTWVudUhpZ2hMaWdodC5sZW5ndGg7IGkrKykge1xuICAgICAgLy8g5aaC5p6c54K55Lit55qE5piv5LiA57qn6I+c5Y2V77yM5YiZ5YWI5riF56m654q25oCB77yM5Y2z6Z2e6auY5Lqu5qih5byP77yM54S25ZCO5YaN6auY5Lqu54K55Lit55qE5LqM57qn6I+c5Y2V77yb5aaC5p6c5LiN5piv5b2T5YmN6I+c5Y2V77yM6ICM5LiN55CG5Lya44CC57uP6L+H6L+Z5qC35aSE55CG5bCx6IO95L+d55WZ5YW25LuW6I+c5Y2V55qE6auY5Lqu54q25oCBXG4gICAgICBpZiAoaW5kZXhBcnJheVswXSA9PSBpKSB7XG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgaW5pdFN1Yk1lbnVIaWdoTGlnaHRbaV0ubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAvLyDlrp7njrDmuIXnqbpcbiAgICAgICAgICBpbml0U3ViTWVudUhpZ2hMaWdodFtpXVtqXSA9IFwiXCI7XG4gICAgICAgIH1cbiAgICAgICAgLy8g5bCG5b2T5YmN6I+c5Y2V55qE5LqM57qn6I+c5Y2V6K6+572u5Zue5Y67XG4gICAgICB9XG4gICAgfVxuICAgIGNvbnNvbGUubG9nKFxuICAgICAgXCLngrnlh7vkuoboj5zljZXov5vooYznrZvpgIks54K55Ye755qE5oyJ6ZKu5pivOlwiICsgZS5jdXJyZW50VGFyZ2V0LmRhdGFzZXQuaW5kZXhcbiAgICApO1xuXG4gICAgY29uc29sZS5sb2coXG4gICAgICBcIueCueWHu+S6huiPnOWNlei/m+ihjOetm+mAiSzngrnlh7vnmoTmjInpkq7mmK86XCIgKyBlLmN1cnJlbnRUYXJnZXQuZGF0YXNldC5maWx0ZXJcbiAgICApO1xuXG4gICAgLy8g5LiO5LiA57qn6I+c5Y2V5LiN5ZCM77yM6L+Z6YeM5LiN6ZyA6KaB5Yik5pat5b2T5YmN54q25oCB77yM5Y+q6ZyA6KaB54K55Ye75bCx57uZY2xhc3PotYvkuohoaWdobGlnaHTljbPlj69cbiAgICBpbml0U3ViTWVudUhpZ2hMaWdodFtpbmRleEFycmF5WzBdXVtpbmRleEFycmF5WzFdXSA9IFwiaGlnaGxpZ2h0XCI7XG4gICAgY29uc29sZS5sb2coXCJiZWZvcmUgc2V0dGluZ1wiLGluaXRTdWJNZW51SGlnaExpZ2h0KVxuICAgIC8vIOiuvue9ruS4uuaWsOeahOaVsOe7hFxuICAgIHRoaXMuc2V0RGF0YSh7XG4gICAgICBzdWJNZW51SGlnaExpZ2h0OiBpbml0U3ViTWVudUhpZ2hMaWdodCxcbiAgICB9KTtcbiAgICBcbiAgICAvLyDorr7nva7liqjnlLtcbiAgICB2YXIgb2xkZGV2aWNlbGlzdCA9IHRoaXMuZGF0YS5kZXZpY2VsaXN0O1xuICAgIHRoaXMuc2V0ZmlsdGVybGlzdChvbGRkZXZpY2VsaXN0KVxuICAgIHRoaXMuYW5pbWF0aW9uKGluZGV4QXJyYXlbMF0pO1xuICB9LFxuICBzZXRmaWx0ZXJsaXN0OmZ1bmN0aW9uKGRldmljZWxpc3Q6YW55W10pe1xuICAgIHZhciBuZXdkZXZpY2VsaXN0OiBhbnkgPSB0aGlzLm1lbnVmaWx0ZXIoXG4gICAgICB0aGlzLmRhdGEuc3ViTWVudUhpZ2hMaWdodCxcbiAgICAgIGRldmljZWxpc3RcbiAgICApO1xuXG4gICAgdGhpcy5zZXREYXRhKHtcbiAgICAgIGRldmljZWxpc3RfZGlzcGxheTogbmV3ZGV2aWNlbGlzdCxcbiAgICB9KTtcbiAgfSxcbiAgbWVudWZpbHRlcjogZnVuY3Rpb24gKGxpc3Q6IEFycmF5PGFueT4sIGRhdGFsaXN0OiBBcnJheTxTdHJpbmc+KSB7XG4gICAgY29uc29sZS5sb2coXCJsaXNcIiwgbGlzdCk7XG4gICAgdmFyIGZpcnN0ID0gbGlzdFswXS5maW5kSW5kZXgoKGU6IGFueSkgPT4ge1xuICAgICAgcmV0dXJuIGUgPT0gXCJoaWdobGlnaHRcIjtcbiAgICB9KTtcbiAgICB2YXIgc2Vjb25kID0gbGlzdFsxXS5pbmRleE9mKFwiaGlnaGxpZ2h0XCIpO1xuICAgIHZhciB0aGlyZCA9IGxpc3RbMl0uaW5kZXhPZihcImhpZ2hsaWdodFwiKTtcbiAgICBjb25zb2xlLmxvZyhcImYscyx0XCIsIGZpcnN0LCBzZWNvbmQsIHRoaXJkKTtcbiAgICByZXR1cm4gdGhpcy5maWx0ZXJfZGV2KFxuICAgICAgdGhpcy5maWx0ZXJfdW5idCh0aGlzLmZpbHRlcl9TdChkYXRhbGlzdCwgZmlyc3QpLCBzZWNvbmQpLFxuICAgICAgdGhpcmRcbiAgICApO1xuICB9LFxuICBmaWx0ZXJfU3Q6IGZ1bmN0aW9uIChkZXZpY2VzOiBBcnJheTxhbnk+LCBwcm9wOiBhbnkpIHtcbiAgICBpZiAocHJvcCAhPSAwKSB7XG4gICAgICBjb25zb2xlLmxvZyhcImZpcnN0IGNoYW5nZVwiLCBwcm9wKTtcbiAgICAgIHN3aXRjaCAocHJvcCkge1xuICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgcmV0dXJuIGRldmljZXMuZmlsdGVyKChlKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gZS5kZXZpY2VfaXNvbmxpbmUgPT0gMTtcbiAgICAgICAgICB9KTtcblxuICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgcmV0dXJuIGRldmljZXMuZmlsdGVyKChlKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gZS5kZXZpY2VfaXNvbmxpbmUgPT0gMDtcbiAgICAgICAgICB9KTtcbiAgICAgICAgY2FzZSAzOlxuICAgICAgICAgIHJldHVybiBkZXZpY2VzLmZpbHRlcigoZSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGUuZGV2aWNlX2lzb25saW5lID09IDI7XG4gICAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gZGV2aWNlcztcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coXCJub3RoaW5nIGNoYW5nZVwiKTtcbiAgICAgIHJldHVybiBkZXZpY2VzO1xuICAgIH1cbiAgfSxcbiAgZmlsdGVyX3VuYnQ6IGZ1bmN0aW9uIChkZXZpY2VzOiBBcnJheTxhbnk+LCBwcm9wOiBhbnkpIHtcbiAgICBzd2l0Y2ggKHByb3ApIHtcbiAgICAgIGNhc2UgMDpcbiAgICAgICAgY29uc29sZS5sb2coXCJub3RoaW5nIGNoYW5nZVwiKTtcbiAgICAgICAgcmV0dXJuIGRldmljZXM7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICBzd2l0Y2ggKHByb3ApIHtcbiAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICByZXR1cm4gZGV2aWNlcy5maWx0ZXIoKGUpID0+IHtcbiAgICAgICAgICAgICAgcmV0dXJuIGUuc2VydmljZV9zdGF0dXMgPT0gMTtcbiAgICAgICAgICAgIH0pO1xuICBcbiAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICByZXR1cm4gZGV2aWNlcy5maWx0ZXIoKGUpID0+IHtcbiAgICAgICAgICAgICAgcmV0dXJuIGUud2FybmluZ19zdGF0dXMgPT0gMTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgIHJldHVybiBkZXZpY2VzLmZpbHRlcigoZSkgPT4ge1xuICAgICAgICAgICAgICByZXR1cm4gIHBhcnNlSW50KGUuZGV2aWNlLmRldmljZV9wb3dlcikgPD0gNTAwO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGRldmljZXM7XG4gICAgfVxuICB9LFxuICBmaWx0ZXJfZGV2OiBmdW5jdGlvbiAoZGV2aWNlczogQXJyYXk8YW55PiwgcHJvcDogYW55KSB7XG4gICAgaWYgKHByb3AgIT0gMCkge1xuICAgICAgY29uc29sZS5sb2coXCJ0aGlyZCBjaGFuZ2VcIiwgcHJvcCk7XG4gICAgICBzd2l0Y2ggKHByb3ApIHtcbiAgICAgICAgY2FzZSAxOlxuICAgICAgICAgIHJldHVybiBkZXZpY2VzLmZpbHRlcigoZSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGUudHlwZV9pZCA9PSAyOyAgLy/moIflh4bkupXnm5ZcbiAgICAgICAgICB9KTtcblxuICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgcmV0dXJuIGRldmljZXMuZmlsdGVyKChlKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gZS50eXBlX2lkID09IDY7ICAvL+iIquWkqeWfjuS6leebllxuICAgICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGRldmljZXM7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKFwibm90aGluZyBjaGFuZ2VcIik7XG4gICAgICByZXR1cm4gZGV2aWNlcztcbiAgICB9XG4gIH0sXG4gIGFuaW1hdGlvbjogZnVuY3Rpb24gKGluZGV4OiBhbnkpIHtcbiAgICAvLyDlrprkuYnkuIDkuKrliqjnlLtcbiAgICB2YXIgYW5pbWF0aW9uID0gd3guY3JlYXRlQW5pbWF0aW9uKHtcbiAgICAgIGR1cmF0aW9uOiA0MDAsXG4gICAgICB0aW1pbmdGdW5jdGlvbjogXCJsaW5lYXJcIixcbiAgICB9KTtcbiAgICAvLyDmmK/mmL7npLrov5jmmK/pmpDol49cbiAgICB2YXIgZmxhZyA9IHRoaXMuZGF0YS5zdWJNZW51RGlzcGxheVtpbmRleF0gPT0gXCJzaG93XCIgPyAxIDogLTE7XG4gICAgLy8gZmxhZyA9IDE7XG4gICAgLy8gY29uc29sZS5sb2coZmxhZylcbiAgICAvLyDkvb/kuYtZ6L205bmz56e7XG4gICAgYW5pbWF0aW9uXG4gICAgICAudHJhbnNsYXRlWShmbGFnICogKGluaXRTdWJNZW51SGlnaExpZ2h0W2luZGV4XS5sZW5ndGggKiAzNCkgKyA4KVxuICAgICAgLnN0ZXAoKTtcbiAgICAvLyDlr7zlh7rliLDmlbDmja7vvIznu5Hlrprnu5l2aWV35bGe5oCnXG4gICAgdmFyIGFuaW1hdGlvblN0ciA9IGFuaW1hdGlvbi5leHBvcnQoKTtcbiAgICAvLyDljp/mnaXnmoTmlbDmja5cbiAgICB2YXIgYW5pbWF0aW9uRGF0YSA9IHRoaXMuZGF0YS5hbmltYXRpb25EYXRhO1xuICAgIGFuaW1hdGlvbkRhdGFbaW5kZXhdID0gKGFuaW1hdGlvblN0ciBhcyB1bmtub3duKSBhcyBzdHJpbmc7XG4gICAgdGhpcy5zZXREYXRhKHtcbiAgICAgIGFuaW1hdGlvbkRhdGE6IGFuaW1hdGlvbkRhdGEsXG4gICAgfSk7XG4gIH0sXG59KTtcbiJdfQ==