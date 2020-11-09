interface noti {
  info: string;
  device_id: string;
  warning_type: string;
  warning_id: string;
  warning_noti_type: string;
  current_value: string | any;
  warning_line: string | any;
  time: string | any;
}

export class notimanager {
  private static instance = new notimanager();
  list: Array<any> = [];
  private constructor() {
    try {
      var temp = wx.getStorageSync("notilist");
      if (!temp) {
        console.log("不存在旧的通知消息");
        // Do something with return value
      } else {
        console.log("存在旧的通知消息");
        this.list = temp;
      }
    } catch (e) {
      console.log("不存在旧的通知消息");
      // Do something when catch error
    }
  }
  static getInstance(): notimanager {
    return notimanager.instance;
  }

  add(noti_new: noti) {
    this.list.unshift(noti_new);
    console.log("现在列表里有" + this.list);
    try {
      wx.setStorageSync("notilist", this.list);
      console.log("储存通知消息");
    } catch (e) {
      console.log("储存通知消息失败");
    }
  }
  show() {
    console.log("当前对象为", JSON.stringify(this.list));
  }
  edit(id: string, key: string, value: string) {
    console.log(this.list);
    var need = this.list.filter(device => {
      return device.id != id;
    });
    var old = this.list.filter(device => {
      return device.id == id;
    });
    var edit = old[0];
    edit[key] = value;
    console.log(need);
    console.log("------------");
    console.log(old);
    try {
      wx.setStorageSync("notilist", this.list);
      console.log("储存通知消息");
    } catch (e) {
      console.log("储存通知消息失败");
    }
  }
}
