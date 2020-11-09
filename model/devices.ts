//设备接口
interface device {
  id: string | number;
  //设备类型
  type_id: string | number;
  co_id: string | number;
  p_id: string | number;
  device_uni_id: string | number;
  service_status: string | number;
  name: any;
  device_isonline: string | number;
  device_last_online: string | number;
  pcb_ver: any;
  firmware_var: any;
  created_at: any;
  updated_at: any;
  facevalue: any;
  device: any;
}

console.log('ts文件执行了');



//导出一个设备管理器的类
export class devicesmanager {
  private static instance = new devicesmanager();
  private constructor() {}
  static getInstance(): devicesmanager {
    return devicesmanager.instance;
  }
  list: Array<any> = [];
  //添加设备
  add(device_new: device) {
    this.list.push(device_new);
    console.log("现在列表里有"+this.list)
  }
  //清除设备
  clear(){
    this.list = [];
  }
  //编辑设备
  edit(id: string, key: string, value: string) {
    console.log(this.list);
    var old = this.list.filter(device => {
      return device.id == id;
    });
    var edit = old[0];
    console.log("表层", edit);
    var keys = edit[key];
    if (keys != undefined && keys != null && keys != "") {
      console.log("一级传值", keys);
      edit[key] = value;
      console.log("一级传值后", keys);
    } else {
      console.log("二级传值", edit.device[key]);
      edit.device[key] = value;
      console.log("二级传值后", edit.device[key]);
    }

    // console.log(need)
    // console.log("------------")
    // console.log(old)
  }
}
