// vue.config.js
module.exports = {
    chainWebpack: config => {
        config
            .entry('app')
            .clear()
            .add('./src/renderer/renderer.ts')
    }
}
