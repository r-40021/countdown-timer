const MODE = ["development","production"];
module.exports = {
    // メインとなるJavaScriptファイル（エントリーポイント）
  entry: `./src/index.js`,

  // ファイルの出力設定
  output: {
    // 出力ファイル名
    filename: "main.min.js"
  },
    // モード値を [1](production) に設定すると最適化された状態で、
    // [0](development) に設定するとソースマップ有効でJSファイルが出力される
    mode: MODE[1],
  
    // ローカル開発用環境を立ち上げる
    // 実行時にブラウザが自動的に localhost を開く
    devServer: {
      contentBase: "./",
      open: true
    },
  };