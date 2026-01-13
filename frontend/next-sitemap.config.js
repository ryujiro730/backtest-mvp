/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://delvertrade.com',
  generateRobotsTxt: true,

  // アプリ・API は sitemap から除外
  exclude: ['/api/*', '/app/*'],

  // 余計な変換・追加パスは一切しない
};
