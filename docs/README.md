# Node 个人笔记

## 1. 什么是 Node?

```js
- node不是语言 他是一个让js可以运行在服务端的一个运行时 （内置模块 文件读写 操作系统及的api）
- js语言组成部分 BOM DOM  ECMASCRIPT  node中只包含了ECMASCRIPT + 模块
- node中间层 解决跨域问题  ssr的实现  工具  （egg nest） 后台项目
- 高并发 （单线程 js中主线程是单线程的）

## 非阻塞异步i/o特性
- 非阻塞  异步  单线程和多线程的区别  i/o
- java 多线程同步

## 单线程 和 多线程
- 多线程可能多条线程操作同一个文件 （锁的问题）  单线程没有锁的问题
- 切换线程执行时 会有消耗  （通过切换时间片的方式 达到同时执行多个任务）
- 多线程占用内存 （可以通过线程池来解决） 也是浪费内存
- 同步阻塞 + 多线程 、 异步非阻塞 + 主线是单线程
- node中自己实现了 异步非阻塞的库 libuv(多线程来实现的) 核心是异步

> 多线程的好处是： 可以做压缩合并 大量计算相关的 （cpu密集型）， node适合i/o密集型 （web应用的常见）

## 阻塞非阻塞 、 异步同步
- 我调用一个方法此时我的状态是阻塞还是非阻塞
- 同步阻塞  异步非阻塞

> 当完成任务后会以事件的形式通知我
```

## 2. Node 前的热身

### 2.1 高阶函数

```js
/**
 * 什么是高阶函数?
 * 满足以下2个条件任意一个就是高阶函数
 *      1. 函数的参数是一个函数
 *      2. 函数内部返回一个函数
 * 高阶函数的应用场景:
 *      react中利用高阶函数+受控组件收集数据
 *      基于原来的代码进行扩展 ==> before
 *			自己/第三方封装一些工具类的方法
 */

// before方法 ==> 让所有函数都有这个方法，那么我们在原型上添加这个方法
Function.prototype.before = function(callback) {
  // this ==> formerCode ==> 谁调用before就指向谁
  // callback ==> before传的函数
  // fn ==> before函数返回的新函数
  return (...args) => {
    callback();
    this(...args);
  };
};

// 原来的代码 ==> formerCode
function formerCode(...args) {
  // 人家的逻辑，我们想在调用这个函数前做一些事情
  console.log('我是原来的代码 --- formerCode');
  console.log(args);
}
// 定义before函数
const fn = formerCode.before(() => {
  console.log('我是在原来代码运行前增加的 --- addCode');
});
fn(1, 2, 3, 4, 5);
```

### 2.2 柯里化函数

```js
/**
 * 什么是柯里化函数？
 *    将一个函数的功能更具体一点，分批传入参数
 * 什么时候用柯里化函数？
 *    如果一个函数的参数是固定不变的，那么就使用柯里化函数
 */

// 这是一个求和的函数
function sum(a, b, c, d) {
  return a + b + c + d;
}
// 那么我们调用的时候就是这么传参的
// const res = sum(1, 2, 3, 4)
// console.log(res)

// 我们可以实现一个通用的柯里化函数，自动的将函数转成可以多次传递参数
function currie(fn) {
  function currfn(args = []) {
    // fn.length === sum的形参个数
    // args.length === 每次调用传进来的参数
    return args.length === fn.length
      ? fn(...args)
      : (...subargs) => currfn([...args, ...subargs]);
  }
  return currfn();
}
console.log(currie(sum)(1)(2)(3)(4));
```

### 2.3 回调函数解决并发问题

