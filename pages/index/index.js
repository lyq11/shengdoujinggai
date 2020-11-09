"use strict";
var app = getApp();
Page({
    data: {
        motto: 'Hello World',
        userInfo: {},
        hasUserInfo: false,
        canIUse: wx.canIUse('button.open-type.getUserInfo'),
      count:60
    },
    bindsss: function () {
        
    },
  formSubmit: function (e) {
    console.log('form发生了submit事件，携带数据为：', e.detail.value)
    console.log("按了");
    wx.request({
      url: "https://" + app.globalData.MainURL + "/auth/login",
      method: "POST",
      data:{
        mobile: e.detail.value.usernmame,
        code: e.detail.value.vacode,
        pw:e.detail.value.password
      },
      success:function(e){
        var ns = e.data.status;
        switch(ns){
          case 1: 
            wx.showModal({
              title: '',
              showCancel: false,
              content: "登录成功",
              success:function(e){
                if (e.confirm){
                  wx.switchTab({
                    url: '../Home/Home',
                  });
                }
              }
            })
            wx.setStorageSync('token', e.data.token);

          break;
          case -1:
            wx.showModal({
              title: '警告',
              showCancel: false,
              content: e.data.status_text,
            })
          break;
          default:
            wx.showModal({
              title: '警告',
              showCancel: false,
              content: '未知错误',
            })
          break;
        }
      },
      fail:function(e){
        console.log(e)
      }

    })
  },
  countdown:function(){
    var that =this
    var intervals =  setInterval(()=>{
      if (that.data.count > 0){
        that.setData({
          count:that.data.count-1
        })
      }else{
        clearInterval(intervals)
        that.setData({
          count: 60
        })
      }
    },1000)
  },
  checklogin:function(e){
    var token = wx.getStorageSync('token');
    
    console.log('是否已经登录', token)
    if (token != null && token != "") {
      wx.switchTab({
        url: '../Home/Home',
      });
    }else{
      console.log("需要登录")
    }
  },
  sendcode: function (e) {
    var that =this
    console.log("现在的值",this.data.can)
    var mobile = this.data.can;
    wx.request({
      url: "https://" + app.globalData.MainURL + "/auth/sendSms",
      method: "POST",
      data: { mobile: mobile},
      success:function(e){
        console.log(e)
          switch(e.data.status){
            case "1":
              console.log("成功")
              wx.showModal({
                title: 'OK',
                showCancel:false,
                content: e.data.status_text,
              })
              that.setData({
                count:60
              })
              that.countdown();
            break;
            case -1:
            wx.showModal({
              title: '错误',
              showCancel: false,
              content: e.data.status_text,
            })
            break;
            default: wx.showModal({
              title: '错误',
              showCancel: false,
              content: '未知错误',
            })
            break;
          }
      }
    })
  },
  checkusername:function(e){
    console.log('form发生了type事件，携带数据为：', e.detail)
    if (e.detail.value != ""){
      this.setData({
        can: e.detail.value
      })
    }else{
      this.setData({
        can: null
      })
    }
  },
    onLoad: function () {
        var _this = this;
        if (app.globalData.userInfo) {
            this.setData({
                userInfo: app.globalData.userInfo,
                hasUserInfo: true,
            });
        }
        else if (this.data.canIUse) {
            app.userInfoReadyCallback = function (res) {
                _this.setData({
                    userInfo: res.userInfo,
                    hasUserInfo: true,
                });
            };
        }
        else {
            wx.getUserInfo({
                success: function (res) {
                    app.globalData.userInfo = res.userInfo;
                    _this.setData({
                        userInfo: res.userInfo,
                        hasUserInfo: true,
                    });
                },
            });
        }
      this.checklogin();
    },
    register:function(){
      wx.navigateTo({
        url: './register/register',
      })
    },
    getUserInfo: function (e) {
        console.log(e);
        app.globalData.userInfo = e.detail.userInfo;
        this.setData({
            userInfo: e.detail.userInfo,
            hasUserInfo: true,
        });
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBRUEsSUFBTSxHQUFHLEdBQUcsTUFBTSxFQUFjLENBQUE7QUFFaEMsSUFBSSxDQUFDO0lBQ0gsSUFBSSxFQUFFO1FBQ0osS0FBSyxFQUFFLGFBQWE7UUFDcEIsUUFBUSxFQUFFLEVBQUU7UUFDWixXQUFXLEVBQUUsS0FBSztRQUNsQixPQUFPLEVBQUUsRUFBRSxDQUFDLE9BQU8sQ0FBQyw4QkFBOEIsQ0FBQztLQUNwRDtJQUVELE9BQU87UUFDTCxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFBO1FBQ2pCLElBQUksRUFBRSxHQUFHLGlqQ0FBaWpDLENBQUM7UUFFM2pDLEVBQUUsQ0FBQyxPQUFPLENBQUM7WUFDVCxHQUFHLEVBQUUsU0FBUyxHQUFHLEdBQUcsQ0FBQyxVQUFVLENBQUMsT0FBTyxHQUFFLGtCQUFrQjtZQUMzRCxNQUFNLEVBQUMsTUFBTTtZQUNiLE1BQU0sRUFBRTtnQkFDTixjQUFjLEVBQUUsa0JBQWtCO2dCQUNsQyxlQUFlLEVBQUUsU0FBUyxHQUFDLEVBQUU7YUFDOUI7WUFDRCxPQUFPLFlBQUMsR0FBRztnQkFDVCxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUE7Z0JBQ2pDLEdBQUcsQ0FBQyxVQUFVLENBQUMsU0FBUyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFBO2dCQUMvQyxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksR0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFBO2dCQUNsRCxFQUFFLENBQUMsU0FBUyxDQUFDO29CQUNYLEdBQUcsRUFBRSxjQUFjO2lCQUNwQixDQUFDLENBQUE7WUFDSixDQUFDO1NBQ0YsQ0FBQyxDQUFBO0lBRUosQ0FBQztJQUNELE1BQU07UUFBTixpQkEyQkM7UUExQkMsSUFBSSxHQUFHLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRTtZQUMzQixJQUFJLENBQUMsT0FBTyxDQUFDO2dCQUNYLFFBQVEsRUFBRSxHQUFHLENBQUMsVUFBVSxDQUFDLFFBQVE7Z0JBQ2pDLFdBQVcsRUFBRSxJQUFJO2FBQ2xCLENBQUMsQ0FBQTtTQUNIO2FBQU0sSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUc1QixHQUFHLENBQUMscUJBQXFCLEdBQUcsVUFBQSxHQUFHO2dCQUM3QixLQUFJLENBQUMsT0FBTyxDQUFDO29CQUNYLFFBQVEsRUFBRSxHQUFHLENBQUMsUUFBUTtvQkFDdEIsV0FBVyxFQUFFLElBQUk7aUJBQ2xCLENBQUMsQ0FBQTtZQUNKLENBQUMsQ0FBQTtTQUNGO2FBQU07WUFFTCxFQUFFLENBQUMsV0FBVyxDQUFDO2dCQUNiLE9BQU8sRUFBRSxVQUFBLEdBQUc7b0JBQ1YsR0FBRyxDQUFDLFVBQVUsQ0FBQyxRQUFRLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQTtvQkFDdEMsS0FBSSxDQUFDLE9BQU8sQ0FBQzt3QkFDWCxRQUFRLEVBQUUsR0FBRyxDQUFDLFFBQVE7d0JBQ3RCLFdBQVcsRUFBRSxJQUFJO3FCQUNsQixDQUFDLENBQUE7Z0JBQ0osQ0FBQzthQUNGLENBQUMsQ0FBQTtTQUNIO0lBQ0gsQ0FBQztJQUNELFdBQVcsRUFBWCxVQUFZLENBQU07UUFDaEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNkLEdBQUcsQ0FBQyxVQUFVLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFBO1FBQzNDLElBQUksQ0FBQyxPQUFPLENBQUM7WUFDWCxRQUFRLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxRQUFRO1lBQzNCLFdBQVcsRUFBRSxJQUFJO1NBQ2xCLENBQUMsQ0FBQTtJQUNKLENBQUM7Q0FDRixDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBpbmRleC50c1xuLy8g6I635Y+W5bqU55So5a6e5L6LXG5jb25zdCBhcHAgPSBnZXRBcHA8SUFwcE9wdGlvbj4oKVxuXG5QYWdlKHtcbiAgZGF0YToge1xuICAgIG1vdHRvOiAnSGVsbG8gV29ybGQnLFxuICAgIHVzZXJJbmZvOiB7fSxcbiAgICBoYXNVc2VySW5mbzogZmFsc2UsXG4gICAgY2FuSVVzZTogd3guY2FuSVVzZSgnYnV0dG9uLm9wZW4tdHlwZS5nZXRVc2VySW5mbycpLFxuICB9LFxuICAvLyDkuovku7blpITnkIblh73mlbBcbiAgYmluZHNzcygpIHtcbiAgICBjb25zb2xlLmxvZyhcIuaMieS6hlwiKVxuICAgIHZhciBzZCA9IFwiZXlKMGVYQWlPaUpLVjFRaUxDSmhiR2NpT2lKU1V6STFOaUlzSW1wMGFTSTZJbUkyT1dNM01UZGhNRGc0TmpBelptSm1OalprTlRNMU1XVTFaVEl4TnpGaU56QmpOalZrTVRnd1lXUTBaR016Tnpaak16YzRNalF6WXpobFlXVXhZMk0yTmpsaVl6aG1ZMlkzWkdSaE16QmhJbjAuZXlKaGRXUWlPaUl4SWl3aWFuUnBJam9pWWpZNVl6Y3hOMkV3T0RnMk1ETm1ZbVkyTm1RMU16VXhaVFZsTWpFM01XSTNNR00yTldReE9EQmhaRFJrWXpNM05tTXpOemd5TkROak9HVmhaVEZqWXpZMk9XSmpPR1pqWmpka1pHRXpNR0VpTENKcFlYUWlPakUxTnpJek5UVTNPVFVzSW01aVppSTZNVFUzTWpNMU5UYzVOU3dpWlhod0lqb3hOakF6T1RjNE1UazFMQ0p6ZFdJaU9pSXlJaXdpYzJOdmNHVnpJanBiWFgwLm5NUE00dEoxQ2Nta29Rak9BMjVRQUd2di11azNYYjdHRkJUcHJIRzJEMXJwX3FPaDZiN1c4S2JHYkZ4RFp2bWE3Ni10ZjBucEVYWUUzUkZCbmZXTVpJYlZ4TzB2cGNRSXRTOS1DWUUtWmxjX3pWeTVyaWJrVTZFamhfd3ZXLU1lWm9OY2l1RU5fRTN0NzMzZnJ6c0dDTDhWek1tUVU2UmgzclBtYnJPblkteW1uMmhIR0NHVGRWU2tXMWRJeF8zZTFKTVZQLXhUUlU0V2lONzVnZU1SRmZlb1VQMEVlTGd1Qm1QckxLZ0RMdWlCZmFkVTJsOThrcXBhMmRLVGxWRHh4MS1tS0N4d0pSdUpPelgxMnZFc3ZKWTBXQjFuTEVaMmEzWTVHYjNFc1NQY3JOcndlMkNwalZmb1ZvNWlqcXpHME1HUWFTZ3dPUXNCTkhWQ1U5RE5COXFHejh4dkJxZFdIWS1DdDNUNHN2cjZYNk1scWRzZTQ0WW9ITnMzck9Uc1lkSHJRYXFRM0F4N3Mwc1VYbVZLTGk5NEQ2YVMxTE9rOTlPNDFXUVhPZ2ZkOGE0elJqMGRTb2NJQkQ1akRWRjFHTkNFeG5fM0ppSi04elRtRHRvRC04T05leWdRMXRhS2xySmp3YjE2UFViOTJsbmN2VEZyQjFzaVotc0lmUS1ZcUYwYkluWU1wdWtOdnhEZFJyTEV1Wlg0OTk1SDF6NDBsZ3psVTFPM2pCc3o1MTl6VEhZRmVZZzBGQ2N4dmxQemhRUXZ0SWtjcHNQUXctcEZoMWdYN0h3czNLeUhTM19sNDZtUEYwWmhKRkZQa0hoNExWRVRweExCeHdrOGUwdnpzdVM2Z2tHWEwzS3B2V0VodV9iSlJTXzlHX1ZOME85MVJLeWhUR3Q5ZkZjXCI7XG5cbiAgICB3eC5yZXF1ZXN0KHtcbiAgICAgIHVybDogXCJodHRwOi8vXCIgKyBhcHAuZ2xvYmFsRGF0YS5NYWluVVJMICtcIi9hcGkvZ2V0VXNlckluZm9cIiwgLy/ku4XkuLrnpLrkvovvvIzlubbpnZ7nnJ/lrp7nmoTmjqXlj6PlnLDlnYBcbiAgICAgIG1ldGhvZDpcIlBPU1RcIixcbiAgICAgIGhlYWRlcjoge1xuICAgICAgICAnY29udGVudC10eXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLCAvLyDpu5jorqTlgLxcbiAgICAgICAgJ0F1dGhvcml6YXRpb24nOiBcIkJlYXJlciBcIitzZFxuICAgICAgfSxcbiAgICAgIHN1Y2Nlc3MocmVzKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKHJlcy5kYXRhLnN0YXR1c190ZXh0KVxuICAgICAgICBhcHAuZ2xvYmFsRGF0YS5Vc2VySW5mb3MgPSByZXMuZGF0YS5zdGF0dXNfdGV4dFxuICAgICAgICBjb25zb2xlLmxvZyhcImdsb2JhbCBkZSBcIithcHAuZ2xvYmFsRGF0YS5Vc2VySW5mb3MpXG4gICAgICAgIHd4LnN3aXRjaFRhYih7XG4gICAgICAgICAgdXJsOiAnLi4vSG9tZS9Ib21lJyxcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9KVxuICAgIFxuICB9LFxuICBvbkxvYWQoKSB7XG4gICAgaWYgKGFwcC5nbG9iYWxEYXRhLnVzZXJJbmZvKSB7XG4gICAgICB0aGlzLnNldERhdGEoe1xuICAgICAgICB1c2VySW5mbzogYXBwLmdsb2JhbERhdGEudXNlckluZm8sXG4gICAgICAgIGhhc1VzZXJJbmZvOiB0cnVlLFxuICAgICAgfSlcbiAgICB9IGVsc2UgaWYgKHRoaXMuZGF0YS5jYW5JVXNlKSB7XG4gICAgICAvLyDnlLHkuo4gZ2V0VXNlckluZm8g5piv572R57uc6K+35rGC77yM5Y+v6IO95Lya5ZyoIFBhZ2Uub25Mb2FkIOS5i+WQjuaJjei/lOWbnlxuICAgICAgLy8g5omA5Lul5q2k5aSE5Yqg5YWlIGNhbGxiYWNrIOS7pemYsuatoui/meenjeaDheWGtVxuICAgICAgYXBwLnVzZXJJbmZvUmVhZHlDYWxsYmFjayA9IHJlcyA9PiB7XG4gICAgICAgIHRoaXMuc2V0RGF0YSh7XG4gICAgICAgICAgdXNlckluZm86IHJlcy51c2VySW5mbyxcbiAgICAgICAgICBoYXNVc2VySW5mbzogdHJ1ZSxcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8g5Zyo5rKh5pyJIG9wZW4tdHlwZT1nZXRVc2VySW5mbyDniYjmnKznmoTlhbzlrrnlpITnkIZcbiAgICAgIHd4LmdldFVzZXJJbmZvKHtcbiAgICAgICAgc3VjY2VzczogcmVzID0+IHtcbiAgICAgICAgICBhcHAuZ2xvYmFsRGF0YS51c2VySW5mbyA9IHJlcy51c2VySW5mb1xuICAgICAgICAgIHRoaXMuc2V0RGF0YSh7XG4gICAgICAgICAgICB1c2VySW5mbzogcmVzLnVzZXJJbmZvLFxuICAgICAgICAgICAgaGFzVXNlckluZm86IHRydWUsXG4gICAgICAgICAgfSlcbiAgICAgICAgfSxcbiAgICAgIH0pXG4gICAgfVxuICB9LFxuICBnZXRVc2VySW5mbyhlOiBhbnkpIHtcbiAgICBjb25zb2xlLmxvZyhlKVxuICAgIGFwcC5nbG9iYWxEYXRhLnVzZXJJbmZvID0gZS5kZXRhaWwudXNlckluZm9cbiAgICB0aGlzLnNldERhdGEoe1xuICAgICAgdXNlckluZm86IGUuZGV0YWlsLnVzZXJJbmZvLFxuICAgICAgaGFzVXNlckluZm86IHRydWUsXG4gICAgfSlcbiAgfSxcbn0pXG4iXX0=