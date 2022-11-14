const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: [
    'vuetify'
  ],
  devServer: {
    proxy: {
      '/api': {
        target: 'http://openapi1.nhis.or.kr',
        changeOrigin: true,
        pathRewrite: {'^/api': ''}
      }
    }
  }
})
