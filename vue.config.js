// vue.config.js
module.exports = {
    devServer: {
        proxy: {
            '/restconf/*': {
                target: 'http://10.10.10.10/',
                changeOrigin: true
            }
        }
    }
}