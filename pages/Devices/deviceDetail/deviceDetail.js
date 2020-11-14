"use strict";
var deviceslist = require("../../../model/devices").devicesmanager.getInstance();
var app = getApp();
var gra1;
var gra2;
var savedata = {};
var savetype = {};
var devicedetail;
var common = require("../../../utils/NotificationCen");
Page({
    data: {
        opts: {},
        opt: {},
        currentdevice: {},
        currenttype: [],
        deviceProp: [{}],
        currentIndex: 0,
        markers: null,
        //地图街景标志
        imgflag:false,
        //经度
        longitude:'',
        //纬度
        latitude:'',
        //设备名称
        devName:''
    },
    //地图被点击了
    imgbtn:function(){
        console.log("地图图片被点击了");
        var flag=!this.data.imgflag
        this.setData({
            imgflag:flag
        })
    },
    //前往路线规划界面
    bindcallouttap:function(){
        var longitude=this.data.longitude;
        var latitude=this.data.latitude;
        var devName=this.data.devName;
        console.log("下面是经度和纬度的值：！！！");
        console.log(longitude);
        console.log(latitude);

        let plugin = requirePlugin('routePlan');
        let key = 'LPCBZ-ELFC2-CMDU3-CJVZV-6IGUV-U6BK2';  //使用在腾讯位置服务申请的key
        let referer = '智能井盖';   //调用插件的app的名称
        let endPoint = JSON.stringify({  //终点
          'name': devName,
          'latitude': latitude,
          'longitude': longitude
        });
        wx.navigateTo({
          url: 'plugin://routePlan/index?key=' + key + '&referer=' + referer + '&endPoint=' + endPoint + '&navigation=1'
        });
     
    },
    //前往设备设置界面
    gotoSetting: function () {
        var that = this;
        wx.navigateTo({
            url: "../devicelist/deviceSetting/deviceSetting",
            success: function (res) {
                res.eventChannel.emit("SettingValue", {
                    data: that.data.currentdevice,
                });
            },
        });
    },
    pagechange: function (e) {
        if ("touch" === e.detail.source) {
            let currentPageIndex = this.data.currentIndex;
            currentPageIndex = (currentPageIndex + 1) % 2;
            this.setData({
                currentIndex: currentPageIndex,
            });
        }
    },
    titleClick: function (e) {
        let currentPageIndex = this.setData({
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
                deviceid: this.data.currentdevice.device_uni_id,
                type: this.data.currentdevice.type_id.toLowerCase(),
                edit_options: JSON.stringify({
                    islocked: "00200",
                }),
            },
            header: {
                "content-type": "application/json",
                Authorization: "Bearer " + token,
            },
            success: function (e) {
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
        if (this.data.currentdevice.device_isonline == 1) {
            this.unlocksend();
            wx.showLoading({
                title: "正在开锁，等待设备响应",
            });
            setTimeout(function () {
                wx.hideLoading();
            }, 2000);
        }
        if (this.data.currentdevice.device_isonline == 0) {
            wx.showToast({
                title: "设备已离线无法开锁，请检查设备",
                icon: "none",
                duration: 2000,
            });
        } 
        if (this.data.currentdevice.device_isonline == 2) {
            this.unlocksend();
            wx.showToast({
                title: "发送开锁指令成功，激活设备即可开锁。",
                icon: "none",
                duration: 2000,
            });
        }
    },
    drawgraph: function (id, e, x_y, dos, saved) {
        var token = wx.getStorageSync("token");
        let pie = null;
        var fun = function pieChart(canvas, width, height, F2) {
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
                    success: function (res) {
                        var respo = res.data;
                        var data1 = dos(respo["status_text"]);
                        saved(data1);
                        console.log(savedata);
                        resolve(data1);
                    },
                    fail: function (e) {
                        console.log(e.errMsg);
                        reject("hh");
                    },
                });
            }).then((data) => {
                pie = new F2.Chart({
                    el: canvas,
                    width,
                    height,
                });
                pie.source(data, {
                    sales: {
                        tickCount: 0.1,
                    },
                });
                pie.tooltip(false);
                pie.line().position(x_y);
                pie.render();
                console.log("结束许诺");
            });
            return pie;
            console.log("返回pie");
        };
        return fun;
    },
    make24hours: (data) => {
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
    submitcancel: function (e) {
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
            success: function (res) {
                console.log(res.data);
            },
            fail: function (e) {
                console.log(e);
            },
        });
    },
    make7day: (data) => {
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
    goandsee: function (e) {
        console.log(e.currentTarget.dataset.typeid);
        wx.navigateTo({
            url: "canvasD/canvasD",
            success: function (res) {
                res.eventChannel.emit("acceptDataFromOpenerPage", {
                    data: savedata[e.currentTarget.dataset.typeid],
                    types: savetype[e.currentTarget.dataset.typeid],
                });
            },
        });
    },
    updatedata: function (id) {
        var DeviceType = wx.getStorageSync("DeviceType");
        var filterarray = deviceslist.list;
        var data = filterarray.filter((e) => {
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
                value: data[0]["device"][DeviceType[data[0].type_id]["Property_" + i + "_id"]],
            };
            Propertyarray.push(tempobject);
        }
        var filterarray = deviceslist.list;
        var data = filterarray.filter((e) => {
            return e.device_uni_id == id;
        });
        this.decode_prop(data);
        this.setData({
            currentdevice: data[0],
            currenttype: DeviceType[data[0].type_id],
        });
    },
    decode_prop: function (data) {
        var DeviceType = wx.getStorageSync("DeviceType");
        var Propertyarray = [];
        var totalProp = DeviceType[data[0].type_id].Property_count;
        for (var i = 1; i <= totalProp; i++) {
            var tempobject = {
                key: DeviceType[data[0].type_id]["Property_" + i + "_name"],
                value: data[0]["device"][DeviceType[data[0].type_id]["Property_" + i + "_id"]],
            };
            Propertyarray.push(tempobject);
        }
        this.setData({
            deviceProp: Propertyarray,
        });
    },
    onLoad: function (e) {
        var that = this;
        let inits = common.wsmanager.getInstance();
        var DeviceType = wx.getStorageSync("DeviceType");
        console.log(e);
        var id = "";
        const eventChannel = this.getOpenerEventChannel();
        eventChannel.on("acceptDataFromOpenerPage", function (data) {
            id = data.data;
            console.log("传了", id);
            devicedetail = inits.eguser("devicedetail", () => {
                that.updatedata(id);
            });
            var filterarray = deviceslist.list;
            //过滤之后的设备数据
            var data = filterarray.filter((e) => {
                return e.device_uni_id == id;
            });
            console.log('这是过滤之后的设备数据');
            console.log(data);
            that.setData({
            latitude: data[0].device.device_latitue,
            longitude: data[0].device.device_longitute,
            devName:data[0].name
            })
            // 定义marker   
            var marker = [{
                    iconPath: "../../../img/smart.png",
                    id: 0,
                    title: '点我进入路线规划',
                    latitude: data[0].device.device_latitue,
                    longitude: data[0].device.device_longitute,
                    width: 30,
                    height: 30,
                    callout: {
                        content: '点我进入路线规划',
                        color: "#000",
                        borderWidth: 1,
                        borderColor: "#EE5E78",
                        borderRadius: 5,
                        padding: 5
                      }
                   
                }];
            that.setData({
                //选中设备
                currentdevice: data[0],
                //选中设备类型
                currenttype: DeviceType[data[0].type_id],
                //标记
                markers: marker
            });
            that.decode_prop(data);
            var filterarray = deviceslist.list;
            var data = filterarray.filter((e) => {
                return e.device_uni_id == id;
            });
        });
    },
    onUnload: function () {
        let inits = common.wsmanager.getInstance();
        inits.cguser(devicedetail);
    },
    onShow: function () { },
    onShareAppMessage(options) {
        if (options.from === "button") {
            console.log(options.target);
        }
        return {
            title: "我给你共享了一个设备,打开查看哦",
            path: "/page/user?id=123",
        };
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGV2aWNlRGV0YWlsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGV2aWNlRGV0YWlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxJQUFJLFdBQVcsR0FBRyxPQUFPLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxjQUFjLENBQUMsV0FBVyxFQUFFLENBQUM7QUFDakYsSUFBSSxHQUFHLEdBQUcsTUFBTSxFQUFFLENBQUM7QUFDbkIsSUFBSSxJQUFTLENBQUM7QUFDZCxJQUFJLElBQVMsQ0FBQztBQUNkLElBQUksUUFBUSxHQUFRLEVBQUUsQ0FBQztBQUN2QixJQUFJLFFBQVEsR0FBUSxFQUFFLENBQUM7QUFDdkIsSUFBSSxZQUFpQixDQUFDO0FBQ3RCLElBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDO0FBQ3ZELElBQUksQ0FBQztJQUNILElBQUksRUFBRTtRQUNKLElBQUksRUFBRSxFQUFFO1FBQ1IsR0FBRyxFQUFFLEVBQUU7UUFDUCxhQUFhLEVBQUUsRUFBRTtRQUNqQixXQUFXLEVBQUUsRUFBRTtRQUNmLFVBQVUsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUNoQixZQUFZLEVBQUUsQ0FBQztRQUNmLE9BQU8sRUFBQyxJQUFJO0tBQ2I7SUFDRCxXQUFXLEVBQUU7UUFDWCxJQUFJLElBQUksR0FBRyxJQUFJLENBQUM7UUFDaEIsRUFBRSxDQUFDLFVBQVUsQ0FBQztZQUNaLEdBQUcsRUFBRSwyQ0FBMkM7WUFDaEQsT0FBTyxFQUFFLFVBQVUsR0FBRztnQkFFcEIsR0FBRyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFO29CQUNwQyxJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhO2lCQUM5QixDQUFDLENBQUM7WUFDTCxDQUFDO1NBQ0YsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUNELFVBQVUsRUFBRSxVQUFVLENBQU07UUFDMUIsSUFBSSxPQUFPLEtBQUssQ0FBQyxDQUFDLE1BQU0sQ0FB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RTtpQkFDWCxDQUFDLENBQUE7WUFDRixJQUFJLENBQUMsT0FBTyxDQUFDO2dCQUNYLGFBQWEsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUN0QixXQUFXLEVBQUUsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUM7Z0JBQ3hDLE9BQU8sRUFBRSxNQUFhO2FBQ3ZCLENBQUMsQ0FBQztZQUNILElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDdkIsSUFBSSxXQUFXLEdBQUcsV0FBVyxDQUFDLElBQUksQ0FBQztZQUNuQyxJQUFJLElBQUksR0FBRyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBTSxFQUFFLEVBQUU7Z0JBQ3ZDLE9BQU8sQ0FBQyxDQUFDLGFBQWEsSUFBSSxFQUFFLENBQUM7WUFDL0IsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFDRCxRQUFRLEVBQUU7UUFDUixJQUFJLEtBQUssR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQzNDLEtBQUssQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDN0IsQ0FBQztJQUNELE1BQU0sRUFBRSxjQUFhLENBQUM7SUFDdEIsaUJBQWlCLENBQUMsT0FBTztRQUN2QixJQUFJLE9BQU8sQ0FBQyxJQUFJLEtBQUssUUFBUSxFQUFFO1lBRTdCLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQzdCO1FBQ0QsT0FBTztZQUNMLEtBQUssRUFBRSxrQkFBa0I7WUFDekIsSUFBSSxFQUFFLG1CQUFtQjtTQUMxQixDQUFDO0lBQ0osQ0FBQztDQUNGLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbInZhciBkZXZpY2VzbGlzdCA9IHJlcXVpcmUoXCIuLi8uLi8uLi9tb2RlbC9kZXZpY2VzXCIpLmRldmljZXNtYW5hZ2VyLmdldEluc3RhbmNlKCk7XG52YXIgYXBwID0gZ2V0QXBwKCk7XG52YXIgZ3JhMTogYW55O1xudmFyIGdyYTI6IGFueTtcbnZhciBzYXZlZGF0YTogYW55ID0ge307XG52YXIgc2F2ZXR5cGU6IGFueSA9IHt9O1xudmFyIGRldmljZWRldGFpbDogYW55O1xudmFyIGNvbW1vbiA9IHJlcXVpcmUoXCIuLi8uLi8uLi91dGlscy9Ob3RpZmljYXRpb25DZW5cIik7XG5QYWdlKHtcbiAgZGF0YToge1xuICAgIG9wdHM6IHt9LFxuICAgIG9wdDoge30sXG4gICAgY3VycmVudGRldmljZToge30sXG4gICAgY3VycmVudHR5cGU6IFtdLFxuICAgIGRldmljZVByb3A6IFt7fV0sXG4gICAgY3VycmVudEluZGV4OiAwLFxuICAgIG1hcmtlcnM6bnVsbFxuICB9LFxuICBnb3RvU2V0dGluZzogZnVuY3Rpb24gKCkge1xuICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICB3eC5uYXZpZ2F0ZVRvKHtcbiAgICAgIHVybDogXCIuLi9kZXZpY2VsaXN0L2RldmljZVNldHRpbmcvZGV2aWNlU2V0dGluZ1wiLFxuICAgICAgc3VjY2VzczogZnVuY3Rpb24gKHJlcykge1xuICAgICAgICAvLyDpgJrov4dldmVudENoYW5uZWzlkJHooqvmiZPlvIDpobXpnaLkvKDpgIHmlbDmja5cbiAgICAgICAgcmVzLmV2ZW50Q2hhbm5lbC5lbWl0KFwiU2V0dGluZ1ZhbHVlXCIsIHtcbiAgICAgICAgICBkYXRhOiB0aGF0LmRhdGEuY3VycmVudGRldmljZSxcbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgIH0pO1xuICB9LFxuICBwYWdlY2hhbmdlOiBmdW5jdGlvbiAoZTogYW55KSB7XG4gICAgaWYgKFwidG91Y2hcIiA9PT0gZS5kZXRhaWwuc291cmNlKSB7XG4gICAgICBsZXQgY3VycmVudFBhZ2VJbmRleCA9IHRoaXMuZGF0YS5jdXJyZW50SW5kZXg7XG4gICAgICBjdXJyZW50UGFnZUluZGV4ID0gKGN1cnJlbnRQYWdlSW5kZXggKyAxKSAlIDI7XG4gICAgICB0aGlzLnNldERhdGEoe1xuICAgICAgICBjdXJyZW50SW5kZXg6IGN1cnJlbnRQYWdlSW5kZXgsXG4gICAgICB9KTtcbiAgICB9XG4gIH0sXG4gIC8v55So5oi354K55Ye7dGFi5pe26LCD55SoXG4gIHRpdGxlQ2xpY2s6IGZ1bmN0aW9uIChlOiBhbnkpIHtcbiAgICBsZXQgY3VycmVudFBhZ2VJbmRleCA9IHRoaXMuc2V0RGF0YSh7XG4gICAgICAvL+aLv+WIsOW9k+WJjee0ouW8leW5tuWKqOaAgeaUueWPmFxuICAgICAgY3VycmVudEluZGV4OiBlLmN1cnJlbnRUYXJnZXQuZGF0YXNldC5pZHgsXG4gICAgfSk7XG4gICAgY29uc29sZS5sb2coY3VycmVudFBhZ2VJbmRleCk7XG4gIH0sXG4gIGNhdGNoVG91Y2hNb3ZlOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9LFxuICB3YWl0aW5nVW5sY29rKCkge1xuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgd3guaGlkZVRvYXN0KCk7XG4gICAgfSwgNTAwMCk7XG4gIH0sXG4gIHVubG9ja3NlbmQoKSB7XG4gICAgdmFyIHRva2VuID0gd3guZ2V0U3RvcmFnZVN5bmMoXCJ0b2tlblwiKTtcbiAgICB3eC5yZXF1ZXN0KHtcbiAgICAgIHVybDogXCJodHRwczovL1wiICsgYXBwLmdsb2JhbERhdGEuTWFpblVSTCArIFwiL2RldmljZS92MS9lZGl0RGV2aWNlXCIsXG4gICAgICBtZXRob2Q6IFwiUE9TVFwiLFxuICAgICAgZGF0YToge1xuICAgICAgICBkZXZpY2VpZDogKHRoaXMuZGF0YS5jdXJyZW50ZGV2aWNlIGFzIGFueSkuZGV2aWNlX3VuaV9pZCxcbiAgICAgICAgdHlwZTogKHRoaXMuZGF0YS5jdXJyZW50ZGV2aWNlIGFzIGFueSkudHlwZV9pZC50b0xvd2VyQ2FzZSgpLFxuICAgICAgICBlZGl0X29wdGlvbnM6IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICBpc2xvY2tlZDogXCIwMDIwMFwiLFxuICAgICAgICB9KSxcbiAgICAgIH0sXG4gICAgICBoZWFkZXI6IHtcbiAgICAgICAgXCJjb250ZW50LXR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgIEF1dGhvcml6YXRpb246IFwiQmVhcmVyIFwiICsgdG9rZW4sXG4gICAgICB9LFxuICAgICAgc3VjY2VzczogZnVuY3Rpb24gKGU6IGFueSkge1xuICAgICAgICBjb25zb2xlLmxvZyhlKTtcbiAgICAgICAgdmFyIG5zID0gZS5kYXRhLnN0YXR1cztcbiAgICAgICAgc3dpdGNoIChucykge1xuICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgIHd4LnNob3dNb2RhbCh7XG4gICAgICAgICAgICAgIHRpdGxlOiBcIlwiLFxuICAgICAgICAgICAgICBzaG93Q2FuY2VsOiBmYWxzZSxcbiAgICAgICAgICAgICAgY29udGVudDogZS5kYXRhLnN0YXR1c190ZXh0LFxuICAgICAgICAgICAgICBzdWNjZXNzKHJlcykge1xuICAgICAgICAgICAgICAgIGlmIChyZXMuY29uZmlybSkge1xuICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCLnlKjmiLfngrnlh7vnoa7lrppcIik7XG4gICAgICAgICAgICAgICAgICB3eC5uYXZpZ2F0ZUJhY2soKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgLTE6XG4gICAgICAgICAgICB3eC5zaG93TW9kYWwoe1xuICAgICAgICAgICAgICB0aXRsZTogXCLplJnor69cIixcbiAgICAgICAgICAgICAgc2hvd0NhbmNlbDogZmFsc2UsXG4gICAgICAgICAgICAgIGNvbnRlbnQ6IGUuZGF0YS5zdGF0dXNfdGV4dCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHd4LnNob3dNb2RhbCh7XG4gICAgICAgICAgICAgIHRpdGxlOiBcIumUmeivr1wiLFxuICAgICAgICAgICAgICBzaG93Q2FuY2VsOiBmYWxzZSxcbiAgICAgICAgICAgICAgY29udGVudDogXCLmnKrnn6XplJnor69cIixcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBmYWlsOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICBjb25zb2xlLmxvZyhlKTtcbiAgICAgIH0sXG4gICAgfSk7XG4gIH0sXG4gIHVubG9jazogZnVuY3Rpb24gKCkge1xuICAgIGlmICgodGhpcy5kYXRhLmN1cnJlbnRkZXZpY2UgYXMgYW55KS5kZXZpY2VfaXNvbmxpbmUgPT0gMSkge1xuICAgICAgdGhpcy51bmxvY2tzZW5kKCk7XG4gICAgICB3eC5zaG93TG9hZGluZyh7XG4gICAgICAgIHRpdGxlOiBcIuato+WcqOW8gOmUge+8jOetieW+heiuvuWkh+WTjeW6lFwiLFxuICAgICAgfSk7XG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgd3guaGlkZUxvYWRpbmcoKTtcbiAgICAgIH0sIDIwMDApO1xuICAgIH1cbiAgICBpZiAoKHRoaXMuZGF0YS5jdXJyZW50ZGV2aWNlIGFzIGFueSkuZGV2aWNlX2lzb25saW5lID09IDApIHtcbiAgICAgIHd4LnNob3dUb2FzdCh7XG4gICAgICAgIHRpdGxlOiBcIuiuvuWkh+W3suemu+e6v+aXoOazleW8gOmUge+8jOivt+ajgOafpeiuvuWkh1wiLFxuICAgICAgICBpY29uOiBcIm5vbmVcIixcbiAgICAgICAgZHVyYXRpb246IDIwMDAsXG4gICAgICB9KTtcbiAgICB9XG4gICAgaWYgKCh0aGlzLmRhdGEuY3VycmVudGRldmljZSBhcyBhbnkpLmRldmljZV9pc29ubGluZSA9PSAyKSB7XG4gICAgICB0aGlzLnVubG9ja3NlbmQoKTtcbiAgICAgIHd4LnNob3dUb2FzdCh7XG4gICAgICAgIHRpdGxlOiBcIuWPkemAgeW8gOmUgeaMh+S7pOaIkOWKn++8jOa/gOa0u+iuvuWkh+WNs+WPr+W8gOmUgeOAglwiLFxuICAgICAgICBpY29uOiBcIm5vbmVcIixcbiAgICAgICAgZHVyYXRpb246IDIwMDAsXG4gICAgICB9KTtcbiAgICB9XG4gIH0sXG4gIGRyYXdncmFwaDogZnVuY3Rpb24gKGlkOiBzdHJpbmcsIGU6IGFueSwgeF95OiBhbnksIGRvczogYW55LCBzYXZlZDogYW55KSB7XG4gICAgdmFyIHRva2VuID0gd3guZ2V0U3RvcmFnZVN5bmMoXCJ0b2tlblwiKTtcbiAgICAvLyDotYTph5HljaDmr5TmqKHlnZct6LWE6YeR5Y2g5q+U6aW854q25Zu+XG4gICAgbGV0IHBpZTogYW55ID0gbnVsbDsgLy8g5YWI5aOw5piO5LiA5Liq5Y+Y6YeP55So5Lul5ZCO6Z2i5YGaRjLnmoRuZXdcblxuICAgIHZhciBmdW4gPSBmdW5jdGlvbiBwaWVDaGFydChcbiAgICAgIGNhbnZhczogYW55LFxuICAgICAgd2lkdGg6IGFueSxcbiAgICAgIGhlaWdodDogYW55LFxuICAgICAgRjI6IHtcbiAgICAgICAgQ2hhcnQ6IG5ldyAoYXJnMDogeyBlbDogYW55OyB3aWR0aDogYW55OyBoZWlnaHQ6IGFueSB9KSA9PiBhbnk7XG4gICAgICB9XG4gICAgKSB7XG4gICAgICAvLyBGMuWunueOsOWbnuiwg+eahOaWueazle+8jOaWueazleWQjeeUqOadpeacgOWQjui1i+WAvOe7keWumlxuICAgICAgLy/ov5nph4zmmK/kuLrorqnor7fmsYLmjqXlj6Pov5Tlm57mlbDmja7og73nm7TmjqXotYvlgLznu5nliLDlm77ooajmlbDmja7muLLmn5PvvIzmiYDku6XnlKjnmoRFUzblhpnms5VcbiAgICAgIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgd3gucmVxdWVzdCh7XG4gICAgICAgICAgdXJsOiBcImh0dHA6Ly9cIiArIGFwcC5nbG9iYWxEYXRhLk1haW5VUkwgKyBcIi9kZXZpY2Uvc2x1ZGdlL2dldFJlY29yZFwiLFxuICAgICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXG4gICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgZGV2aWNlaWQ6IGlkLFxuICAgICAgICAgICAgdHlwZTogZSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIGhlYWRlcjoge1xuICAgICAgICAgICAgXCJjb250ZW50LXR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICBBdXRob3JpemF0aW9uOiBcIkJlYXJlciBcIiArIHRva2VuLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgLy8g6K+35rGC5oiQ5Yqf5ZCO5omn6KGMXG4gICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24gKHJlcykge1xuICAgICAgICAgICAgdmFyIHJlc3BvOiBhbnkgPSByZXMuZGF0YTtcbiAgICAgICAgICAgIHZhciBkYXRhMSA9IGRvcyhyZXNwb1tcInN0YXR1c190ZXh0XCJdKTtcbiAgICAgICAgICAgIHNhdmVkKGRhdGExKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHNhdmVkYXRhKTtcbiAgICAgICAgICAgIHJlc29sdmUoZGF0YTEpOyAvLyDlsIbmlbDmja7ov5Tlm57nu5nliLBuZXfkuIrov5vooYx0aGVu57Si5Y+WXG4gICAgICAgICAgfSxcbiAgICAgICAgICBmYWlsOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coZS5lcnJNc2cpO1xuICAgICAgICAgICAgcmVqZWN0KFwiaGhcIik7XG4gICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgICB9KS50aGVuKChkYXRhKSA9PiB7XG4gICAgICAgIC8vIOWImuWImuWjsOaYjueahOWPmOmHj+WwseaYr+eUqOWcqOi/memHjO+8jG5ld+WIsEYy55qE5oyH5a6aXG4gICAgICAgIHBpZSA9IG5ldyBGMi5DaGFydCh7XG4gICAgICAgICAgZWw6IGNhbnZhcyxcbiAgICAgICAgICB3aWR0aCxcbiAgICAgICAgICBoZWlnaHQsXG4gICAgICAgIH0pO1xuICAgICAgICBwaWUuc291cmNlKGRhdGEsIHtcbiAgICAgICAgICBzYWxlczoge1xuICAgICAgICAgICAgdGlja0NvdW50OiAwLjEsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSk7IC8vIGRhdGHlsLHmmK/kvKDlhaXnmoTmlbDmja7jgILnu5nliLBGMlxuICAgICAgICBwaWUudG9vbHRpcChmYWxzZSk7IC8vIOaYr+WQpuaYvuekuuW3peWFt+eusVxuICAgICAgICBwaWUubGluZSgpLnBvc2l0aW9uKHhfeSk7XG4gICAgICAgIHBpZS5yZW5kZXIoKTtcbiAgICAgICAgY29uc29sZS5sb2coXCLnu5PmnZ/orrjor7pcIik7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBwaWU7IC8v5pyA5ZCO6L+U5Zue57uZ5YiwcGllXG4gICAgICBjb25zb2xlLmxvZyhcIui/lOWbnnBpZVwiKTtcbiAgICB9O1xuICAgIHJldHVybiBmdW47XG4gIH0sXG4gIG1ha2UyNGhvdXJzOiAoZGF0YTogYW55KSA9PiB7XG4gICAgdmFyIG5vdyA9IG5ldyBEYXRlKCk7XG4gICAgdmFyIGNhbF9kYXRlID0gbmV3IERhdGUoKTtcbiAgICB2YXIgZGF0YWxpc3QgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMjQ7IGkgPj0gMTsgaS0tKSB7XG4gICAgICBjYWxfZGF0ZS5zZXRUaW1lKG5vdy5nZXRUaW1lKCkgLSBpICogNjAgKiA2MCAqIDEwMDApO1xuICAgICAgY29uc29sZS5sb2coY2FsX2RhdGUuZ2V0SG91cnMoKSk7XG4gICAgICB2YXIgdGVtcCA9IHtcbiAgICAgICAgdGltZTogY2FsX2RhdGUuZ2V0SG91cnMoKSArIFwiXCIsXG4gICAgICAgIGhlaWdodDogZGF0YVtjYWxfZGF0ZS5nZXRIb3VycygpXSxcbiAgICAgIH07XG4gICAgICBkYXRhbGlzdC5wdXNoKHRlbXApO1xuICAgIH1cbiAgICBjb25zb2xlLmxvZyhkYXRhbGlzdCk7XG4gICAgcmV0dXJuIGRhdGFsaXN0O1xuICB9LFxuICBzdWJtaXRjYW5jZWw6IGZ1bmN0aW9uIChlOiBhbnkpIHtcbiAgICB2YXIgdG9rZW4gPSB3eC5nZXRTdG9yYWdlU3luYyhcInRva2VuXCIpO1xuICAgIGNvbnNvbGUubG9nKGUpO1xuICAgIHZhciBpZCA9IGUuY3VycmVudFRhcmdldC5kYXRhc2V0LmlkO1xuICAgIHd4LnJlcXVlc3Qoe1xuICAgICAgdXJsOiBcImh0dHA6Ly9cIiArIGFwcC5nbG9iYWxEYXRhLk1haW5VUkwgKyBcIi9kZXZpY2UvY2FuY2Vsd2FybmluZ1wiLFxuICAgICAgbWV0aG9kOiBcIlBPU1RcIixcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgZGV2aWNlaWQ6IGlkLFxuICAgICAgfSxcbiAgICAgIGhlYWRlcjoge1xuICAgICAgICBcImNvbnRlbnQtdHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgQXV0aG9yaXphdGlvbjogXCJCZWFyZXIgXCIgKyB0b2tlbixcbiAgICAgIH0sXG4gICAgICAvLyDor7fmsYLmiJDlip/lkI7miafooYxcbiAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uIChyZXMpIHtcbiAgICAgICAgY29uc29sZS5sb2cocmVzLmRhdGEpO1xuICAgICAgfSxcbiAgICAgIGZhaWw6IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGUpO1xuICAgICAgfSxcbiAgICB9KTtcbiAgfSxcbiAgbWFrZTdkYXk6IChkYXRhOiBhbnkpID0+IHtcbiAgICB2YXIgbm93ID0gbmV3IERhdGUoKTtcbiAgICB2YXIgY2FsX2RhdGUgPSBuZXcgRGF0ZSgpO1xuICAgIHZhciBkYXRhbGlzdCA9IG5ldyBBcnJheSgpO1xuICAgIGZvciAodmFyIGkgPSA2OyBpID49IDE7IGktLSkge1xuICAgICAgY2FsX2RhdGUuc2V0VGltZShub3cuZ2V0VGltZSgpIC0gaSAqIDI0ICogNjAgKiA2MCAqIDEwMDApO1xuICAgICAgY29uc29sZS5sb2coY2FsX2RhdGUuZ2V0RGF0ZSgpKTtcbiAgICAgIHZhciB0ZW1wID0ge1xuICAgICAgICBkYXlzOiBjYWxfZGF0ZS5nZXREYXRlKCksXG4gICAgICAgIGhlaWdodDogZGF0YVtjYWxfZGF0ZS5nZXREYXRlKCldLFxuICAgICAgfTtcbiAgICAgIGRhdGFsaXN0LnB1c2godGVtcCk7XG4gICAgfVxuICAgIGNvbnNvbGUubG9nKGRhdGFsaXN0KTtcbiAgICByZXR1cm4gZGF0YWxpc3Q7XG4gIH0sXG4gIGdvYW5kc2VlOiBmdW5jdGlvbiAoZTogYW55KSB7XG4gICAgY29uc29sZS5sb2coZS5jdXJyZW50VGFyZ2V0LmRhdGFzZXQudHlwZWlkKTtcbiAgICB3eC5uYXZpZ2F0ZVRvKHtcbiAgICAgIHVybDogXCJjYW52YXNEL2NhbnZhc0RcIixcbiAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uIChyZXMpIHtcbiAgICAgICAgLy8g6YCa6L+HZXZlbnRDaGFubmVs5ZCR6KKr5omT5byA6aG16Z2i5Lyg6YCB5pWw5o2uXG4gICAgICAgIHJlcy5ldmVudENoYW5uZWwuZW1pdChcImFjY2VwdERhdGFGcm9tT3BlbmVyUGFnZVwiLCB7XG4gICAgICAgICAgZGF0YTogc2F2ZWRhdGFbZS5jdXJyZW50VGFyZ2V0LmRhdGFzZXQudHlwZWlkXSxcbiAgICAgICAgICB0eXBlczogc2F2ZXR5cGVbZS5jdXJyZW50VGFyZ2V0LmRhdGFzZXQudHlwZWlkXSxcbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgIH0pO1xuICB9LFxuICB1cGRhdGVkYXRhOiBmdW5jdGlvbiAoaWQ6IGFueSkge1xuICAgIHZhciBEZXZpY2VUeXBlID0gd3guZ2V0U3RvcmFnZVN5bmMoXCJEZXZpY2VUeXBlXCIpO1xuICAgIHZhciBmaWx0ZXJhcnJheSA9IGRldmljZXNsaXN0Lmxpc3Q7XG4gICAgdmFyIGRhdGEgPSBmaWx0ZXJhcnJheS5maWx0ZXIoKGU6IGFueSkgPT4ge1xuICAgICAgcmV0dXJuIGUuZGV2aWNlX3VuaV9pZCA9PSBpZDtcbiAgICB9KTtcbiAgICB0aGlzLnNldERhdGEoe1xuICAgICAgY3VycmVudGRldmljZTogZGF0YVswXSxcbiAgICAgIGN1cnJlbnR0eXBlOiBEZXZpY2VUeXBlW2RhdGFbMF0udHlwZV9pZF0sXG4gICAgfSk7XG4gICAgdmFyIFByb3BlcnR5YXJyYXkgPSBbXTtcbiAgICB2YXIgdG90YWxQcm9wID0gRGV2aWNlVHlwZVtkYXRhWzBdLnR5cGVfaWRdLlByb3BlcnR5X2NvdW50O1xuICAgIGZvciAodmFyIGkgPSAxOyBpIDw9IHRvdGFsUHJvcDsgaSsrKSB7XG4gICAgICB2YXIgdGVtcG9iamVjdCA9IHtcbiAgICAgICAga2V5OiBEZXZpY2VUeXBlW2RhdGFbMF0udHlwZV9pZF1bXCJQcm9wZXJ0eV9cIiArIGkgKyBcIl9uYW1lXCJdLFxuICAgICAgICB2YWx1ZTpcbiAgICAgICAgICBkYXRhWzBdW1wiZGV2aWNlXCJdW1xuICAgICAgICAgICAgRGV2aWNlVHlwZVtkYXRhWzBdLnR5cGVfaWRdW1wiUHJvcGVydHlfXCIgKyBpICsgXCJfaWRcIl1cbiAgICAgICAgICBdLFxuICAgICAgfTtcbiAgICAgIFByb3BlcnR5YXJyYXkucHVzaCh0ZW1wb2JqZWN0KTtcbiAgICB9XG4gICAgdmFyIGZpbHRlcmFycmF5ID0gZGV2aWNlc2xpc3QubGlzdDtcbiAgICB2YXIgZGF0YSA9IGZpbHRlcmFycmF5LmZpbHRlcigoZTogYW55KSA9PiB7XG4gICAgICByZXR1cm4gZS5kZXZpY2VfdW5pX2lkID09IGlkO1xuICAgIH0pO1xuICAgIHRoaXMuZGVjb2RlX3Byb3AoZGF0YSk7XG4gICAgdGhpcy5zZXREYXRhKHtcbiAgICAgIGN1cnJlbnRkZXZpY2U6IGRhdGFbMF0sXG4gICAgICBjdXJyZW50dHlwZTogRGV2aWNlVHlwZVtkYXRhWzBdLnR5cGVfaWRdLFxuICAgIH0pO1xuICB9LFxuICBkZWNvZGVfcHJvcDogZnVuY3Rpb24gKGRhdGE6IGFueSkge1xuICAgIHZhciBEZXZpY2VUeXBlID0gd3guZ2V0U3RvcmFnZVN5bmMoXCJEZXZpY2VUeXBlXCIpO1xuICAgIHZhciBQcm9wZXJ0eWFycmF5ID0gW107XG4gICAgdmFyIHRvdGFsUHJvcCA9IERldmljZVR5cGVbZGF0YVswXS50eXBlX2lkXS5Qcm9wZXJ0eV9jb3VudDtcbiAgICBmb3IgKHZhciBpID0gMTsgaSA8PSB0b3RhbFByb3A7IGkrKykge1xuICAgICAgdmFyIHRlbXBvYmplY3QgPSB7XG4gICAgICAgIGtleTogRGV2aWNlVHlwZVtkYXRhWzBdLnR5cGVfaWRdW1wiUHJvcGVydHlfXCIgKyBpICsgXCJfbmFtZVwiXSxcbiAgICAgICAgdmFsdWU6XG4gICAgICAgICAgZGF0YVswXVtcImRldmljZVwiXVtcbiAgICAgICAgICAgIERldmljZVR5cGVbZGF0YVswXS50eXBlX2lkXVtcIlByb3BlcnR5X1wiICsgaSArIFwiX2lkXCJdXG4gICAgICAgICAgXSxcbiAgICAgIH07XG4gICAgICBQcm9wZXJ0eWFycmF5LnB1c2godGVtcG9iamVjdCk7XG4gICAgfVxuICAgIHRoaXMuc2V0RGF0YSh7XG4gICAgICBkZXZpY2VQcm9wOiBQcm9wZXJ0eWFycmF5LFxuICAgIH0pO1xuICB9LFxuICBvbkxvYWQ6IGZ1bmN0aW9uIChlOiBhbnkpIHtcbiAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgbGV0IGluaXRzID0gY29tbW9uLndzbWFuYWdlci5nZXRJbnN0YW5jZSgpOyAvL+a2iOaBr+S4reW/g+eahOWNleS+i1xuICAgIHZhciBEZXZpY2VUeXBlID0gd3guZ2V0U3RvcmFnZVN5bmMoXCJEZXZpY2VUeXBlXCIpO1xuICAgIGNvbnNvbGUubG9nKGUpO1xuICAgIHZhciBpZCA9IFwiXCI7XG4gICAgY29uc3QgZXZlbnRDaGFubmVsID0gdGhpcy5nZXRPcGVuZXJFdmVudENoYW5uZWwoKTtcbiAgICBldmVudENoYW5uZWwub24oXCJhY2NlcHREYXRhRnJvbU9wZW5lclBhZ2VcIiwgZnVuY3Rpb24gKGRhdGE6IGFueSkge1xuICAgICAgaWQgPSBkYXRhLmRhdGE7XG4gICAgICBjb25zb2xlLmxvZyhcIuS8oOS6hlwiLCBpZCk7XG5cbiAgICAgIGRldmljZWRldGFpbCA9IGluaXRzLmVndXNlcihcImRldmljZWRldGFpbFwiLCAoKSA9PiB7XG4gICAgICAgIC8v5raI5oGv5Lit5b+D55qE5ZueXG4gICAgICAgIHRoYXQudXBkYXRlZGF0YShpZCk7XG4gICAgICB9KTtcblxuICAgICAgdmFyIGZpbHRlcmFycmF5ID0gZGV2aWNlc2xpc3QubGlzdDtcbiAgICAgIHZhciBkYXRhID0gZmlsdGVyYXJyYXkuZmlsdGVyKChlOiBhbnkpID0+IHtcbiAgICAgICAgcmV0dXJuIGUuZGV2aWNlX3VuaV9pZCA9PSBpZDtcbiAgICAgIH0pO1xuICAgICAgdmFyIG1hcmtlciA9IFt7XG4gICAgICAgIGljb25QYXRoOiBcIi4uLy4uLy4uL2ltZy9zbWFydC5wbmdcIixcbiAgICAgICAgaWQ6IDAsXG4gICAgICAgIHRpdGxlOlwi5pm66IO95LqV55uWMVwiLFxuICAgICAgICBsYXRpdHVkZTogZGF0YVswXS5kZXZpY2UuZGV2aWNlX2xhdGl0dWUsXG4gICAgICAgIGxvbmdpdHVkZTogZGF0YVswXS5kZXZpY2UuZGV2aWNlX2xvbmdpdHV0ZSwgXG4gICAgICAgIHdpZHRoOiAzMCxcbiAgICAgICAgaGVpZ2h0OiAzMFxuICAgICAgfV1cbiAgICAgIHRoYXQuc2V0RGF0YSh7XG4gICAgICAgIGN1cnJlbnRkZXZpY2U6IGRhdGFbMF0sXG4gICAgICAgIGN1cnJlbnR0eXBlOiBEZXZpY2VUeXBlW2RhdGFbMF0udHlwZV9pZF0sXG4gICAgICAgIG1hcmtlcnMgOm1hcmtlciBhcyBhbnlcbiAgICAgIH0pO1xuICAgICAgdGhhdC5kZWNvZGVfcHJvcChkYXRhKTtcbiAgICAgIHZhciBmaWx0ZXJhcnJheSA9IGRldmljZXNsaXN0Lmxpc3Q7XG4gICAgICB2YXIgZGF0YSA9IGZpbHRlcmFycmF5LmZpbHRlcigoZTogYW55KSA9PiB7XG4gICAgICAgIHJldHVybiBlLmRldmljZV91bmlfaWQgPT0gaWQ7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSxcbiAgb25VbmxvYWQ6IGZ1bmN0aW9uICgpIHtcbiAgICBsZXQgaW5pdHMgPSBjb21tb24ud3NtYW5hZ2VyLmdldEluc3RhbmNlKCk7IC8v5raI5oGv5Lit5b+D55qE5Y2V5L6LXG4gICAgaW5pdHMuY2d1c2VyKGRldmljZWRldGFpbCk7XG4gIH0sXG4gIG9uU2hvdzogZnVuY3Rpb24gKCkge30sXG4gIG9uU2hhcmVBcHBNZXNzYWdlKG9wdGlvbnMpIHtcbiAgICBpZiAob3B0aW9ucy5mcm9tID09PSBcImJ1dHRvblwiKSB7XG4gICAgICAvLyDmnaXoh6rpobXpnaLlhoXovazlj5HmjInpkq5cbiAgICAgIGNvbnNvbGUubG9nKG9wdGlvbnMudGFyZ2V0KTtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgIHRpdGxlOiBcIuaIkee7meS9oOWFseS6q+S6huS4gOS4quiuvuWkhyzmiZPlvIDmn6XnnIvlk6ZcIixcbiAgICAgIHBhdGg6IFwiL3BhZ2UvdXNlcj9pZD0xMjNcIixcbiAgICB9O1xuICB9LFxufSk7XG4iXX0=