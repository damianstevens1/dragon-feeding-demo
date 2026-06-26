module.exports = {
  esbuild: false,
  build: {
    target: "esnext",
    minify: false,
    cssMinify: false,
    reportCompressedSize: false,
    chunkSizeWarningLimit: 2000
  }
};