```js
/**
 * 什么是回调函数?
 *    1. 你自己定义的
 *    2. 外界没有手动调用
 *    3. 最后自己触发了(达到某一个条件内部触发)
 *
 * 回调函数无处不在？
 *    优点: 可以满足大部分的企业需求
 *    缺点: 如果回调函数内部嵌套过多，会造成回调地狱问题
 *
 */
// 使用回调函数解决异步并发问题
// 比如node.js中读取文件我们使用异步读取,最后合并所有的打印结果返回,常规打印是同步的，所以打印可能为空
const fs = require('fs');
const path = require('path');

let saveFn = after(2, (obj) => {
  console.log(obj);
});

function after(count, callback) {
  // 闭包
  let obj = {};
  return function(key, value) {
    obj[key] = value;
    if (--count === 0) {
      callback(obj);
    }
  };
}

fs.readFile(path.resolve(__dirname, './name.txt'), (err, data) => {
  if (err) {
    console.log(err);
    return;
  }
  saveFn('name', data.toString());
});
fs.readFile(path.resolve(__dirname, './age.txt'), (err, data) => {
  if (err) {
    console.log(err);
    return;
  }
  saveFn('age', data.toString());
});
```

### 2.4 发布订阅模式

```js
/**
 * 什么是发布订阅？
 *    把需要做的事情放入一个容器(订阅),等这件事情你想做的就把容器中的东西取出来然后去执行(发布)
 * 使用场景？
 *		一般的像Vue/React中一些通信手段，比如Vuex/Redux都是采用的发布订阅模式来实现的
 */
const fs = require('fs');
const path = require('path');
const person = {};
const events = {
  arr: [], // 容器
  // 订阅
  on(fn) {
    this.arr.push(fn);
  },
  // 发布
  emit() {
    this.arr.forEach((fn) => fn());
  },
};
events.on(() => {
  if (Object.keys(person).length === 2) {
    console.log(person);
  }
});
fs.readFile(path.resolve(__dirname, './name.txt'), (err, data) => {
  if (err) {
    console.log(err);
    return;
  }
  person.name = data.toString();
  events.emit();
});
fs.readFile(path.resolve(__dirname, './age.txt'), (err, data) => {
  if (err) {
    console.log(err);
    return;
  }
  person.age = data.toString();
  events.emit();
});
```

### 2.5 观察者模式

```js
/**
 * 什么是观察者模式？
 *    观察者模式一般分为二种
 *        1. 观察者(内部会有一个方法，一旦被观察者状态发生变化，这个方法会被调用，然后传入被观察者的最新状态)
 *        2. 被观察者(内部应该装载着观察者，一旦自己状态改变，应该通知观察者去更新)
 */

// 被观察者
class Observed {
  constructor(name) {
    this.name = name;
    this.status = '难过';
    this.arr = []; // 装载容器
  }
  // 装载函数
  attach(observer) {
    this.arr.push(observer);
  }
  // 改变状态的函数
  setState(newStatus) {
    // 记录旧状态
    const oldVal = this.status;
    // 改变状态,生成新状态
    const newVal = (this.status = newStatus);
    // 通知观察者更新
    this.arr.forEach((fn) => fn.upload(oldVal, newVal, this.name));
  }
}
// 观察者
class Observer {
  constructor(name) {
    this.name = name;
  }
  upload(oldVal, newVal, name) {
    console.log(`${name}之前${oldVal},${this.name}知道了~~`);
    console.log(`${name}现在${newVal},${this.name}知道了~~`);
  }
}
const observed = new Observed('宝宝');
const observer1 = new Observer('爸爸');
const observer2 = new Observer('妈妈');
// 装载观察者
observed.attach(observer1);
observed.attach(observer2);
// 更新宝宝的状态
observed.setState('开心');
setTimeout(() => {
  observed.setState('睡着了');
}, 2000);
```

### 2.6 手写符合 Promise A+规范的 Promise

