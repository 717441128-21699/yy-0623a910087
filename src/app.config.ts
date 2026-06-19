export default defineAppConfig({
  pages: [
    'pages/patient-list/index',
    'pages/bonding/index',
    'pages/follow-up/index',
    'pages/bonding-detail/index',
    'pages/follow-up-detail/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: '正畸粘接管理',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    color: '#86909c',
    selectedColor: '#1677ff',
    backgroundColor: '#ffffff',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/patient-list/index',
        text: '患者'
      },
      {
        pagePath: 'pages/bonding/index',
        text: '粘接'
      },
      {
        pagePath: 'pages/follow-up/index',
        text: '复诊'
      }
    ]
  }
})
