/*変数の定義*/
var down, displayEnd, oldDisplay, title, myDate, myTime;
var useDevice = 0;
var timerStatus = 0;

/*初期アラーム音設定*/
var alarm = new Audio("alarm.mp3");
alarm.loop = true;
alarm.volume = document.getElementById("audioVolume").value / 100;
var noSleep = new NoSleep();

document.addEventListener("DOMContentLoaded", function () {
  device();
  onload();
});

document.getElementById("Date").addEventListener(
  "change",
  () => {
    document.getElementById("dateLabel").value =
      document.getElementById("Date").value;
  },
  false
);
document.getElementById("Time").addEventListener(
  "change",
  () => {
    document.getElementById("timeLabel").value =
      document.getElementById("Time").value;
  },
  false
);

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
  } else {
    document.getElementById("audioInput").style.display = "inline-block";
  }
}

document.addEventListener("DOMContentLoaded", function () {
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
    document.getElementById("dateLabel").value =
      document.getElementById("Date").value;
    document.getElementById("Time").value = paramObject.time;
    document.getElementById("timeLabel").value =
      document.getElementById("Time").value;
    if (paramObject.title) {
      title = decodeURIComponent(paramObject.title);
      document.getElementById("title").value = title;
    }

    myDate = paramObject.date;
    myTime = paramObject.time;
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
        document.getElementById("audioInput").classList.add("noevent");
        document.getElementById("audioInput").classList.remove("autoevent");
        alarm.play();
        stop();
        document.title = "やまだのタイマー";
        displayEnd = setInterval(function () {
          document.title = "時間です！";
          displayPlace.style.color = "rgb(255 38 111)";
          displayPlace.style.visibility = "hidden";
          setTimeout(function () {
            document.title = "気付け！！";
            displayPlace.style.visibility = "";
          }, 500);
        }, 1000);
      } /*計算結果が負orNaNのときの処理*/ else if (display.match("-|NaN")) {
        stop();
        if (display.match("-")) {
          M.toast({ html: "過去の日時はセットできません" });
        } else if (display.match("NaN")) {
          M.toast({ html: "むむ？" });
        }
        display = "0:00:00";
        displayPlace.innerHTML = display;
        document.title = "やまだのタイマー";
      } else {
        timerStatus = 1;
        document.getElementById("stopTimer").style.display = "inline-flex";
        document.getElementById("setTimer").style.display = "none";
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
  myDate = document.getElementById("Date").value;
  myTime = document.getElementById("Time").value;
  changeURL();
  stop();
  onload();
  audiostop();
  Push.clear(); //通知削除
}

function changeURL() {
  if (title) {
    history.replaceState(
      null,
      "やまだのタイマー",
      "index.html?date=" +
        myDate +
        "&time=" +
        myTime +
        "&title=" +
        encodeURIComponent(title)
    ); //パラメータセット（リロードなし）
  } else {
    history.replaceState(
      null,
      "やまだのタイマー",
      "index.html?date=" + myDate + "&time=" + myTime
    ); //パラメータセット（リロードなし）
  }
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
  // tab
  elems = document.querySelectorAll(".tabs");
  instances = M.Tabs.init(elems);
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
  document.getElementById("stopTimer").style.display = "";
  document.getElementById("setTimer").style.display = "";

  document
    .getElementById("audioInput")
    .classList.replace("noevent", "autoevent");

  stopAlarm();
  clearInterval(displayEnd);
  var timerbox = document.getElementById("displayTime");
  timerbox.style.color = "";
  timerbox.style.visibility = "";
  document.title = "やまだのタイマー";
}

function stopAlarm() {
  alarm.pause();
  alarm.currentTime = 0; //音停止
}

function pushrequest() {
  if (useDevice) {
    //PCとIE以外でしか実行しない
    /*プッシュ通知許可ダイアログ*/
    Push.Permission.request();
  }
}

window.addEventListener("load", () => {
  /*アラーム音設定・プレビューも*/
  const f = document.getElementById("file1");
  f.addEventListener("change", formatNode, false);
  function formatNode(e) {
    let input = e.target;
    selectFile(input.files);
  }
  function selectFile(e) {
    if (e.length == 0) {
      return;
    }
    const file = e[0];
    if (!file.type.match("audio.*")) {
      M.toast({ html: "音声ファイルを選択してください" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      alarm = new Audio(reader.result);
      alarm.loop = true;
      alarm.volume = document.getElementById("audioVolume").value / 100;
      M.toast({
        html: "アラーム音を設定しました。<br>このページから離れると、アラーム音はリセットされます。",
      });
      window.addEventListener("beforeunload", move, false);
    };

    reader.readAsDataURL(file);
  }
  // Drug & Drop
  let dropbox;
  let bgColor = "#cbf3fa";
  dropbox = document.getElementById("droppable");
  dropbox.addEventListener("dragenter", dragenter, false);
  dropbox.addEventListener("dragover", dragover, false);
  dropbox.addEventListener("dragleave", dragleave, false);
  dropbox.addEventListener("drop", drop, false);
  function dragenter(e) {
    dropbox.style.backgroundColor = bgColor;
    e.stopPropagation();
    e.preventDefault();
  }

  function dragover(e) {
    dropbox.style.backgroundColor = bgColor;
    e.stopPropagation();
    e.preventDefault();
  }
  function dragleave(e) {
    dropbox.style.backgroundColor = "";
    e.stopPropagation();
    e.preventDefault();
  }
  function drop(e) {
    e.stopPropagation();
    e.preventDefault();
    const dt = e.dataTransfer;
    const files = dt.files;
    selectFile(files);
  }
});

var move = function (e) {
  //ページ離脱時に警告
  e.preventDefault();
  // Chrome では returnValue を設定する必要がある
  e.returnValue = "";
};

/*NoSleep & Focus*/
document.addEventListener(
  "click",
  function enableNoSleep() {
    document.removeEventListener("click", enableNoSleep, false);
    noSleep.enable();
    focus();
  },
  false
);

document.addEventListener("DOMContentLoaded", function () {
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
  /*カーソル隠す*/
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
window.addEventListener(
  "keypress",
  function (e) {
    if (e.key === "Enter") {
      document.getElementById("setTimer").click();
    }
  },
  false
);

function focus() {
  /*Focus to the set button*/
  document.getElementById("setTimer").focus();
}

document.getElementById("testAudio").addEventListener(
  "click",
  (e) => {
    alarm.play();
    e.stopPropagation();
    document.addEventListener(
      "click",
      (e) => {
        if (e.target.id !== "audioVolume") {
          stopAlarm();
        }
      },
      false
    );
  },
  false
);
document.getElementById("audioVolume").addEventListener(
  "input",
  (e) => {
    alarm.volume = document.getElementById("audioVolume").value / 100;
  },
  false
);
document.getElementById("title").addEventListener("input", () => {
  title = document.getElementById("title").value;
  changeURL();
});