```js
function corePromise(p2, x, resolve, reject) {
  if (x === p2) {
    reject(new TypeError('孩子,别干傻事'));
  }
  if ((typeof x === 'object' && x !== null) || typeof x === 'function') {
    let called = false;
    try {
      const then = x.then;
      if (typeof then === 'function') {
        then.call(
          x,
          (y) => {
            if (called) return;
            called = true;
            corePromise(p2, y, resolve, reject);
          },
          (r) => {
            if (called) return;
            called = true;
            reject(r);
          }
        );
      } else {
        if (called) return;
        called = true;
        resolve(x);
      }
    } catch (error) {
      if (called) return;
      called = true;
      reject(error);
    }
  } else {
    resolve(x);
  }
}
class Promise {
  static all(values) {
    return new Promise((resolve, reject) => {
      let arr = [],
        count = 0;
      for (let i = 0; i < values.length; i++) {
        const x = values[i];
        if ((typeof x === 'object' && x !== null) || typeof x === 'function') {
          const then = x.then;
          if (typeof then === 'function') {
            then.call(
              x,
              (y) => {
                count++;
                arr[i] = y;
                if (count === values.length) {
                  resolve(arr);
                }
              },
              (r) => {
                reject(r);
              }
            );
          } else {
            count++;
            arr[i] = x;
          }
        } else {
          count++;
          arr[i] = x;
        }
      }
    });
  }
  static promisify(fn) {
    return (...args) => {
      return new Promise((resolve, reject) => {
        fn(...args, (err, data) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(data);
        });
      });
    };
  }
  static resolve(value) {
    return new Promise((resolve, reject) => {
      if (value instanceof Promise) {
        value.then(
          (y) => {
            resolve(y);
          },
          (r) => {
            reject(r);
          }
        );
      } else {
        resolve(value);
      }
    });
  }
  static reject(value) {
    return new Promise((resolve, reject) => {
      if (value instanceof Promise) {
        value.then(reject, reject);
      } else {
        reject(value);
      }
    });
  }
  static race(values) {
    return new Promise((resolve, reject) => {
      let called = false;
      for (let i = 0; i < values.length; i++) {
        const x = values[i];
        if (x instanceof Promise) {
          called = true;
          x.then(
            (y) => {
              resolve(y);
            },
            (r) => {
              reject(r);
            }
          );
        } else {
          if (called) return;
          // 普通值
          resolve(x);
        }
      }
    });
  }
  constructor(executor) {
    this._status = 'pending';
    this._value = undefined;
    this._callbacks = {
      onResolved: [],
      onRejected: [],
    };
    const resolve = (value) => {
      if (this._status !== 'pending') return;
      this._status = 'resolved';
      this._value = value;
      this._callbacks.onResolved.forEach((fn) => fn());
    };
    const reject = (reason) => {
      if (this._status !== 'pending') return;
      this._status = 'rejected';
      this._value = reason;
      this._callbacks.onRejected.forEach((fn) => fn());
    };
    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }
  then(onResolved, onRejected) {
    onResolved = typeof onResolved === 'function' ? onResolved : (val) => val;
    onRejected =
      typeof onRejected === 'function'
        ? onRejected
        : (err) => {
            throw err;
          };
    let p2 = new Promise((resolve, reject) => {
      if (this._status === 'resolved') {
        setTimeout(() => {
          try {
            const x = onResolved(this._value);
            corePromise(p2, x, resolve, reject);
          } catch (error) {
            reject(error);
          }
        }, 0);
      }
      if (this._status === 'rejected') {
        setTimeout(() => {
          try {
            const x = onRejected(this._value);
            corePromise(p2, x, resolve, reject);
          } catch (error) {
            reject(error);
          }
        }, 0);
      }
      if (this._status === 'pending') {
        this._callbacks.onResolved.push(() => {
          setTimeout(() => {
            try {
              const x = onResolved(this._value);
              corePromise(p2, x, resolve, reject);
            } catch (error) {
              reject(error);
            }
          }, 0);
        });
        this._callbacks.onRejected.push(() => {
          setTimeout(() => {
            try {
              const x = onRejected(this._value);
              corePromise(p2, x, resolve, reject);
            } catch (error) {
              reject(error);
            }
          }, 0);
        });
      }
    });
    return p2;
  }
  catch(onRejected) {
    this.then(null, onRejected);
  }
  finally(fn) {
    return this.then(
      (y) => fn() || Promise.resolve(y),
      (r) => fn() || Promise.reject(r)
    );
  }
}
module.exports = Promise;

// 测试我们写的Promise是否符合promise a+ 规范
// promise a+ 规范文档地址: https://promisesaplus.com/
// promise a+ 规范测试文档地址: https://github.com/promises-aplus/promises-tests
// 测试流程: yarn --> 下载包    yarn start 跑测试
Promise.deferred = function() {
  let dot = {};
  // 测试我们的promise,a+规范中只有resolve，reject，并没有其他的一些方法
  dot.promise = new Promise((resolve, reject) => {
    dot.resolve = resolve; // 测试我们自己实现的resolve
    dot.reject = reject; // 测试我们自己实现的reject
  });
  return dot;
};
module.exports = Promise;
```

