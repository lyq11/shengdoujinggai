interface share {
  info: string;
  status: string;
  id: string;
  type: string;
  isread: any;
  date: any;
}

export class sharemanager {
  private static instance = new sharemanager();
  list: Array<any> = [];
  private constructor() {
    try {
      var temp = wx.getStorageSync("sharelist");
      if (!temp) {
        console.log("不存在旧的邀请消息");
        // Do something with return value
      } else {
        console.log("存在旧的邀请消息");
        this.list = temp;
      }
    } catch (e) {
      console.log("不存在旧的邀请消息");
      // Do something when catch error
    }
  }
  static getInstance(): sharemanager {
    return sharemanager.instance;
  }

  add(noti_new: share) {
    this.list.unshift(noti_new);
    console.log("现在列表里有" + this.list);
    try {
      wx.setStorageSync("sharelist", this.list);
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
    var need = this.list.filter((device:any) => {
      return device.id != id;
    });
    var old = this.list.filter((device: any) => {
      return device.id == id;
    });
    var edit = old[0];
    edit[key] = value;
    console.log(need);
    console.log("------------");
    console.log(old);
  }
}
