"use strict";
var noti = require("/utils/NotificationCen");
var updateDevice = 0;
var updateCompany = 0;
var updateNoti = 0;
App({
    globalData: {
        MainURL: "",
        FilterData: [0, 0, 0]
    },
    onLaunch() {
        var that = this;
        let service = noti.wsmanager.getInstance();
        service.eguser("system");
        console.log("开始获取配置");
        console.log(that.globalData.MainURL);
        wx.request({
            url: "https://www.sundaytek.com/api/getconfig",
            header: {
                "content-type": "application/json"
            },
            success(res) {
                var temp = res.data;
                var configdatas = temp["data"];
                console.log(configdatas);
                console.log("获取成功");
                for (var config of configdatas) {
                    try {
                        var Localvalue = wx.getStorageSync(config.config_name);
                        if (Localvalue == config.config_value) {
                            switch (config.config_name) {
                                case "MainAddress":
                                    var mainURL = wx.getStorageSync("MainAddress");
                                    that.globalData.MainURL = mainURL;
                                    break;
                                case "DeviceTypeVersion":
                                    var sd = wx.getStorageSync("DeviceType");
                                    if (!sd) {
                                        updateDevice = 1;
                                    }
                                    break;
                                case "CompanyTypeVersion":
                                    var sd = wx.getStorageSync("CompanyType");
                                    if (!sd) {
                                        updateCompany = 1;
                                    }
                                    break;
                                case "NotiTypeVersion":
                                    var sd = wx.getStorageSync("NotiType");
                                    if (!sd) {
                                        updateNoti = 1;
                                    }
                                    break;
                                default:
                                    break;
                            }
                        }
                        else {
                            switch (config.config_name) {
                                case "MainAddress":
                                    that.globalData.MainURL = config.config_value;
                                    console.log("i am here");
                                    console.log("my value is", config.config_value);
                                    console.log(that.globalData.MainURL);
                                    break;
                                default:
                                    break;
                            }
                            if (config.config_name == "DeviceTypeVersion") {
                                updateDevice = 1;
                            }
                            if (config.config_name == "CompanyTypeVersion") {
                                updateCompany = 1;
                            }
                            if (config.config_name == "NotiTypeVersion") {
                                updateNoti = 1;
                            }
                            wx.setStorage({
                                key: config.config_name,
                                data: config.config_value,
                                success: function () {
                                },
                                fail: function () {
                                }
                            });
                        }
                    }
                    catch (e) {
                        console.log("没有版本信息");
                        wx.setStorage({
                            key: config.config_name,
                            data: config.config_value,
                            success: function () {
                            },
                            fail: function () {
                            }
                        });
                    }
                }
                that.checkUpdate();
            }
        });
    },
    checkUpdate() {
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
        wx.request({
            url: "https://" + that.globalData.MainURL + "/api/getdevicetype",
            method: "POST",
            header: {
                "content-type": "application/json"
            },
            success(res) {
                var temp = res.data;
                var forwvalue = temp["data"];
                var lists = {};
                for (var device of forwvalue) {
                    lists[device.id] = device;
                }
                try {
                    wx.setStorageSync("DeviceType", lists);
                }
                catch (e) {
                    console.log("出错了" + e);
                }
            }
        });
    },
    updateCompanyType() {
        var that = this;
        wx.request({
            url: "https://" + that.globalData.MainURL + "/api/getCompanytypes",
            method: "POST",
            header: {
                "content-type": "application/json"
            },
            success(res) {
                var temp = res.data;
                var forwvalue = temp["data"];
                var lists = {};
                for (var device of forwvalue) {
                    lists[device.id] = device;
                }
                try {
                    wx.setStorageSync("CompanyType", lists);
                }
                catch (e) {
                    console.log("公司更新出错了" + e);
                }
            }
        });
    },
    updateNotiType() {
        var that = this;
        wx.request({
            url: "https://" + that.globalData.MainURL + "/api/getNotificationstype",
            method: "POST",
            header: {
                "content-type": "application/json"
            },
            success(res) {
                var temp = res.data;
                var forwvalue = temp["data"];
                var lists = {};
                for (var device of forwvalue) {
                    lists[device.id] = device;
                }
                try {
                    wx.setStorageSync("NotiType", lists);
                }
                catch (e) {
                    console.log("出错了" + e);
                }
            }
        });
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYXBwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFDQSxJQUFJLElBQUksR0FBRyxPQUFPLENBQUMsd0JBQXdCLENBQUMsQ0FBQztBQUU3QyxJQUFJLFlBQVksR0FBRyxDQUFDLENBQUM7QUFDckIsSUFBSSxhQUFhLEdBQUcsQ0FBQyxDQUFDO0FBQ3RCLElBQUksVUFBVSxHQUFHLENBQUMsQ0FBQztBQUNuQixHQUFHLENBQWE7SUFDZCxVQUFVLEVBQUU7UUFDVixPQUFPLEVBQUUsRUFBRTtRQUNYLFVBQVUsRUFBQyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDO0tBQ25CO0lBQ0QsUUFBUTtRQUNOLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQztRQUNoQixJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQzNDLE9BQU8sQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDekIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUN0QixPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDckMsRUFBRSxDQUFDLE9BQU8sQ0FBQztZQUNULEdBQUcsRUFBRSx5Q0FBeUM7WUFDOUMsTUFBTSxFQUFFO2dCQUNOLGNBQWMsRUFBRSxrQkFBa0I7YUFDbkM7WUFDRCxPQUFPLENBQUMsR0FBRztnQkFDVCxJQUFJLElBQUksR0FBRyxHQUFHLENBQUMsSUFBVyxDQUFDO2dCQUMzQixJQUFJLFdBQVcsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQy9CLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBQ3pCLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQ3BCLEtBQUssSUFBSSxNQUFNLElBQUksV0FBa0IsRUFBRTtv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QVcsQ0FBQztnQkFDM0IsSUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUM3QixJQUFJLEtBQUssR0FBUSxFQUFFLENBQUM7Z0JBQ3BCLEtBQUssSUFBSSxNQUFNLElBQUksU0FBUyxFQUFFO29CQUM1QixLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sQ0FBQztpQkFDM0I7Z0JBQ0QsSUFBSTtvQkFDRixFQUFFLENBQUMsY0FBYyxDQUFDLFVBQVUsRUFBRSxLQUFLLENBQUMsQ0FBQztpQkFDdEM7Z0JBQUMsT0FBTyxDQUFDLEVBQUU7b0JBQ1YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUM7aUJBQ3hCO1lBQ0gsQ0FBQztTQUNGLENBQUMsQ0FBQztJQUNMLENBQUM7Q0FDRixDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBhcHAudHNcbnZhciBub3RpID0gcmVxdWlyZShcIi91dGlscy9Ob3RpZmljYXRpb25DZW5cIik7XG4vL1xudmFyIHVwZGF0ZURldmljZSA9IDA7XG52YXIgdXBkYXRlQ29tcGFueSA9IDA7XG52YXIgdXBkYXRlTm90aSA9IDA7XG5BcHA8SUFwcE9wdGlvbj4oe1xuICBnbG9iYWxEYXRhOiB7XG4gICAgTWFpblVSTDogXCJcIixcbiAgICBGaWx0ZXJEYXRhOlswLDAsMF1cbiAgfSxcbiAgb25MYXVuY2goKSB7XG4gICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgIGxldCBzZXJ2aWNlID0gbm90aS53c21hbmFnZXIuZ2V0SW5zdGFuY2UoKTtcbiAgICBzZXJ2aWNlLmVndXNlcihcInN5c3RlbVwiKTtcbiAgICBjb25zb2xlLmxvZyhcIuW8gOWni+iOt+WPlumFjee9rlwiKTtcbiAgICBjb25zb2xlLmxvZyh0aGF0Lmdsb2JhbERhdGEuTWFpblVSTCk7XG4gICAgd3gucmVxdWVzdCh7XG4gICAgICB1cmw6IFwiaHR0cHM6Ly93d3cuc3VuZGF5dGVrLmNvbS9hcGkvZ2V0Y29uZmlnXCIsIC8vXG4gICAgICBoZWFkZXI6IHtcbiAgICAgICAgXCJjb250ZW50LXR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIgLy8g6buY6K6k5YC8XG4gICAgICB9LFxuICAgICAgc3VjY2VzcyhyZXMpIHtcbiAgICAgICAgdmFyIHRlbXAgPSByZXMuZGF0YSBhcyBhbnk7XG4gICAgICAgIHZhciBjb25maWdkYXRhcyA9IHRlbXBbXCJkYXRhXCJdO1xuICAgICAgICBjb25zb2xlLmxvZyhjb25maWdkYXRhcyk7XG4gICAgICAgIGNvbnNvbGUubG9nKFwi6I635Y+W5oiQ5YqfXCIpO1xuICAgICAgICBmb3IgKHZhciBjb25maWcgb2YgY29uZmlnZGF0YXMgYXMgYW55KSB7XG4gICAgICAgICAgLy/pgY3ljobmnI3liqHlmajojrflj5bnmoRrZXktdmFsdWVcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgdmFyIExvY2FsdmFsdWUgPSB3eC5nZXRTdG9yYWdlU3luYyhjb25maWcuY29uZmlnX25hbWUpOyAvL+iuvue9ruebruW9lVxuICAgICAgICAgICAgaWYgKExvY2FsdmFsdWUgPT0gY29uZmlnLmNvbmZpZ192YWx1ZSkge1xuICAgICAgICAgICAgICAvL+S4pOS4quWAvOS4gOagt1xuICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcIueJiOacrOS4gOiHtFwiKTtcbiAgICAgICAgICAgICAgc3dpdGNoIChjb25maWcuY29uZmlnX25hbWUpIHtcbiAgICAgICAgICAgICAgICBjYXNlIFwiTWFpbkFkZHJlc3NcIjpcbiAgICAgICAgICAgICAgICAgIHZhciBtYWluVVJMID0gd3guZ2V0U3RvcmFnZVN5bmMoXCJNYWluQWRkcmVzc1wiKTtcbiAgICAgICAgICAgICAgICAgIHRoYXQuZ2xvYmFsRGF0YS5NYWluVVJMID0gbWFpblVSTDtcbiAgICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwi6LWL5YC85pu05pawXCIpO1xuICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIkRldmljZVR5cGVWZXJzaW9uXCI6XG4gICAgICAgICAgICAgICAgICB2YXIgc2QgPSB3eC5nZXRTdG9yYWdlU3luYyhcIkRldmljZVR5cGVcIik7XG4gICAgICAgICAgICAgICAgICBpZiAoIXNkKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwi6ZyA6KaB5pu05paw6K6+5aSH57G75Z6LXCIpO1xuICAgICAgICAgICAgICAgICAgICB1cGRhdGVEZXZpY2UgPSAxO1xuICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiQ29tcGFueVR5cGVWZXJzaW9uXCI6XG4gICAgICAgICAgICAgICAgICB2YXIgc2QgPSB3eC5nZXRTdG9yYWdlU3luYyhcIkNvbXBhbnlUeXBlXCIpO1xuICAgICAgICAgICAgICAgICAgaWYgKCFzZCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcIumcgOimgeabtOaWsOWNleS9jeexu+Wei1wiKTtcbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlQ29tcGFueSA9IDE7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiTm90aVR5cGVWZXJzaW9uXCI6XG4gICAgICAgICAgICAgICAgICB2YXIgc2QgPSB3eC5nZXRTdG9yYWdlU3luYyhcIk5vdGlUeXBlXCIpO1xuICAgICAgICAgICAgICAgICAgaWYgKCFzZCkge1xuICAgICAgICAgICAgICAgICAgICB1cGRhdGVOb3RpID0gMTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcIumcgOimgeabtOaWsOexu+Wei1wiKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwi6JCx6JCx6K+0LOWHuumUmeWVpn5cIik7XG4gICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCLniYjmnKzkuI3kuIDoh7RcIik7XG5cbiAgICAgICAgICAgICAgc3dpdGNoIChjb25maWcuY29uZmlnX25hbWUpIHtcbiAgICAgICAgICAgICAgICBjYXNlIFwiTWFpbkFkZHJlc3NcIjpcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgdGhhdC5nbG9iYWxEYXRhLk1haW5VUkwgPSBjb25maWcuY29uZmlnX3ZhbHVlO1xuICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJpIGFtIGhlcmVcIik7XG4gICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIm15IHZhbHVlIGlzXCIsY29uZmlnLmNvbmZpZ192YWx1ZSlcbiAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh0aGF0Lmdsb2JhbERhdGEuTWFpblVSTCk7XG5cbiAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgaWYgKGNvbmZpZy5jb25maWdfbmFtZSA9PSBcIkRldmljZVR5cGVWZXJzaW9uXCIpIHtcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcIumcgOimgeabtOaWsOiuvuWkh+exu+Wei1wiKTtcbiAgICAgICAgICAgICAgICB1cGRhdGVEZXZpY2UgPSAxO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgaWYgKGNvbmZpZy5jb25maWdfbmFtZSA9PSBcIkNvbXBhbnlUeXBlVmVyc2lvblwiKSB7XG4gICAgICAgICAgICAgICAgdXBkYXRlQ29tcGFueSA9IDE7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCLpnIDopoHmm7TmlrDljZXkvY3nsbvlnotcIik7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgaWYgKGNvbmZpZy5jb25maWdfbmFtZSA9PSBcIk5vdGlUeXBlVmVyc2lvblwiKSB7XG4gICAgICAgICAgICAgICAgdXBkYXRlTm90aSA9IDE7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCLpnIDopoHmm7TmlrDnsbvlnotcIik7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICB3eC5zZXRTdG9yYWdlKHtcbiAgICAgICAgICAgICAgICBrZXk6IGNvbmZpZy5jb25maWdfbmFtZSxcbiAgICAgICAgICAgICAgICBkYXRhOiBjb25maWcuY29uZmlnX3ZhbHVlLFxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCLlrZjlgqjmiJDlip9cIik7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBmYWlsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwi5a2Y5YKo5aSx6LSlXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCLmsqHmnInniYjmnKzkv6Hmga9cIik7XG4gICAgICAgICAgICB3eC5zZXRTdG9yYWdlKHtcbiAgICAgICAgICAgICAga2V5OiBjb25maWcuY29uZmlnX25hbWUsXG4gICAgICAgICAgICAgIGRhdGE6IGNvbmZpZy5jb25maWdfdmFsdWUsXG4gICAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwi5a2Y5YKo5oiQ5YqfXCIpO1xuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBmYWlsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcIuWtmOWCqOWksei0pVwiKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoYXQuY2hlY2tVcGRhdGUoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSxcbiAgY2hlY2tVcGRhdGUoKTogdm9pZCB7XG4gICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgIGNvbnNvbGUubG9nKFwi6L+Q6KGM5LqGXCIpO1xuICAgIGlmICh1cGRhdGVEZXZpY2UgPT0gMSkge1xuICAgICAgdGhhdC51cGRhdGVEZXZpY2VUeXBlKCk7XG4gICAgfVxuICAgIGlmICh1cGRhdGVDb21wYW55ID09IDEpIHtcbiAgICAgIHRoYXQudXBkYXRlQ29tcGFueVR5cGUoKTtcbiAgICB9XG4gICAgaWYgKHVwZGF0ZU5vdGkgPT0gMSkge1xuICAgICAgdGhhdC51cGRhdGVOb3RpVHlwZSgpO1xuICAgIH1cbiAgfSxcbiAgdXBkYXRlRGV2aWNlVHlwZSgpIHtcbiAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgY29uc29sZS5sb2codGhhdC5nbG9iYWxEYXRhLk1haW5VUkwpO1xuICAgIC8vIGNvbnNvbGUubG9nKFwi5q2j5Zyo5pu05paw6K6+5aSH57G75Z6LXCIpO1xuICAgIC8vIGNvbnNvbGUubG9nKFwi5Li75Zyw5Z2A5pivOlwiICsgdGhhdC5nbG9iYWxEYXRhLk1haW5VUkwpO1xuICAgIHd4LnJlcXVlc3Qoe1xuICAgICAgdXJsOiBcImh0dHBzOi8vXCIgKyB0aGF0Lmdsb2JhbERhdGEuTWFpblVSTCArIFwiL2FwaS9nZXRkZXZpY2V0eXBlXCIsIC8v5LuF5Li656S65L6L77yM5bm26Z2e55yf5a6e55qE5o6l5Y+j5Zyw5Z2AXG4gICAgICBtZXRob2Q6IFwiUE9TVFwiLFxuICAgICAgaGVhZGVyOiB7XG4gICAgICAgIFwiY29udGVudC10eXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiIC8vIOm7mOiupOWAvFxuICAgICAgfSxcbiAgICAgIHN1Y2Nlc3MocmVzKSB7XG4gICAgICAgIHZhciB0ZW1wID0gcmVzLmRhdGEgYXMgYW55O1xuICAgICAgICB2YXIgZm9yd3ZhbHVlID0gdGVtcFtcImRhdGFcIl07XG4gICAgICAgIHZhciBsaXN0czogYW55ID0ge307XG4gICAgICAgIGZvciAodmFyIGRldmljZSBvZiBmb3J3dmFsdWUpIHtcbiAgICAgICAgICBsaXN0c1tkZXZpY2UuaWRdID0gZGV2aWNlO1xuICAgICAgICB9XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgd3guc2V0U3RvcmFnZVN5bmMoXCJEZXZpY2VUeXBlXCIsIGxpc3RzKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwi5Ye66ZSZ5LqGXCIgKyBlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9LFxuICB1cGRhdGVDb21wYW55VHlwZSgpIHtcbiAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgLy8gY29uc29sZS5sb2coXCLmraPlnKjmm7TmlrDlhazlj7jnsbvlnotcIik7XG4gICAgLy8gY29uc29sZS5sb2coXCLkuLvlnLDlnYDmmK86XCIgKyB0aGF0Lmdsb2JhbERhdGEuTWFpblVSTCk7XG4gICAgd3gucmVxdWVzdCh7XG4gICAgICB1cmw6IFwiaHR0cHM6Ly9cIiArIHRoYXQuZ2xvYmFsRGF0YS5NYWluVVJMICsgXCIvYXBpL2dldENvbXBhbnl0eXBlc1wiLCAvL+S7heS4uuekuuS+i++8jOW5tumdnuecn+WunueahOaOpeWPo+WcsOWdgFxuICAgICAgbWV0aG9kOiBcIlBPU1RcIixcbiAgICAgIGhlYWRlcjoge1xuICAgICAgICBcImNvbnRlbnQtdHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIiAvLyDpu5jorqTlgLxcbiAgICAgIH0sXG4gICAgICBzdWNjZXNzKHJlcykge1xuICAgICAgICB2YXIgdGVtcCA9IHJlcy5kYXRhIGFzIGFueTtcbiAgICAgICAgdmFyIGZvcnd2YWx1ZSA9IHRlbXBbXCJkYXRhXCJdO1xuICAgICAgICB2YXIgbGlzdHM6IGFueSA9IHt9O1xuICAgICAgICBmb3IgKHZhciBkZXZpY2Ugb2YgZm9yd3ZhbHVlKSB7XG4gICAgICAgICAgbGlzdHNbZGV2aWNlLmlkXSA9IGRldmljZTtcbiAgICAgICAgfVxuICAgICAgICB0cnkge1xuICAgICAgICAgIHd4LnNldFN0b3JhZ2VTeW5jKFwiQ29tcGFueVR5cGVcIiwgbGlzdHMpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coXCLlhazlj7jmm7TmlrDlh7rplJnkuoZcIiArIGUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH0sXG4gIHVwZGF0ZU5vdGlUeXBlKCkge1xuICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAvLyBjb25zb2xlLmxvZyhcIuato+WcqOabtOaWsOS/oeaBr+exu+Wei1wiKTtcbiAgICAvLyBjb25zb2xlLmxvZyhcIuS4u+WcsOWdgOaYrzpcIiArIHRoYXQuZ2xvYmFsRGF0YS5NYWluVVJMKTtcbiAgICB3eC5yZXF1ZXN0KHtcbiAgICAgIHVybDogXCJodHRwczovL1wiICsgdGhhdC5nbG9iYWxEYXRhLk1haW5VUkwgKyBcIi9hcGkvZ2V0Tm90aWZpY2F0aW9uc3R5cGVcIiwgLy/ku4XkuLrnpLrkvovvvIzlubbpnZ7nnJ/lrp7nmoTmjqXlj6PlnLDlnYBcbiAgICAgIG1ldGhvZDogXCJQT1NUXCIsXG4gICAgICBoZWFkZXI6IHtcbiAgICAgICAgXCJjb250ZW50LXR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIgLy8g6buY6K6k5YC8XG4gICAgICB9LFxuICAgICAgc3VjY2VzcyhyZXMpIHtcbiAgICAgICAgdmFyIHRlbXAgPSByZXMuZGF0YSBhcyBhbnk7XG4gICAgICAgIHZhciBmb3J3dmFsdWUgPSB0ZW1wW1wiZGF0YVwiXTtcbiAgICAgICAgdmFyIGxpc3RzOiBhbnkgPSB7fTtcbiAgICAgICAgZm9yICh2YXIgZGV2aWNlIG9mIGZvcnd2YWx1ZSkge1xuICAgICAgICAgIGxpc3RzW2RldmljZS5pZF0gPSBkZXZpY2U7XG4gICAgICAgIH1cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICB3eC5zZXRTdG9yYWdlU3luYyhcIk5vdGlUeXBlXCIsIGxpc3RzKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwi5Ye66ZSZ5LqGXCIgKyBlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9XG59KTtcbiJdfQ==