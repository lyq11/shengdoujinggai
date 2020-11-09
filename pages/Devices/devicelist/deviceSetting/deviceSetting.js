// miniprogram/pages/Devices/devicelist/deviceSetting/deviceSetting.js
var app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    device_type: [],
    device: [],
    cansum: 0,
    rules: [],
    formData:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(option) {
    var that = this;
    var types = wx.getStorageSync("DeviceType");

    console.log(option.query);
    const eventChannel = this.getOpenerEventChannel();
    eventChannel.on("SettingValue", function(data) {
      console.log(data);
      that.setData({
        device_id: data.data.id,
        device: data.data.device,
        device_type: types[data.data.type_id]
      });
      that.checkedit(types[data.data.type_id],(data)=>{
        var newtemp = data.filter(e => {
          if (e.edit == 1){
            console.log('现在的值',e.id)
            console.log('现在的值',that.data.device)
            that.setData({
              [`formData.${e.id}`]: that.data.device[e.id]
          })
            return true
          }
           ;
        });
        that.setData({
          prop: newtemp,
        });
      });
      
      
    });

    var prop = this.data.prop;
  

    var ruls = prop.map(e => {
      var rule = {};
      rule["name"] = e.id;
      rule["rules"] = { required: false, message: e.name + "不得为空" };
      return rule;
    });
    var formData = {};
    var device_data = this.data.device;
    prop.map(e => {
      formData[e.id] = device_data[e.id];
    });
    this.setData({
      rules: ruls,
      formData: formData
    });
  },
  switch1Change:function(e){
    console.log(e);
    var { field } = e.currentTarget.dataset;
var result =""
    if (e.detail.value == true){
      result = "1";
    }
    if (e.detail.value == false){
      result = "0";
    }
    this.setData({
      [`formData.${field}`]: result
    });
    if (e.detail.value == null) {
      this.setData({
        cansum: 0
      });
    } else {
      this.setData({
        cansum: 1
      });
    }
  },
  checkedit: function(e,callback) {
    var count = e.Property_count;
    var list = [];
    for (var i = 1; i <= count; i++) {
      var temp = {};
      (temp["id"] = e["Property_" + i + "_id"]),
        (temp["name"] = e["Property_" + i + "_name"]),
        (temp["type"] = e["Property_" + i + "_type"]),
        (temp["method"] = e["Property_" + i + "_method"]),
        (temp["object"] = e["Property_" + i + "_object"]),
        (temp["edit"] = e["Property_" + i + "_edit"]),
        (temp["isnotiy"] = e["Property_" + i + "_isnotiy"]),
        (temp["edit_type"] = e["Property_" + i + "_edit_type"]);
      list.push(temp);
      console.log("这个可以编辑",temp)
    }
    callback(list)
  },
  submitForm() {
    var that = this;
    this.selectComponent("#form").validate((valid, errors) => {
      console.log("valid", valid, errors);
      if (!valid) {
        const firstError = Object.keys(errors);
        if (firstError.length) {
          this.setData({
            error: errors[firstError[0]].message
          });
        }
      } else {
        var token = wx.getStorageSync("token");
        wx.request({
          url: "https://" + app.globalData.MainURL + "/device/v1/editDevice",
          method: "POST",
          data: {
            deviceid: that.data.device.device_uni_id,
            type: that.data.device_type.type_id.toLowerCase(),
            edit_options: JSON.stringify(that.data.formData)
          },
          header: {
            "content-type": "application/json",
            Authorization: "Bearer " + token
          },
          success: function(e) {
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
                  }
                });
                break;
              case -1:
                wx.showModal({
                  title: "错误",
                  showCancel: false,
                  content: e.data.status_text
                });
                break;
              default:
                wx.showModal({
                  title: "错误",
                  showCancel: false,
                  content: "未知错误"
                });
                break;
            }
          },
          fail: function(e) {
            console.log(e);
          }
        });
      }
    });
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {},
  slider3change:function(e){
    console.log(e);
    var { field } = e.currentTarget.dataset;
    this.setData({
      [`formData.${field}`]: e.detail.value
    });
    if (e.detail.value == null) {
      this.setData({
        cansum: 0
      });
    } else {
      this.setData({
        cansum: 1
      });
    }
  },
  formInputChange: function(e) {
    console.log(e);
    var { field } = e.currentTarget.dataset;
    this.setData({
      [`formData.${field}`]: e.detail.value
    });
    if (e.detail.value == null) {
      this.setData({
        cansum: 0
      });
    } else {
      this.setData({
        cansum: 1
      });
    }
  },
  sumbit: function() {
    var data = this.data.formData;
    var js_data = JSON.stringify(data);
    console.log(js_data);
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {},
  btback: function() {
    wx.navigateBack({});
  }
});