### 2.7 Promise 实现红绿灯

```js
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      list-style: none;
    }

    div {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      border: 1px solid #ccc;
      transition: all 0.3s linear;
      margin: 10px;
    }

    .red {
      background-color: red;
    }

    .yellow {
      background-color: yellow;
    }

    .green {
      background-color: green;
    }
  </style>
</head>

<body>
  <div></div>
  <div></div>
  <div></div>
  <script>
    const divList = document.querySelectorAll('div')
    const red = divList[0]
    const yellow = divList[1]
    const green = divList[2]
    !(function light() {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (red.className.indexOf('red') === -1) {
            green.classList.remove('green')
            red.classList.add('red')
          }
          resolve()
        }, 3000)
      })
        .then(() => {
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              if (yellow.className.indexOf('yellow') === -1) {
                red.classList.remove('red')
                yellow.classList.add('yellow')
              }
              resolve()
            }, 2000)
          })
        })
        .then(() => {

          return new Promise((resolve, reject) => {
            setTimeout(() => {
              if (green.className.indexOf('green') === -1) {
                yellow.classList.remove('yellow')
                green.classList.add('green')
              }
              resolve()
            }, 1000)
          })
        })
        .then(() => {
          setTimeout(() => {
            divList.forEach(item => item.className = '')
          }, 1000)
          light()
        })
    })()



  </script>
</body>

</html>
```

### 2.8 环境变量

```js
/**
 *
 * 环境变量:
 *    1. 当前代码的可运行环境，这个可运行环境中的变量(process)就叫做环境变量
 *    2. 一般分为全局环境变量和临时环境变量
 *    3. 全局环境变量: 在电脑中配置死的，比如：window中就在电脑-->高级系统设置-->环境变量
 *    4. 临时环境变量: 比如项目中一般都会有这个功能，根据不同的环境变量去读取不同的配置文件,区分开发、生产、测试、预生产
 *    5. 设置临时环境变量:
 *       windows下命令: set xx=xx
 *       mac下命令: export xx=xx
 *    6. 解决不同系统运行指令不一样的问题 --> 第三方插件(cross-env)
 */

// 根据不同的环境加载不同的配置
let prefix = ''
if (process.env.NODE_ENV === 'dev') {
  // 开发环境
  prefix = '/dev/api'
} else if (process.env.NODE_ENV === 'prod') {
  // 生产环境
  prefix = '/prod/api'
} else if (process.env.NODE_ENV === 'test') {
  // 测试环境
  prefix = '/test/api'
} else if (process.env.NODE_ENV === 'bug') {
  // 提交bug环境
  prefix = '/bug/api'
} else {
  // 预发布环境
  prefix = '/willProd/api'
}
module.exports = prefix

const config = require('./config')
console.log(config)

`package.json文件中`
{
  "name": "varvalid",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "dev": "cross-env NODE_ENV=dev node index.js",
    "prod": "cross-env NODE_ENV=prod node index.js",
    "test": "cross-env NODE_ENV=test node index.js",
    "bug": "cross-env NODE_ENV=bug node index.js",
    "willProd": "cross-env NODE_ENV=willProd node index.js",
    "dev:mac": "export NODE_ENV=dev && node index.js",
    "prod:mac": "export NODE_ENV=prod && node index.js",
    "test:mac": "export NODE_ENV=test && node index.js",
    "bug:mac": "export NODE_ENV=bug && node index.js",
    "willProd:mac": "export NODE_ENV=willProd && node index.js"
  },
  "author": "",
  "license": "ISC",
  "dependencies": {
    "cross-env": "^7.0.3"
  }
}
```

### 2.9 自定义全局包

