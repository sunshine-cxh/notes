import {
  Form,
  FormItem,
  Input,
  Row,
  Col,
  Button,
  Icon,
  Message,
  Tabs,
  TabPane
} from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css';
export default ({
  Vue, // VuePress 正在使用的 Vue 构造函数
  options, // 附加到根实例的一些选项
  router, // 当前应用的路由实例
  siteData, // 站点元数据
  isServer // 当前应用配置是处于 服务端渲染 或 客户端
}) => {
  Vue.use(Form)
  Vue.use(FormItem)
  Vue.use(Input)
  Vue.use(Row)
  Vue.use(Col)
  Vue.use(Button)
  Vue.use(Icon)
  Vue.use(Tabs)
  Vue.use(TabPane)
  Vue.prototype.$msg = Message
}