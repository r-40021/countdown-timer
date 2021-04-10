window.addEventListener("DOMContentLoaded", (event) => {
  setTimeout(function () {
    const loader = document.getElementById("load");
    if (loader.classList.contains("loaded") === false) {
      loader.classList.add("loaded"); //5000ms経ったら強制的にローディング画面解除
    }
  }, 5000);
});
/*変数の定義*/
var down;
var displayEnd;
var oldDisplay;
var useDevice = 0;
var menuStatus = 1;
var timerStatus = 0;

/*初期アラーム音設定*/
var alarm = new Audio("alarm.mp3");
alarm.loop = true;
var noSleep = new NoSleep();

/*Service Worker*/
if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker.register("sw.js").then(
      function (registration) {
        // Registration was successful
        console.log(
          "ServiceWorker registration successful with scope: ",
          registration.scope
        );
      },
      function (err) {
        // registration failed :(
        console.log("ServiceWorker registration failed: ", err);
      }
    );
  });
}

window.addEventListener("load", (event) => {
  /*読み込み終わったらローディング画面解除*/
  const loader = document.getElementById("load");
  loader.classList.add("loaded");
  flex(); //スマホのURLバーに隠されないように
  setTimeout(function () {
    pushrequest(); //プッシュ通知に関するお知らせ
  }, 499);
});

window.addEventListener("DOMContentLoaded", function () {
  device();
  onload();
});

window.addEventListener("DOMContentLoaded", function () {
  /*メニューの上げ下げ*/
  const upmenu = document.getElementById("upmenu");
  const downmenu = document.getElementById("downmenu");
  const menu1 = document.getElementById("menu1");
  const menu2 = document.getElementById("menu2");
  var once;
  upmenu.addEventListener("click", function () {
    if (menuStatus === 1 || menuStatus === 3) {
      clearTimeout(once);
      menu2.classList.add("is-open");
      if (menuStatus === 1) {
        menuStatus = 2;
      }
      upmenu.style.visibility = "hidden";
    } else if (menuStatus === 0) {
      menu1.classList.add("is-open");
      menuStatus = 3; //３秒以内に全開したら、ワンクリックで閉じる
      downmenu.style.visibility = "visible";
      once = setTimeout(f, 3000);
    }
  });
  downmenu.addEventListener("click", function () {
    //メニューを閉じる
    clearTimeout(once);
    if (menuStatus === 3) {
      menu2.classList.remove("is-open");
      menu1.classList.remove("is-open");
      upmenu.style.visibility = "visible";
      downmenu.style.visibility = "hidden";
      document.querySelector("audio#player").pause();
      menuStatus = 0;
    } else if (menuStatus === 2) {
      menu2.classList.remove("is-open");
      menuStatus = 1;
      document.querySelector("audio#player").pause();
      upmenu.style.visibility = "visible";
    } else if (menuStatus === 1) {
      menu1.classList.remove("is-open");
      menuStatus = 0;
      downmenu.style.visibility = "hidden";
    }
  });
});

function f() {
  menuStatus = 1;
}

window.addEventListener("DOMContentLoaded", function () {
  const click = document.getElementById("click");
  click.addEventListener("click", function () {
    if (timerStatus) {
      document.getElementById("stopTimer").click();
    } else {
      document.getElementById("setTimer").click();
    }
  });
});