```js
/**
 * 自定义全局包:
 *    1. 需要有一个bin目录
 *    2. 在bin目录中新建一个文件
 *    3. 在该文件的首行指定环境  #! /usr/bin/env node(代表node环境)
 *    4. 初始化一个package.json文件
 *    5. 在package.json中指定bin字段 "bin": {
                        "zcf": "./bin/zcf"
                      },
      6. key为指令名字，value为输入该指令，运行的文件
      7. 通过npm link 链接(会将该文件临时存放到全局npm目录中)
 */
`zcf文件中`
#! /usr/bin/env node
require('colors');
console.log(`
iiiiiiiiiiiiii   iiiiiiiiiiiiii   iiiiiiiiiiiiiii
          iii    ii               ii
       iii       ii               iiiiiiiiiiiiiii
    iii          ii               ii
iiiiiiiiiiiiiii  iiiiiiiiiiiiii   ii
`.cyan);
console.log(`

`)
console.log(`
yyyyyyyyyyyyyyy   yy      yy      yy          yy
yy                  yy  yy        yy          yy
yy                    yy          yyyyyyyyyyyyyy
yy                  yy   yy       yy          yy
yyyyyyyyyyyyyyy  yy         yy    yy          yy
`.cyan)
```

### 3.0 虚拟 dom 渲染成真实 dom

```js
const vDoms = [
  {
    type: 'h1',
    attribute: 'h1',
    content: '你好',
    children: [
      {
        type: 'h2',
        attribute: 'h2',
        content: '你好2',
        children: [
          {
            type: 'h3',
            attribute: 'h3',
            content: '你好3',
          },
        ],
      },
    ],
  },
  {
    type: 'div',
    attribute: 'div',
    content: 'div1111',
  },
  {
    type: 'p',
    attribute: 'p',
    content: 'p1111',
    children: [
      {
        type: 'p',
        attribute: 'p1111',
        content: 'p儿子1111',
      },
      {
        type: 'p',
        attribute: 'p2222',
        content: 'p儿子2222',
      },
    ],
  },
  {
    type: 'span',
    attribute: 'span',
    content: 'span1111',
    children: [],
  },
];
class renderVDom {
  constructor(vDoms) {
    // 初始化文档碎片
    this.fragment = document.createDocumentFragment();
    this.count = 0;
    this.vDoms = vDoms;
    // 开始渲染vDoms
    this.render(vDoms);
  }
  // 渲染成dom节点
  render(vDoms, parentDom) {
    // 判断数据类型
    if (vDoms.constructor.name !== 'Array') {
      console.error('传入数据格式需要为一个数组');
    }
    for (let i = 0; i < vDoms.length; i++) {
      // 每一个虚拟dom对象
      const vDom = vDoms[i];
      // 解构拿到里面的3个属性
      const { type, content, attribute } = vDom;
      // 如果type不存在,输出错误
      if (!type) {
        console.error('类型错误');
      }
      // 开始编译vDom，第一次的parentDom为undefined
      this.compile(vDom, parentDom);
    }
  }
  // 编译成dom
  compile(vDom, parentDom) {
    const { type, content, attribute } = vDom;
    // 判断parentDom是否为undefined，如果为undefiend就代表是一级节点，就应该插入到文档碎片里面，如果不是，就应该插入到父级节点中
    const parentEl = parentDom ? parentDom : this.fragment;
    // 创建标签
    const dom = document.createElement(type);
    // 写入标签内容
    dom.textContent = content;
    // 如果属性存在就设置属性
    if (attribute) {
      this.setDomAttribute(dom, attribute);
    }
    // 如果有children属性并且长度大于0
    if (vDom.children && vDom.children.length > 0) {
      // 递归渲染，这个传的dom就代表是父级了，那parentDom就会有值
      this.render(vDom.children, dom);
    }
    // 如果
    if (parentEl === this.fragment) {
      this.count++;
    }
    this.appendFragment(parentEl, dom);
  }
  // 设置属性
  setDomAttribute(dom, attribute) {
    dom.setAttribute('class', attribute);
  }
  // 插入到文档碎片
  appendFragment(parentDom, dom) {
    parentDom.appendChild(dom);
    if (this.count === this.vDoms.length) {
      this.appendNode(this.fragment);
    }
  }
  // 把文档碎片插入到指定元素中
  appendNode(fragment, node) {
    node = node ? node : document.body;
    node.appendChild(fragment);
  }
}
new renderVDom(vDoms);
```

