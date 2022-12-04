const {defineConfig} = require('@vue/cli-service')
module.exports = defineConfig({
    css: {
        extract: false,
    },
    configureWebpack: {
        optimization: {
            splitChunks: false,
        },
    },
    transpileDependencies: true,
    devServer: {
      proxy: "http://localhost:8008"
    }
})
