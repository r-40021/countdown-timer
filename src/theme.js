let anime; //テーマ変更時のアニメーション(timeout)
let themeStatus; //テーマがユーザー設定(1)なのか否か(0)
const isDark = window.matchMedia("(prefers-color-scheme: dark)");//ダークモード？

export function toggleTheme(mql) {
    clearInterval(anime); //0.4秒後にbodyのトランジョン解除のタイマーを解除
    document.body.classList.add("anime"); //bodyのトランジョンを有効化
    let auto = document.getElementById("auto"); //「システムに従う」ボタン
    let light = document.getElementById("light"); //「ライトモード」ボタン
    let dark = document.getElementById("dark"); //「ダークモード」ボタン
    if (themeStatus) {
      // ユーザーがボタンを押した(2回目以降)
      if (mql === "d") {
        // 「ダークモード」選択時
        document.body.classList.add("dark"); //ダークモードにする
        changeThemeColor("dark"); //フッターのアイコンを変更
        noActive();
        dark.setAttribute("checked", null); //選択中のボタンを目立たせる
        localStorage.setItem("theme", "dark"); //Local Storageに保存
      } else if (mql === "l") {
        // 「ライトモード」選択時
        document.body.classList.remove("dark"); //ダークモード解除
        changeThemeColor("light"); //フッターのアイコンを変更
        noActive();
        light.setAttribute("checked", null); //選択中のボタンを目立たせる
        localStorage.setItem("theme", "light"); //Local Storageに保存
      } else if (mql === "a") {
        // // 「システムに任せる」選択時
        // if (isDark.matches) {
        //   /* ダークテーマの時 */
        //   document.body.classList.add("dark"); //ダークモードにする
        //   changeThemeColor("dark"); //フッターのアイコンを変更
        //   localStorage.setItem("theme", "auto"); //Local Storageに保存
        // } else {
        //   /* ライトテーマの時 */
        //   document.body.classList.remove("dark");
        //   changeThemeColor("light");
        //   localStorage.setItem("theme", "auto"); //Local Storageに保存
        // }
        document.body.classList.add("dark");
        changeThemeColor("dark");
        localStorage.setItem("theme", "auto");
        noActive();
        auto.setAttribute("checked", null); //選択中のボタンを目立たせる
      }
    } else {
      /*現時点でオート設定の時*/
      if (/*(isDark.matches || mql === "d") && */mql !== "l") {
        /* ダークテーマの時 */
        document.body.classList.add("dark"); //ダークモードにする
        changeThemeColor("dark"); //フッターのアイコンを変更
        if (mql === "d") {
          noActive();
          dark.setAttribute("checked", null); //選択中のボタンを目立たせる
          localStorage.setItem("theme", "dark"); //Local Storageに保存
        } else {
          localStorage.setItem("theme", "auto"); //Local Storageに保存
        }
      } else {
        /* ライトテーマの時 */
        document.body.classList.remove("dark"); //ダークモード解除
        changeThemeColor("light"); //フッターのアイコンを変更
        if (mql === "l") {
          noActive();
          light.setAttribute("checked", null); //選択中のボタンを目立たせる
          localStorage.setItem("theme", "light"); //Local Storageに保存
        } else {
          localStorage.setItem("theme", "auto"); //Local Storageに保存
        }
      }
    }
    if (mql === "d" || mql === "l") {
      themeStatus = 1; //手動でダークorライト
    } else if (mql === "a") {
      themeStatus = 0; //システムに従うを選択時
    }
    anime = setInterval(() => {
      document.body.classList.remove("anime");
    }, 400); //0.4秒後、bodyのトランジョンを解除
    function changeThemeColor(type) {
      let color;
      if (type === "dark") {
        color = "#333";
      } else {
        color = "#f8f9fa";
      }
      let head = document.head.children;
      for (let index = 0; index < head.length; index++) {
        const element = head[index].getAttribute("name");
        if (element === "theme-color") {
          head[index].setAttribute("content", color);
          break;
        }
      }
    }
  }
  function noActive() {
    //すべてのボタンを非アクティブにする
    let list = document.querySelectorAll("#settings-3 .radio input");
    list.forEach(function (element) {
      element.removeAttribute("checked");
    });
  }
  try {
    //システムのテーマが変更されたときに発動
    // Chrome & Firefox
    isDark.addEventListener("change", toggleTheme);
  } catch (e1) {
    try {
      // Safari
      isDark.addListener(toggleTheme);
    } catch (e2) {
      console.error(e2);
    }
  }