## 3. EventLoop

```js
默认是先从上到下依次执行代码,
  依次清空每个队列中的回调方法.每调用一个宏任务后都会清空微任务;
// 宏任务 （老版本中 是每清空完毕一个队列后才会去执行微任务）
// timers 存放所有定时器回调的 [fn,fn,fn]
// poll阶段 主要存放的异步的i/o操作 node中基本上所有的异步api的回调都会在这个阶段来处理  []
// check是存放setImmediate的回调  []
// 主栈 => 检测时间又没有到达的定时，有就执行 (清空任务) => 下一个阶段就是poll(i/o操作) => 也是逐一清空 => 看setImmediate队列中是否有内容，如果有内容则清空check阶段， 如果没有就在这阻塞 => 不停的看定时器中有没有到达时间，如果有则回去继续执行
```

## 4. Package.json

```js
依赖分为 开发依赖 项目依赖 同版本依赖 捆绑依赖（打包依赖 npm pack） 可选依赖
开发依赖:devDependencies ==> 开发环境需要用到的包
项目依赖:dependencies ==> 生产环境需要用到的包
同版本依赖:peerDependencies ==> 同一个版本需要的依赖
捆绑依赖:bundledDependencies ==> 下某一个包时对应的捆绑依赖，没有下载会提示
打包依赖命令: npm pack

## scripts
scripts中可以配置命令，然后通过npm/yarn来启动命令

## npx
npx 是node5.2之后赠送给你的
npx 直接运行node_modules/.bin文件夹下命令 多了一个下载功能 用完即删除 方便
```

## 5. Commjs 规范

```js
## 为什么需要模块化？
可以解决冲突、实现高内聚低耦合
1.每一个文件都是一个模块
2.需要通过module.exports 导出需要给别人使用的值
3.通过require 拿到需要的结果

## 实现Commjs规范
const path = require('path');
const fs = require('fs');
const vm = require('vm'); // 虚拟机模块 创建沙箱用的
function Module(id) {
    this.id = id;
    this.exports = {};
}
// 内部可能有n种解析规则
Module._extensions = {
    '.js'(module) {
        let script = fs.readFileSync(module.id, 'utf8'); // 读取文件的内容
        let code = `(function (exports, require, module, __filename, __dirname) {
            ${script}
        })`;
        let func = vm.runInThisContext(code);
        let exports = module.exports;
        let thisValue = exports
        let dirname = path.dirname(module.id);
        func.call(thisValue,exports,req,module,module.id,dirname);
    },
    '.json'(module) {
        let script = fs.readFileSync(module.id, 'utf8');
        module.exports = JSON.parse(script)
    } // 根据不同的后缀 定义解析规则
}
Module._resolveFilename = function(id) {
    let filePath = path.resolve(__dirname, id);
    // 我应该看下这个文件路径是否存在，如果不存在尝试添加后缀
    let isExsits = fs.existsSync(filePath);
    if (isExsits) return filePath; // 文件存在直接返回
    let keys = Object.keys(Module._extensions); // [.js,.json]

    for (let i = 0; i < keys.length; i++) {
        let newFilePath = filePath + keys[i];
        if (fs.existsSync(newFilePath)) return newFilePath
    }
    throw new Error('模块文件不存在')
}
Module.prototype.load = function() {
    // 核心的加载，根据文件不同的后缀名进行加载
    let extname = path.extname(this.id);
    Module._extensions[extname](this);
}
Module._cache = {};
Module._load = function(id) {
    let filename = Module._resolveFilename(id); // 就是将用户的路径变成绝对路径

    if(Module._cache[filename]){
        return Module._cache[filename].exports; // 如果有缓存直接将上次缓存的结果返回即可
    }

    let module = new Module(filename);
    Module._cache[filename] = module;
    module.load(); // 内部会读取文件 用户会给exports对象赋值
    return module.exports;
}
function req(id) { // 根据用户名加载模块
    return Module._load(id);
}
const r = require('./b.js');

// 基本数据类型和 引用类型的区别
setTimeout(() => {
    let  r = require('./b.js');
    console.log(r);
}, 2000);
console.log(r);

// 调试方法
// node --inspect-brk 文件名
// chrome://inspect/
// vscode 直接进行调试  要配置文件，删除跳过源代码那块
```