function device() {
  var userAgent = window.navigator.userAgent.toLowerCase(); //ブラウザ情報取得
  if (
    userAgent.indexOf("msie") === -1 &&
    userAgent.indexOf("trident") === -1 /*IEを省く*/ &&
    (userAgent.indexOf("windows") != -1 ||
      (userAgent.indexOf("mac os x") != -1 &&
        "ontouchend" in document ===
          false) /*mac os xが含まれていて、かつマウスデバイス*/ ||
      userAgent.indexOf("cros") != -1 ||
      (userAgent.indexOf("linux") != -1 && "ontouchend" in document === false))
  ) {
    //PCとIE以外でしか実行しない
    useDevice = 1;
  }
  if (
    userAgent.indexOf("iphone") != -1 ||
    (userAgent.indexOf("mac os x") != -1 && "ontouchend" in document)
  ) {
    /*iPhone/iPad除く*/ /*iPhone/iPadのときは、アラーム音関連・全画面表示関連を非表示*/
    const dateField = document.getElementById("DateField");
    const timeField = document.getElementById("TimeField");
    dateField.classList.replace("s5", "s6");
    timeField.classList.replace("s5", "s6");
    document.getElementById("fullscreen").style.display = "none";
    document.getElementById("escFullscreen").style.display = "none";
    document.getElementById("menu1").classList.add("iPhone");
    document.getElementById("menu2").classList.add("iPhone");
  } else {
    document.getElementById("audioInput").style.display = "inline";
    document.getElementById("playb").style.display = "inline";
  }
  if ("ontouchend" in document === false) {
    //PCのときは、hover
    document.getElementById("upmenu").classList.add("pc");
    document.getElementById("downmenu").classList.add("pc");
  }
}

