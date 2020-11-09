interface Observer {
  name: string;
  callback: callbackfun;
  sendMsg(msg: string, user: string): any;
  receiveMsg(sender: Observer, msg: string): any;
}

interface Subject {
  register(observer: Observer): any;
  unregister(observer: Observer): any;
  sendMsg(sender: Observer, msg: string, user: string): any;
}
type callbackfun = (a: string) => void
class user implements Observer {
  callback: callbackfun;
  constructor(public name: string, private subject: Subject, public noticallback: callbackfun) {
    this.subject.register(this);
    this.callback = noticallback;

  }
  sendMsg(msg: string, user: string) {
    this.subject.sendMsg(this, msg, user);
  }

  receiveMsg(sender: Observer, msg: string) {
    console.log(`${this.name} 收到来自${sender.name}的消息： ${msg} `);
    this.callback(msg)
  }
}
class group implements Subject {
  private userList: Array<Observer> = [];

  register(observer: Observer) {
    this.userList.push(observer);
  }

  unregister(observer: Observer) {
    var index = this.userList.indexOf(observer);
    if (index > -1) {
      this.userList.splice(index, 1);
      console.log("成功注销",observer);
    }else{
      console.log("未成功注销",observer);
    }
   
    console.log("当前注册者为",this.userList);
  }

  sendMsg(sender: Observer, msg: string, user: string) {
    // console.log(`服务器收到${sender.name}发信息：${msg}，通知所有人`);
    this.notify(sender, msg, user);
  }

  private notify(sender: Observer, msg: string, user: string) {
    this.userList.forEach(
      function (userinlist) {
        if (userinlist.name == user) {
          userinlist.receiveMsg(sender, msg)
        }
      }
    )
  }
}
export class wsmanager {
  private static instance = new wsmanager()
  static centra = new group();
  private constructor() { }
  static getInstance(): wsmanager {
    return wsmanager.instance
  }
  eguser(name: string, callb: callbackfun) {
    console.log(name + "已注册");
    return new user(name, wsmanager.centra, callb)
  }
  cguser(name:user){
    wsmanager.centra.unregister(name)
  }
}