## 6. Event 使用

```js
const Events = require('./myEvents');
const event = new Events();
/**
 * newListener 是events事件监听器自带的，每次绑定一个事件后都会触发newListener对应的回调函数
 */
// event.on('newListener', (event, listener) => {
//   console.log(event, listener)
// })
// event.on('newListener', (event, listener) => {
//   console.log(event, listener)
// })
event.on('test', (value) => {
  console.log(value);
});
event.once('test2', (...args) => {
  console.log('只触发一次', ...args);
});
event.emit('test2', 1231, 111);
event.emit('test2', 2113, 222);
// event.emit('test', '吃')
// event.emit('test', '喝')
// event.emit('test', '玩')
```

### 6.1 手写 Event

```js
// { eventName1: [fn1, fn2] }
class Events {
  constructor() {
    this.events = {};
  }
  on(eventName, callback) {
    if (!this.events[eventName]) {
      this.events[eventName] = [callback];
    } else {
      this.events[eventName] = [...this.events[eventName], callback];
    }
  }
  emit(eventName, ...args) {
    if (this.events[eventName]) {
      this.events[eventName].forEach((fn) => fn(...args));
    }
  }
  once(eventName, callback) {
    // 绑定之后被触发一次就解绑
    const fn = (...args) => {
      callback(...args);
      this.off(eventName, fn);
    };
    this.on(eventName, fn);
  }
  off(eventName, callback) {
    if (this.events[eventName]) {
      this.events[eventName] = this.events[eventName].filter((fn) => {
        return fn !== callback;
      });
    }
  }
}
module.exports = Events;
```

## 7. 读取和写入(fs)

```js
// node中fs方法分为2种，同步和异步
// 同步操作会阻塞，我们一般都使用异步的方法
// 异步操作node中很常见，一般都是通过回调函数的方法通知我们，第一个参数一般都是为error

// 优点:不会阻塞，读取速度快，适用于小文件(小于64kb的都属于小文件)
// 缺点:不适用大文件读写操作，，因为是把所有的数据都读完在进行写入的，可能会导致内存溢出
// 解决方式: 可以读取一点写入一点，可以通过 fs.open,fs.read,fs.write
```

### 7.1 普通方式读取和写入

```js
const fs = require('fs');
const path = require('path');

fs.readFile(path.resolve(__dirname, './test.md'), (err, data) => {
  if (err) {
    return console.log(err);
  }
  fs.writeFile(path.resolve(__dirname, './copy.md'), data, (err) => {
    if (err) {
      return console.log(err);
    }
    console.log('copy success');
  });
});
```

### 7.2 读取部分读取和写入部分数据

#### 7.2.1 普通方式

```js
const fs = require('fs');
const path = require('path');

const buffer = Buffer.alloc(3);
fs.open(path.resolve(__dirname, './test.md'), 'r', 0o666, (err, fd) => {
  if (err) {
    return console.log(err);
  }
  // console.log(fd) // 读取到的是字节 22
  /**
   * fd:文件描述符
   * buffer:写入哪个buffer
   * 0:从buffer的哪个位置开始写
   * 3:每次写入几个
   * 0:读取文件的位置
   */
  fs.read(fd, buffer, 0, 3, 0, (err, bytesRead) => {
    if (err) {
      return console.log(err);
    }
    // console.log(bytesRead) // 读取到的是真实字节的个数 一个中文字符代表3个字节
    // console.log(buffer, 'buffer') // <Buffer e6 83 a0>
    fs.open(path.resolve(__dirname, './copy.md'), 'w', (err, wfd) => {
      if (err) {
        return console.log(err);
      }
      fs.write(wfd, buffer, (err, written) => {
        if (err) {
          return console.log(err);
        }
        console.log(written, 'written'); // 写入字节的个数
        // 关闭
        fs.close(fd, () => {});
        fs.close(wfd, () => {});
      });
    });
  });
});
```

