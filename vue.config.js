module.exports = {
  transpileDependencies: ["vuetify"],
  chainWebpack: config => {
    config
      .entry("app")
      .clear()
      .add("./src/renderer/renderer.ts");
  }
};
