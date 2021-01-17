const path = require('path')
module.exports = {
  base: '/notes/',
  title: '小惠喜欢常富',
  description: 'zcflovecxh',
  // 主题配置
  themeConfig: {
    nextLinks: true, // 下一篇
    prevLinks: true, // 上一篇
    sidebar: 'auto', // 自动生成侧边栏
    // 搜索框右侧的内容配置
    nav: [
      { text: '首页', link: '/' },
      { text: '个人github', link: 'https://github.com/Zheng-Changfu', target: '_blank' },
    ],
    smoothScroll: true, // 开启滚动效果
  },
  // 注册组件
  plugins: [
    [
      '@vuepress/back-to-top',
    ],
  ],
  // 添加路由
  additionalPages: [
    {
      path: '/login',
      frontmatter: {
        layout: 'Login'
      }
    }
  ],
  // 可以控制根组件的生命周期
  clientRootMixin: path.resolve(__dirname, 'mixin.js')
}