window.addEventListener("DOMContentLoaded", function () {
  // フルスクリーン表示
  document.getElementById("fullscreen").addEventListener("click", function () {
    // Chrome & Firefox v64以降
    if (document.body.requestFullscreen) {
      document.body.requestFullscreen();

      // Firefox v63以前
    } else if (document.body.mozRequestFullScreen) {
      document.body.mozRequestFullScreen();

      // Safari & Edge & Chrome v68以前
    } else if (document.body.webkitRequestFullscreen) {
      document.body.webkitRequestFullscreen();

      // IE11
    } else if (document.body.msRequestFullscreen) {
      document.body.msRequestFullscreen();
    }
  });

  // フルスクリーン解除
  document
    .getElementById("escFullscreen")
    .addEventListener("click", function () {
      // Chrome & Firefox v64以降
      if (document.exitFullscreen) {
        document.exitFullscreen();

        // Firefox v63以前
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();

        // Safari & Edge & Chrome v44以前
      } else if (document.webkitCancelFullScreen) {
        document.webkitCancelFullScreen();

        // IE11
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    });
});

function onload() {
  resize(); //文字サイズ調整
  /*パラメータ取得*/
  var param = location.search;
  var paramObject = new Object();

  if (param) {
    param = param.substring(1);
    var parameters = param.split("&");

    for (var i = 0; i < parameters.length; i++) {
      var element = parameters[i].split("=");

      var paramName = decodeURIComponent(element[0]);
      var paramValue = decodeURIComponent(element[1]);

      paramObject[paramName] = paramValue;
    }
    //テキストボックスに日時をセット
    document.getElementById("Date").value = paramObject.date;
    document.getElementById("Time").value = paramObject.time;

    var myDate = paramObject.date;
    var myTime = paramObject.time;
    var target = new Date(myDate + " " + myTime + ":00"); //設定時間

    /*カウントダウン（一番大事）*/
    function myCount() {
      var displayPlace = document.getElementById("displayTime");
      date = new Date();
      var diffTime = target.getTime() - date.getTime(); //時間の差を計算
      var diffHour = Math.floor(diffTime / (1000 * 60 * 60)); //時間に変換
      var diffMinute = Math.floor(
        (diffTime - diffHour * 1000 * 60 * 60) / (1000 * 60)
      ); //分に変換
      var diffSecond = Math.floor(
        (diffTime - diffHour * 1000 * 60 * 60 - diffMinute * 1000 * 60) / 1000
      ); //秒に変換
      if (diffMinute < 10) {
        diffMinute = "0" + diffMinute;
      }
      if (diffSecond < 10) {
        diffSecond = "0" + diffSecond;
      }
      var display = diffHour + ":" + diffMinute + ":" + diffSecond;
      if (display === "0:00:00") {
        display = "0:00:00";
        displayPlace.innerHTML = display;
        document.title = "やまだのタイマー";
        /*通知(タッチデバイスとIEはなし)*/
        try {
          if (useDevice) {
            Push.create("時間です！", {
              body: "くっ...時の流れが疾風迅雷の俺に追いついたようだ......",
              icon: "./favicon/favicon.ico", //アイコン
              requireInteraction: true, // 永遠に通知
              onClick: function () {
                window.focus();
                this.close();
                stop();
                audiostop();
              },
            });
          }
        } catch (error) {
          console.log("error");
        }
        var noevent = document.getElementById("audioicon");
        noevent.classList.add("noevent"); //クリック不可
        document.getElementById("audioInput").classList.add("noevent");
        noevent.classList.remove("autoevent");
        document.getElementById("audioInput").classList.remove("autoevent");
        noevent.classList.replace("teal-text", "grey-text");
        alarm.play();
        if (menuStatus === 0) {
          document.getElementById("menu1").classList.add("is-open");
          menuStatus = 1;
          downmenu.style.visibility = "visible";
        }
        stop();
        document.title = "やまだのタイマー";
        document.getElementById("bigtimer").style.backgroundColor = "#ec407a";
        var timerbox = document.getElementById("displayTime");
        displayEnd = setInterval(function () {
          timerbox.style.color = "#d81b60";
          document.title = "時間です！";
          setTimeout(function () {
            timerbox.style.color = "#FFFFFF";
            document.title = "やまだのタイマー";
          }, 500);
        }, 1000);
      } /*計算結果が負orNaNのときの処理*/ else if (display.match("-|NaN")) {
        stop();
        display = "0:00:00";
        displayPlace.innerHTML = display;
        document.title = "やまだのタイマー";
      } else {
        timerStatus = 1;
        if (display != oldDisplay) {
          displayPlace.innerHTML = display;
          document.title = display;
          oldDisplay = display;
        }
      }
    }
    down = setInterval(myCount, 200);
  } else {
    /*パラメータがなかったら*/
    let date = new Date();
    let after = new Date();
    after.setHours(date.getHours() + 1);
    let defaultSet = after.toLocaleString().split(" ");
    const defaultDate = defaultSet[0];
    let originalDefaultTime = defaultSet[1].split(":");
    const defaultTime = originalDefaultTime[0] + ":" + originalDefaultTime[1];
    document.getElementById("Date").value = defaultDate;
    document.getElementById("Time").value = defaultTime;
  }
}

function set() {
  /*SETボタンを押したときの挙動*/
  var url = new URL(window.location.href);
  var myDate = document.getElementById("Date").value;
  var myTime = document.getElementById("Time").value;
  history.replaceState(
    null,
    "やまだのタイマー",
    "index.html?date=" + myDate + "&time=" + myTime
  ); //パラメータセット（リロードなし）
  stop();
  onload();
  audiostop();
  Push.clear(); //通知削除
}

document.addEventListener("DOMContentLoaded", function () {
  /*datepicker*/
  var elems = document.querySelectorAll(".datepicker");
  var options = {
    format: "yyyy/m/d",
  };
  var instances = M.Datepicker.init(elems, options);
  /*timepicker*/
  elems = document.querySelectorAll(".timepicker");
  options = {
    twelveHour: false,
  };
  instances = M.Timepicker.init(elems, options);
  /*modal*/
  elems = document.querySelectorAll(".modal");
  instances = M.Modal.init(elems);
  elems = document.querySelectorAll(".tooltipped");
  instances = M.Tooltip.init(elems);
});

function copy() {
  /*URLコピー*/
  var url = location.href;
  navigator.clipboard.writeText(url);
  M.toast({ html: "URLをコピーしました" });
}

function resize(params) {
  const place = document.getElementById("displayTime");
  let count = place.innerHTML.length;
  if (window.innerWidth <= 775) {
    place.style.fontSize = 150 / count + "vmin"; //文字サイズ調整(Tablet&SP)
  } else {
    place.style.fontSize = 195 / count + "vmin"; //文字サイズ調整
  }
}

function stop() {
  clearInterval(down);
}

function audiostop() {
  timerStatus = 0;
  var noevent = document.getElementById("audioicon");
  noevent.classList.replace("noevent", "autoevent");
  document
    .getElementById("audioInput")
    .classList.replace("noevent", "autoevent");
  noevent.classList.replace("grey-text", "teal-text"); //クリック不可
  alarm.pause();
  alarm.currentTime = 0; //音停止
  clearInterval(displayEnd);
  var timerbox = document.getElementById("displayTime");
  timerbox.style.color = "#FFFFFF";
  document.getElementById("bigtimer").style.backgroundColor = "#4db6ac";
}

function pushrequest() {
  if (useDevice) {
    //PCとIE以外でしか実行しない
    /*トーストで通知の権限を通知*/
    if (Push.Permission.has() == false) {
      M.toast({
        html:
          "通知を許可して、時間になったらデスクトップに通知が届くようにしてください",
      });
    }
    /*プッシュ通知許可ダイアログ*/
    Push.Permission.request(onGranted);

    function onGranted() {
      M.toast({ html: "時間になったらデスクトップ通知でお知らせします" });
    }
  } else {
    M.toast({
      html:
        '<span>ご利用の環境では、時間になってもプッシュ通知を行うことができません。</span><a class="btn-flat toast-action modal-trigger" href="#push">MORE</a>',
    });
  }
}

window.addEventListener("load", () => {
  /*アラーム音設定・プレビューも*/
  const f = document.getElementById("file1");
  var player = document.getElementById("player");
  f.addEventListener("change", (evt) => {
    let input = evt.target;
    if (input.files.length == 0) {
      return;
    }
    const file = input.files[0];
    if (!file.type.match("audio.*")) {
      M.toast({ html: "音声ファイルを選択してください" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      alarm = new Audio(reader.result);
      alarm.loop = true;
      player.src = reader.result;
      M.toast({
        html:
          "アラーム音を設定しました。<br>このページから離れると、アラーム音はリセットされます。",
      });
      window.addEventListener("beforeunload", move, false);
    };

    reader.readAsDataURL(file);
  });
});

var move = function (e) {
  //ページ離脱時に警告
  e.preventDefault();
  // Chrome では returnValue を設定する必要がある
  e.returnValue = "";
};

/*NoSleep*/
document.addEventListener(
  "click",
  function enableNoSleep() {
    document.removeEventListener("click", enableNoSleep, false);
    noSleep.enable();
  },
  false
);

window.addEventListener("DOMContentLoaded", function () {
  //残り時間が変わったら、文字サイズ調整
  var element = document.getElementById("displayTime");
  var action = new MutationObserver(function (record, observer) {
    resize();
  });
  var config = {
    childList: true,
  };
  action.observe(element, config);
});

function flex() {
  /*スマホのURLバーに隠されないように*/
  var height = window.innerHeight;
  document.getElementsByClassName("flex")[0].style.height = height + "px";
  document.body.style.height = height + "px";
}
window.addEventListener("resize", function () {
  resize();
  flex();
});
var addcursor;
window.addEventListener(
  "mousemove",
  function () {
    try {
      document.body.classList.remove("hidecursor");
    } catch (e) {}
    clearTimeout(addcursor);
    addcursor = setTimeout(() => {
      document.body.classList.add("hidecursor");
    }, 3000);
  },
  false
);

window.addEventListener("load", function () {
  var context = document.getElementById("context");
  document.body.addEventListener("contextmenu", function (e) {
    var windowWidth = document.body.offsetWidth;
    var windowHeight = document.body.offsetHeight;
    var contextWidth = context.offsetWidth;
    var contextHeight = context.offsetHeight;
    if (e.pageX + contextWidth >= windowWidth) {
      context.style.right = windowWidth - e.pageX + "px";
      context.style.left = null
    } else {
      context.style.left = e.pageX + "px";
      context.style.right = null
    }
    if (e.pageY + contextHeight >= windowHeight) {
      context.style.bottom = windowHeight - e.pageY + "px";
      context.style.top = null
    } else {
      context.style.top = e.pageY + "px";
      context.style.bottom = null
    }
    context.classList.add('is-open');
  });
});
document.body.addEventListener("click", function (e) {
  context.classList.remove('is-open');
});
