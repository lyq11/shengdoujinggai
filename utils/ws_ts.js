"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
var common = require("/NotificationCen");
var deviceservice = require("../model/devices");
var notiservice = require("../model/noti");
var shareservice = require("../model/share");
var wsconnected = false;
class wsmanager {
    constructor() {
        this.times = 0;
        var service = common.wsmanager.getInstance();
        this.noti = service.eguser("ws");
    }
    static getInstance() {
        return wsmanager.instance;
    }
    heart() {
        var that = this;
        var timer = setInterval(() => {
            wx.sendSocketMessage({
                data: "heart",
                success: function () {
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
        console.log("当前的token", token);
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
                console.log(res);
                wsconnected = false;
                getApp().globalData.isportopen = false;
            }),
            wx.onSocketClose(() => {
                wsconnected = false;
                getApp().globalData.isportopen = false;
            });
        wx.onSocketMessage(function (res) {
            //当前datas为所有的设备
            var datas = JSON.parse(res.data);
            console.log('收到服务器响应回的数据', datas);
            let key = datas.key;
            let c = deviceservice.devicesmanager.getInstance();
            switch (key) {
                case "register":
                    switch (datas.value) {
                        case "1":
                            that.send("update");
                            break;
                        case "-1":
                            wx.removeStorage({
                                key: 'token',
                                success() {}
                            });
                            wx.reLaunch({
                                url: "Home",
                                success: function (e) {
                                    console.log(e);
                                },
                                fail: function (e) {
                                    console.log(e);
                                }
                            });
                            break;
                        default:
                            break;
                    }
                    break;
                case "Home":
                    c.clear();
                    for (let id of datas.value) {
                        var device_new = {
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
                    c.edit(data_decode.device_uni_id, data_decode.key, data_decode.value);
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
                    var newvalues = {
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
    send(data) {
        console.log("准备发数据" + data);
        if (wsconnected) {
            wx.sendSocketMessage({
                data: data,
                success: function () {
                    console.log(data + "数据已发给服务器");
                },
                fail: () => {
                    console.log("数据发送失败");
                }
            });
        } else {
            console.log("准备不好,不能发数据");
        }
    }
    disconnect() {
        wx.onSocketClose(function (res) {
            console.log('WebSocket 已关闭！', res);
            wsconnected = false;
            getApp().globalData.isportopen = false;
        });
    }
}
exports.wsmanager = wsmanager;
wsmanager.instance = new wsmanager();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid3NfdHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ3c190cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLElBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0FBQ3pDLElBQUksYUFBYSxHQUFHLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0FBQ2hELElBQUksV0FBVyxHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQztBQUMzQyxJQUFJLFlBQVksR0FBRyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztBQUM3QyxJQUFJLFdBQVcsR0FBRyxLQUFLLENBQUM7QUFzQ3hCLE1BQWEsU0FBUztJQUtwQjtRQUZRLFVBQUssR0FBVyxDQUFDLENBQUM7UUFHeEIsSUFBSSxPQUFPLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUM3QyxJQUFJLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDbkMsQ0FBQztJQUVELE1BQU0sQ0FBQyxXQUFXO1FBQ2hCLE9BQU8sU0FBUyxDQUFDLFFBQVEsQ0FBQztJQUM1QixDQUFDO0lBQ0QsS0FBSztRQUNILElBQUksSUFBSSxHQUFHLElBQUksQ0FBQztRQUVoQixJQUFJLEtBQUssR0FBRyxXQUFXLENBQUMsR0FBRyxFQUFFO1lBQzNCLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQztnQkFDbkIsSUFBSSxFQUFFLE9BQU87Z0JBQ2IsT0FBTyxFQUFFO29CQUNQLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7b0JBQ3hCLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO2dCQUNqQixDQUFDO2dCQUNELElBQUksRUFBRSxHQUFHLEVBQUU7b0JBQ1QsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO29CQUNiLElBQUksSUFBSSxDQUFDLEtBQUssSUFBSSxDQUFDLEVBQUU7d0JBQ25CLE9BQU8s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Z0JBQ3hCLENBQUM7YUFDRixDQUFDLENBQUM7U0FDSjthQUFNO1lBRUwsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztTQUMzQjtJQUNILENBQUM7SUFDRCxVQUFVO1FBQ1IsRUFBRSxDQUFDLGFBQWEsQ0FBQyxVQUFTLEdBQUc7WUFDM0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBQyxHQUFHLENBQUMsQ0FBQTtZQUNqQyxXQUFXLEdBQUcsS0FBSyxDQUFDO1lBQ3BCLE1BQU0sRUFBRSxDQUFDLFVBQVUsQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDO1FBQ3ZDLENBQUMsQ0FBQyxDQUFBO0lBQ04sQ0FBQzs7QUF6TUgsOEJBME1DO0FBek1nQixrQkFBUSxHQUFHLElBQUksU0FBUyxFQUFFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgY29tbW9uID0gcmVxdWlyZShcIi9Ob3RpZmljYXRpb25DZW5cIik7XG52YXIgZGV2aWNlc2VydmljZSA9IHJlcXVpcmUoXCIuLi9tb2RlbC9kZXZpY2VzXCIpO1xudmFyIG5vdGlzZXJ2aWNlID0gcmVxdWlyZShcIi4uL21vZGVsL25vdGlcIik7XG52YXIgc2hhcmVzZXJ2aWNlID0gcmVxdWlyZShcIi4uL21vZGVsL3NoYXJlXCIpO1xudmFyIHdzY29ubmVjdGVkID0gZmFsc2U7XG5pbnRlcmZhY2UgZGV2aWNlIHtcbiAgaWQ6IHN0cmluZyB8IG51bWJlcjtcbiAgdHlwZV9pZDogc3RyaW5nIHwgbnVtYmVyO1xuICBjb19pZDogc3RyaW5nIHwgbnVtYmVyO1xuICBwX2lkOiBzdHJpbmcgfCBudW1iZXI7XG4gIGRldmljZV91bmlfaWQ6IHN0cmluZyB8IG51bWJlcjtcbiAgc2VydmljZV9zdGF0dXM6IHN0cmluZyB8IG51bWJlcjtcbiAgd2FybmluZ19zdGF0dXM6IHN0cmluZyB8IG51bWJlcjtcbiAgbmFtZTogYW55O1xuICBkZXZpY2VfaXNvbmxpbmU6IHN0cmluZyB8IG51bWJlcjtcbiAgZGV2aWNlX2xhc3Rfb25saW5lOiBzdHJpbmcgfCBudW1iZXI7XG4gIHBjYl92ZXI6IGFueTtcbiAgZmlybXdhcmVfdmFyOiBhbnk7XG4gIGNyZWF0ZWRfYXQ6IGFueTtcbiAgdXBkYXRlZF9hdDogYW55O1xuICBmYWNldmFsdWU6IGFueTtcbiAgZGV2aWNlOiBhbnk7XG59XG4vLyBpbnRlcmZhY2Ugbm90aSB7XG4vLyAgIGluZm86IHN0cmluZztcbi8vICAgZGV2aWNlX2lkOiBzdHJpbmc7XG4vLyAgIHdhcm5pbmdfdHlwZTogc3RyaW5nO1xuLy8gICB3YXJuaW5nX2lkOiBzdHJpbmc7XG4vLyAgIHdhcm5pbmdfbm90aV90eXBlOiBzdHJpbmc7XG4vLyAgIGN1cnJlbnRfdmFsdWU6IHN0cmluZyB8IGFueTtcbi8vICAgd2FybmluZ19saW5lOiBzdHJpbmcgfCBhbnk7XG4vLyAgIGlzcmVhZDogYW55O1xuLy8gICBkYXRlOiBhbnk7XG4vLyB9XG5pbnRlcmZhY2Ugc2hhcmUge1xuICBpbmZvOiBzdHJpbmc7XG4gIHN0YXR1czogc3RyaW5nO1xuICBpZDogc3RyaW5nO1xuICB0eXBlOiBzdHJpbmc7XG4gIGlzcmVhZDogYW55O1xuICBkYXRlOiBhbnk7XG59XG5leHBvcnQgY2xhc3Mgd3NtYW5hZ2VyIHtcbiAgcHJpdmF0ZSBzdGF0aWMgaW5zdGFuY2UgPSBuZXcgd3NtYW5hZ2VyKCk7XG4gIHByaXZhdGUgbm90aTogYW55O1xuICBwcml2YXRlIHRpbWVzOiBudW1iZXIgPSAwO1xuICAvLyDlsIYgY29uc3RydWN0b3Ig6K6+5Li656eB5pyJ5bGe5oCn77yM6Ziy5q2iIG5ldyDosIPnlKhcbiAgcHJpdmF0ZSBjb25zdHJ1Y3RvcigpIHtcbiAgICB2YXIgc2VydmljZSA9IGNvbW1vbi53c21hbmFnZXIuZ2V0SW5zdGFuY2UoKTtcbiAgICB0aGlzLm5vdGkgPSBzZXJ2aWNlLmVndXNlcihcIndzXCIpO1xuICB9XG5cbiAgc3RhdGljIGdldEluc3RhbmNlKCk6IHdzbWFuYWdlciB7XG4gICAgcmV0dXJuIHdzbWFuYWdlci5pbnN0YW5jZTtcbiAgfVxuICBoZWFydCgpIHtcbiAgICB2YXIgdGhhdCA9IHRoaXM7XG5cbiAgICB2YXIgdGltZXIgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICB3eC5zZW5kU29ja2V0TWVzc2FnZSh7XG4gICAgICAgIGRhdGE6IFwiaGVhcnRcIixcbiAgICAgICAgc3VjY2VzczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coXCLmnI3liqHlmajlv4Pot7NpbmdcIik7XG4gICAgICAgICAgdGhhdC50aW1lcyA9IDA7XG4gICAgICAgIH0sXG4gICAgICAgIGZhaWw6ICgpID0+IHtcbiAgICAgICAgICB0aGF0LnRpbWVzKys7XG4gICAgICAgICAgaWYgKHRoYXQudGltZXMgPj0gMykge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCLmnI3liqHlmajmlq3lvIDov57mjqVcIik7XG4gICAgICAgICAgICBjbGVhckludGVydmFsKHRpbWVyKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0sIDEwMDAwKTtcbiAgfVxuICBzdGFydCgpIHtcbiAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgdmFyIHRva2VuID0gd3guZ2V0U3RvcmFnZVN5bmMoXCJ0b2tlblwiKTtcbiAgICBjb25zb2xlLmxvZyhcIuW9k+WJjeeahHRva2VuXCIsdG9rZW4pXG4gICAgd3guY29ubmVjdFNvY2tldCh7XG4gICAgICB1cmw6IFwid3NzOi8vd3d3LnN1bmRheXRlay5jb20vd3NzXCIsXG4gICAgICBoZWFkZXI6IHtcbiAgICAgICAgXCJjb250ZW50LXR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICB9LFxuICAgICAgc3VjY2VzcygpIHtcbiAgICAgICAgZ2V0QXBwKCkuZ2xvYmFsRGF0YS5pc2Nvbm5lY3RlZCA9IHRydWU7XG4gICAgICAgIGNvbnNvbGUubG9nKFwi6ZO+5o6l5oiQ5YqfXCIpO1xuICAgICAgfSxcbiAgICAgIGZhaWwoKSB7XG4gICAgICAgIGdldEFwcCgpLmdsb2JhbERhdGEuaXNjb25uZWN0ZWQgPSBmYWxzZTtcbiAgICAgICAgY29uc29sZS5sb2coXCLpk77mjqXlpLHotKVcIik7XG4gICAgICB9XG4gICAgfSksXG4gICAgICB3eC5vblNvY2tldE9wZW4oKCkgPT4ge1xuICAgICAgICB3c2Nvbm5lY3RlZCA9IHRydWU7XG4gICAgICAgIHRoYXQuaGVhcnQoKTtcbiAgICAgICAgZ2V0QXBwKCkuZ2xvYmFsRGF0YS5pc3BvcnRvcGVuID0gdHJ1ZTtcbiAgICAgIH0pLFxuICAgICAgd3gub25Tb2NrZXRFcnJvcihyZXMgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZyhyZXMpXG4gICAgICAgIHdzY29ubmVjdGVkID0gZmFsc2U7XG4gICAgICAgIGdldEFwcCgpLmdsb2JhbERhdGEuaXNwb3J0b3BlbiA9IGZhbHNlO1xuICAgICAgfSksXG4gICAgICB3eC5vblNvY2tldENsb3NlKCgpPT57XG4gICAgICAgIHdzY29ubmVjdGVkID0gZmFsc2U7XG4gICAgICAgIGdldEFwcCgpLmdsb2JhbERhdGEuaXNwb3J0b3BlbiA9IGZhbHNlO1xuICAgICAgfSlcbiAgICAgIHd4Lm9uU29ja2V0TWVzc2FnZShmdW5jdGlvbihyZXMpIHtcblxuICAgICAgICB2YXIgZGF0YXMgPSBKU09OLnBhcnNlKHJlcy5kYXRhIGFzIHN0cmluZyk7XG4gICAgICAgIGNvbnNvbGUubG9nKCfmlLbliLAnLGRhdGFzKVxuICAgICAgICBsZXQga2V5ID0gZGF0YXMua2V5O1xuICAgICAgICBsZXQgYyA9IGRldmljZXNlcnZpY2UuZGV2aWNlc21hbmFnZXIuZ2V0SW5zdGFuY2UoKTtcbiAgICAgICAgc3dpdGNoIChrZXkpIHtcbiAgICAgICAgICBjYXNlIFwicmVnaXN0ZXJcIjpcbiAgICAgICAgICAgIHN3aXRjaChkYXRhcy52YWx1ZSl7XG4gICAgICAgICAgICAgIGNhc2UgXCIxXCI6XG4gICAgICAgICAgICAgICAgdGhhdC5zZW5kKFwidXBkYXRlXCIpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICBjYXNlIFwiLTFcIjpcbiAgICAgICAgICAgICAgICB3eC5yZW1vdmVTdG9yYWdlKHtcbiAgICAgICAgICAgICAgICAgIGtleTogJ3Rva2VuJyxcbiAgICAgICAgICAgICAgICAgIHN1Y2Nlc3MgKCkge1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIHd4LnJlTGF1bmNoKHtcbiAgICAgICAgICAgICAgICAgIHVybDpcIkhvbWVcIixcbiAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6ZnVuY3Rpb24oZSl7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGUpXG4gICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgZmFpbDpmdW5jdGlvbihlKXtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZSlcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIFwiSG9tZVwiOlxuICAgICAgICAgICAgYy5jbGVhcigpXG4gICAgICAgICAgICBmb3IgKGxldCBpZCBvZiBkYXRhcy52YWx1ZSkge1xuICAgICAgICAgICAgICB2YXIgZGV2aWNlX25ldzogZGV2aWNlID0ge1xuICAgICAgICAgICAgICAgIGlkOiBpZC5kZXZpY2VfdW5pX2lkLFxuICAgICAgICAgICAgICAgIHR5cGVfaWQ6IGlkLnR5cGVfaWQsXG4gICAgICAgICAgICAgICAgY29faWQ6IGlkLmNvX2lkLFxuICAgICAgICAgICAgICAgIHBfaWQ6IGlkLnBfaWQsXG4gICAgICAgICAgICAgICAgZGV2aWNlX3VuaV9pZDogaWQuZGV2aWNlX3VuaV9pZCxcbiAgICAgICAgICAgICAgICBzZXJ2aWNlX3N0YXR1czogaWQuc2VydmljZV9zdGF0dXMsXG4gICAgICAgICAgICAgICAgd2FybmluZ19zdGF0dXM6IGlkLndhcm5pbmdfc3RhdHVzLFxuICAgICAgICAgICAgICAgIG5hbWU6IGlkLm5hbWUsXG4gICAgICAgICAgICAgICAgZGV2aWNlX2lzb25saW5lOiBpZC5kZXZpY2VfaXNvbmxpbmUsXG4gICAgICAgICAgICAgICAgZGV2aWNlX2xhc3Rfb25saW5lOiBpZC5kZXZpY2VfbGFzdF9vbmxpbmUsXG4gICAgICAgICAgICAgICAgcGNiX3ZlcjogaWQucGNiX3ZlcixcbiAgICAgICAgICAgICAgICBmaXJtd2FyZV92YXI6IGlkLmZpcm13YXJlX3ZhcixcbiAgICAgICAgICAgICAgICBjcmVhdGVkX2F0OiBpZC5jcmVhdGVkX2F0LFxuICAgICAgICAgICAgICAgIHVwZGF0ZWRfYXQ6IGlkLnVwZGF0ZWRfYXQsXG4gICAgICAgICAgICAgICAgZmFjZXZhbHVlOiBpZC5mYWNldmFsdWUsXG4gICAgICAgICAgICAgICAgZGV2aWNlOiBpZC5kZXZpY2VkYXRhXG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgIGMuYWRkKGRldmljZV9uZXcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhhdC5ub3RpLnNlbmRNc2coXCJcIiwgXCJob21lXCIpO1xuICAgICAgICAgICAgdGhhdC5ub3RpLnNlbmRNc2coXCJcIiwgXCJkZXZpY2VMaXN0XCIpO1xuXG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIFwiQ29uZmlnXCI6XG4gICAgICAgICAgICB2YXIgdmFsdWVzID0gZGF0YXMudmFsdWU7XG4gICAgICAgICAgICB2YXIgZGF0YV9kZWNvZGUgPSB2YWx1ZXM7XG4gICAgICAgICAgICBjLmVkaXQoXG4gICAgICAgICAgICAgIGRhdGFfZGVjb2RlLmRldmljZV91bmlfaWQsXG4gICAgICAgICAgICAgIGRhdGFfZGVjb2RlLmtleSxcbiAgICAgICAgICAgICAgZGF0YV9kZWNvZGUudmFsdWVcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICB0aGF0Lm5vdGkuc2VuZE1zZyhcIlwiLCBcImhvbWVcIik7XG4gICAgICAgICAgICB0aGF0Lm5vdGkuc2VuZE1zZyhcIlwiLCBcImRldmljZUxpc3RcIik7XG4gICAgICAgICAgICB0aGF0Lm5vdGkuc2VuZE1zZyhcIlwiLCBcImRldmljZWRldGFpbFwiKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgXCJub2ZpdHlcIjpcbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IGRhdGFzLnZhbHVlO1xuICAgXG4gICAgICAgICAgICB2YXIgZGF0YV9kZWNvZGUgPSBKU09OLnBhcnNlKHZhbHVlKTtcbiAgICAgICAgICBcbiAgICAgICAgICAgIHZhciB2YWx1ZXMgPSBkYXRhX2RlY29kZVtcImRhdGFcIl07XG5cbiAgICAgICAgICAgIHZhciB0aW1lID0gbmV3IERhdGUoKTtcbiAgICAgICAgICAgIHZhbHVlc1tcImRhdGVcIl0gPVxuICAgICAgICAgICAgICB0aW1lLnRvTG9jYWxlRGF0ZVN0cmluZygpICsgdGltZS50b0xvY2FsZVRpbWVTdHJpbmcoKTtcbiAgICAgICAgICAgIHZhbHVlc1tcImlzcmVhZFwiXSA9IDA7XG4gICAgICAgICAgICB2YXIgbm90cyA9IG5vdGlzZXJ2aWNlLm5vdGltYW5hZ2VyLmdldEluc3RhbmNlKCk7XG4gICAgICAgICAgICBub3RzLmFkZCh2YWx1ZXMpO1xuICAgICAgICAgICAgbm90cy5zaG93KCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIFwiVXNlclwiOlxuICAgICAgICAgICAgdmFyIHZhbHVlID0gZGF0YXMudmFsdWU7XG4gICAgICAgICAgICB2YXIgZGF0YV9kZWNvZGUgPSBKU09OLnBhcnNlKHZhbHVlKTtcbiBcbiAgICAgICAgICAgIHZhciB2YWx1ZXMgPSBkYXRhX2RlY29kZVtcImRhdGFcIl07XG4gICAgICAgICAgICB2YXIgdGltZSA9IG5ldyBEYXRlKCk7XG4gICAgICAgICAgICB2YXIgbmV3dmFsdWVzOiBzaGFyZSA9IHtcbiAgICAgICAgICAgICAgaW5mbzogdmFsdWVzLmluZm8sXG4gICAgICAgICAgICAgIHN0YXR1czogdmFsdWVzLnN0YXR1cyxcbiAgICAgICAgICAgICAgaWQ6IHZhbHVlcy5pZCxcbiAgICAgICAgICAgICAgdHlwZTogdmFsdWVzLnR5cGUsXG4gICAgICAgICAgICAgIGRhdGU6IHRpbWUudG9Mb2NhbGVEYXRlU3RyaW5nKCkgKyB0aW1lLnRvTG9jYWxlVGltZVN0cmluZygpLFxuICAgICAgICAgICAgICBpc3JlYWQ6IDBcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB2YXIgc2hhcmUgPSBzaGFyZXNlcnZpY2Uuc2hhcmVtYW5hZ2VyLmdldEluc3RhbmNlKCk7XG4gICAgICAgICAgICBzaGFyZS5hZGQobmV3dmFsdWVzKTtcbiAgICAgICAgICAgIHNoYXJlLnNob3coKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhyZXMuZGF0YSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfSk7XG4gIH1cbiAgc2VuZChkYXRhOiBzdHJpbmcpIHtcbiAgICBjb25zb2xlLmxvZyhcIuWHhuWkh+WPkeaVsOaNrlwiICsgZGF0YSk7XG4gICAgaWYgKHdzY29ubmVjdGVkKSB7XG4gICAgICAvLyBzb2NrZXRPcGVuZWTlj5jph4/lnKh3eC5vblNvY2tldE9wZW7ml7borr7nva7kuLp0cnVlXG4gICAgICB3eC5zZW5kU29ja2V0TWVzc2FnZSh7XG4gICAgICAgIGRhdGE6IGRhdGEsXG4gICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKGRhdGEgKyBcIuaVsOaNruW3suWPkee7meacjeWKoeWZqFwiKTtcbiAgICAgICAgfSxcbiAgICAgICAgZmFpbDogKCkgPT4ge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwi5pWw5o2u5Y+R6YCB5aSx6LSlXCIpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8g5Y+R6YCB55qE5pe25YCZ77yM6ZO+5o6l6L+Y5rKh5bu656uLXG4gICAgICBjb25zb2xlLmxvZyhcIuWHhuWkh+S4jeWlvSzkuI3og73lj5HmlbDmja5cIik7XG4gICAgfVxuICB9XG4gIGRpc2Nvbm5lY3QoKXtcbiAgICB3eC5vblNvY2tldENsb3NlKGZ1bmN0aW9uKHJlcykge1xuICAgICAgY29uc29sZS5sb2coJ1dlYlNvY2tldCDlt7LlhbPpl63vvIEnLHJlcylcbiAgICAgIHdzY29ubmVjdGVkID0gZmFsc2U7XG4gICAgICBnZXRBcHAoKS5nbG9iYWxEYXRhLmlzcG9ydG9wZW4gPSBmYWxzZTtcbiAgICAgIH0pXG4gIH1cbn1cbiJdfQ==