#### 7.2.2 递归写入

```js
const fs = require('fs');
const path = require('path');

let position = 0;
let size = 1;
let buffer = Buffer.alloc(size);

// 可以基于流来实现 大文件的读取
// fs中 createReadStream createWriteStream  基于stream模块来实现的
fs.open(path.resolve(__dirname, './test.md'), 'r', (err, rfd) => {
  fs.open(path.resolve(__dirname, './copy.md'), 'w', (err, wfd) => {
    function next() {
      fs.read(rfd, buffer, 0, size, position, (err, bytesRead) => {
        if (bytesRead > 0) {
          // 读到了内容
          fs.write(wfd, buffer, 0, bytesRead, position, (err, written) => {
            // 写入成功,修正下次读取位置
            position += bytesRead;
            next();
          });
        } else {
          // 读取完毕
          fs.close(rfd, () => {});
          fs.close(wfd, () => {});
        }
      });
    }
    next();
  });
});
```

### 7.3 可读流使用

```js
const fs = require('fs');
const path = require('path');
const arr = [];
const rs = fs.createReadStream(path.resolve(__dirname, './test.md'), {
  flags: 'r',
  encoding: null,
  mode: 0o666,
  autoClose: true,
  start: 0,
  highWaterMark: 3, // 每次读取3个字节
});
rs.on('open', (fd) => {
  console.log(fd, 'fd');
});
rs.on('data', (chunk) => {
  arr.push(chunk);
  console.log(chunk, 'chunk');
});
rs.on('end', () => {
  console.log('end');
  console.log(Buffer.concat(arr).toString());
});
rs.on('close', () => {
  console.log('close');
});
```

### 7.4 手写可读流

```js
const fs = require('fs');
const Event = require('events');
class ReadStream extends Event {
  // 初始化参数
  constructor(path, options) {
    super(); // 继承父类Event的方法和属性
    this.path = path;
    this.encoding = options.encoding || null;
    this.fd = options.fd || null;
    this.flags = options.flags || 'r';
    this.mode = options.mode || 0o666;
    this.autoClose = options.autoClose || true;
    this.start = options.start || 0;
    this.end = options.end || undefined;
    this.highWaterMark = options.highWaterMark || 64 * 1024; // 每次读取64kb
    this.offset = 0;
    this.open(); // 打开文件
    // 每次绑定事件都会触发此事件
    this.on('newListener', (type) => {
      if (type === 'data') {
        // 说明外界有绑定消费(data)事件
        this.read(); // 读取文件
      }
    });
  }
  // 打开文件
  open() {
    fs.open(this.path, this.flags, (err, fd) => {
      if (err) {
        this.destroy(err);
        return;
      }
      if (!this.fd) {
        this.fd = fd;
      }
      this.emit('open', fd);
    });
  }
  // 消费
  read() {
    if (!this.fd) {
      this.once('open', () => this.read());
    } else {
      // 如果外界传了end，就要和highWaterMark进行比较
      const readBytes = this.end
        ? Math.min(this.highWaterMark, this.end - this.offset + 1)
        : this.highWaterMark;
      const buffer = Buffer.alloc(readBytes);
      fs.read(this.fd, buffer, 0, readBytes, this.offset, (err, bytesRead) => {
        if (err) {
          this.destroy(err);
          return;
        }
        if (bytesRead > 0) {
          // 正在读取
          this.emit('data', buffer);
          // 修正下次读取的偏移量
          this.offset += bytesRead;
          // 递归读取
          this.read();
        } else {
          // 读完了
          this.destroy();
        }
      });
    }
  }
  // 错误或者关闭
  destroy(err) {
    if (err) {
      // 分发错误事件
      this.emit('error', err);
    } else {
      this.emit('end'); // 分发读取结束事件
      if (this.autoClose) {
        fs.close(this.fd, () => {
          this.emit('close'); // 分发关闭事件
        });
      }
    }
  }
}

module.exports = ReadStream;
```

### 7.5 可写流使用

```js
```

### 7.6 手写可写流

```js
```

## 8. 链表

## 9. 树的遍历

## 10. 文件夹递归删除

```js
```

## 11. http 概念

```js
```
