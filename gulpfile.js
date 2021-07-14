// gulpプラグインを読み込みます
const { src, dest, watch } = require("gulp");
// Sassをコンパイルするプラグインを読み込みます
const sass = require('gulp-sass')(require('sass'));
const fibers = require('fibers');

/**
 * Sassをコンパイルするタスクです
 */
const compileSass = () =>
  // style.scssファイルを取得
  src("./src/style.scss")
    // Sassのコンパイルを実行
    .pipe(sass(
      { fiber: fibers }
    ))
    .pipe(
      // コンパイル後のCSSを展開
      sass({
        outputStyle: "compressed"
      })
    )
    // 以下に保存
    .pipe(dest("./dist"));

/**
 * Sassファイルを監視し、変更があったらSassを変換します
 */
const watchSassFiles = () => watch("./src/style.scss", compileSass);

// npx gulpというコマンドを実行した時、watchSassFilesが実行されるようにします
exports.default = watchSassFiles;