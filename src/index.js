require("materialize-css");// Materialize読み込み
var Push = require("push.js");// プッシュ通知のライブラリを読み込み
import NoSleep from "../node_modules/nosleep.js/dist/NoSleep";// スリープしないように
/*変数の定義*/
var down, displayEnd, oldDisplay, title, myDate, myTime, target, kiduke;
var useDevice = 0;
let firstLoad = 0;
let anime; //テーマ変更時のアニメーション(timeout)
let themeStatus; //テーマがユーザー設定(1)なのか否か(0)
var paramStatus = 1;//パラメータがあるか
var durationStatus = 0;//「経過時間」で設定か
let countTimes = 0;//SETボタン押下後すぐか
var durationStop = false;//「経過時間」でせっていし、一時停止中か
let durationChange = false;//「経過時間」の設定が変わったか
let setType;//「経過時間」or「経過時間→日時設定」
/*Dark Theme*/
const isDark = window.matchMedia("(prefers-color-scheme: dark)");//ダークモード？

/*初期アラーム音設定*/
var alarm = new Audio("/countdown-timer/alarm.mp3");
alarm.loop = true;
alarm.volume = document.getElementById("audioVolume").value / 100;
var testAlarm = new Audio("/countdown-timer/alarm.mp3");
/*アラーム音の視聴用 */
testAlarm.loop = true;
testAlarm.volume = document.getElementById("audioVolume").value / 100;
var noSleep = new NoSleep();

document.addEventListener("DOMContentLoaded", function () {
  device();
  // Theme
  if (localStorage.getItem("theme") === "dark") {
    // ローカルストレージを読み込み、テーマを反映
    toggleTheme("d");
  } else if (localStorage.getItem("theme") === "light") {
    toggleTheme("l");
  } else if (localStorage.getItem("theme") === "auto") {
    toggleTheme("a");
  } else {
    toggleTheme(isDark);
  }
  //パラメータを取得
  let params = new URL(window.location.href).searchParams;
  if (params.get("date") && params.get("time")) {
    paramStatus = 0;
  }
  var param = location.search;
  var paramObject = new Object();
  param = param.substring(1);
  var parameters = param.split("&");

  for (var i = 0; i < parameters.length; i++) {
    var element = parameters[i].split("=");

    var paramName = decodeURIComponent(element[0]);
    var paramValue = decodeURIComponent(element[1]);

    paramObject[paramName] = paramValue;
  }

  //経過時間設定が変わったら
  let durationSettingElements = document.getElementsByClassName("durationSet");
  for (let i = 0; i < durationSettingElements.length; i++) {
    const element = durationSettingElements[i];
    element.addEventListener("change", () => {
      durationChange = true;
    })
  }
  //最後の設定をテキストボックスに代入
  if (localStorage.getItem("ct-lastDuration")) {
    let localDuration = localStorage.getItem("ct-lastDuration");
    let duration = localDuration.split(":");
    document.getElementById("hour").value = Number(duration[0]);
    document.getElementById("minute").value = Number(duration[1]);
    document.getElementById("seconds").value = Number(duration[2]);
    setType = "duration";
  }
  if (paramObject.date && paramObject.time) {
    //テキストボックスに日時をセット
    document.getElementById("Date").value = paramObject.date;
    document.getElementById("dateLabel").value =
      document.getElementById("Date").value;
    document.getElementById("Time").value = paramObject.time;
    document.getElementById("timeLabel").value =
      document.getElementById("Time").value;
    setType = null;
  } else if (
    localStorage.getItem("ct-date") &&
    localStorage.getItem("ct-time")
  ) {
    //「日時設定」のLocalStorageから取得・テキストボックスにセット
    let localDate = localStorage.getItem("ct-date");
    let localTime = localStorage.getItem("ct-time");
    let localTarget = new Date(localDate + " " + localTime + ":00");
    if (localTarget.getTime() > Date.now()) {
      //テキストボックスに日時をセット
      document.getElementById("Date").value = localDate;
      document.getElementById("dateLabel").value =
        document.getElementById("Date").value;
      document.getElementById("Time").value = localTime;
      document.getElementById("timeLabel").value =
        document.getElementById("Time").value;
      setType = null;
    } else {
      // Local Storageの時間が過去だったら
      noParams();
      setType = null;
    }
  } else {
    //パラメータ＆Local Storageなし
    noParams();
    setType = null;
  }
  if (localStorage.getItem("volume")) {
    let localVolume = localStorage.getItem("volume");
    alarm.volume = localVolume;
    testAlarm.volume = localVolume;
    showVolume();
    document.getElementById("audioVolume").value = localVolume * 100;//前回の音量を取得しセット
  }
  onload();
});
function clickHeader() {
  document.getElementById("durationHeader").click();//「経過時間で設定」の項目を表示させる
}



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
    const elements = document.getElementsByClassName("noiphone");
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      element.style.display = "none";
    }
  }
  pushrequest();
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
    }, false);
});

function onload() {
  resize(); //文字サイズ調整
  /*パラメータ取得*/
  showVolume();
  countTimes = 0;

  /*パラメータを取得し、オブジェクト化*/
  var param = location.search;
  var paramObject = new Object();
  param = param.substring(1);
  var parameters = param.split("&");

  for (var i = 0; i < parameters.length; i++) {
    var element = parameters[i].split("=");

    var paramName = decodeURIComponent(element[0]);
    var paramValue = decodeURIComponent(element[1]);

    paramObject[paramName] = paramValue;
  }
  if (paramObject.title) {
    title = decodeURIComponent(paramObject.title);
    document.getElementById("title").value = title;
  } else if (localStorage.getItem("ct-title") && !paramObject.date && !paramObject.time) {
    title = localStorage.getItem("ct-title");
    document.getElementById("title").value = title;
  }
  if ((setType === "duration") || ((firstLoad === 0 && localStorage.getItem("ct-lastType") == "1") && !paramObject.date && !paramObject.time)) {
    durationStatus = 1;
    if (!document.getElementById("durationHeader").classList.contains("active")) {
      window.addEventListener("load", clickHeader, false);
    }
    changeURL();//URL変更
    if ((((localStorage.getItem("ct-lastType") === "1" && !firstLoad) && (Number(localStorage.getItem("ct-lastSet")) >= 1000)) || durationStop) && !durationChange) {
      // 「経過時間」でセット
      let localSet = localStorage.getItem("ct-lastSet");
      let localSetHour = Math.floor(localSet / (1000 * 60 * 60));
      let localSetMin = Math.floor((localSet - localSetHour * 1000 * 60 * 60) / (1000 * 60));
      let localSetSec = (localSet - localSetHour * 1000 * 60 * 60 - localSetMin * 1000 * 60) / 1000;
      afterTime(localSetHour, localSetMin, localSetSec);
    } else if (firstLoad) {
      let elementList = document.getElementsByClassName("durationSet");
      for (let i = 0; i < elementList.length; i++) {
        let element = elementList[i];
        if (!element.value) {
          element.value = 0;
        }
      }
      afterTime(document.getElementById("hour").value, document.getElementById("minute").value, document.getElementById("seconds").value);
    }
    if (((((localStorage.getItem("ct-lastType") === "1" && !firstLoad) && (Number(localStorage.getItem("ct-lastSet")) >= 1000)) || durationStop) && !durationChange) || firstLoad) {
      // Local Storageに保存されていた場合
      localStorage.setItem("ct-lastDuration", document.getElementById("hour").value + ":" + document.getElementById("minute").value + ":" + document.getElementById("seconds").value);
      durationStop = false;
      durationChange = false;
      localStorage.setItem("ct-lastType", 1);
      setType = "duration";
      down = setInterval(myCount, 200);
    } else {
      // 保存されていない
      noParams();
    }
    function afterTime(hour, minute, second) {
      /* 〇時間〇分〇秒後を取得 */
      let now = new Date();
      now.setHours(now.getHours() + Number(hour));
      now.setMinutes(now.getMinutes() + Number(minute));
      now.setSeconds(now.getSeconds() + Number(second));
      myDate = now.getFullYear() + "/" + (now.getMonth() + 1) + "/" + now.getDate();
      myTime = now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
      target = new Date(myDate + " " + myTime); //設定時間
    }
  } else if (setType === "target") {
    // 「日時」で設定
    localStorage.setItem("ct-lastType", 0);
    durationStatus = 0;
    target = new Date(myDate + " " + myTime + ":00"); //設定時間
    changeURL();
    down = setInterval(myCount, 200);
  } else if (paramObject.date && paramObject.time) {
    // パラメータが存在
    localStorage.setItem("ct-lastType", 0);
    durationStatus = 0;
    myDate = paramObject.date;
    myTime = paramObject.time;
    target = new Date(myDate + " " + myTime + ":00"); //設定時間
    down = setInterval(myCount, 200);
  } else if (
    localStorage.getItem("ct-date") &&
    localStorage.getItem("ct-time")
  ) {
    // Local Storageから「日時で設定」
    localStorage.setItem("ct-lastType", 0);
    let localDate = localStorage.getItem("ct-date");
    let localTime = localStorage.getItem("ct-time");
    let localTarget = new Date(localDate + " " + localTime + ":00");
    if (localTarget.getTime() > Date.now()) {
      window.addEventListener("load", () => { document.getElementById("targetSetBtn").click(); }, false);
    } else {
      localStorage.removeItem("ct-date");
      localStorage.removeItem("ct-time");
      noParams();
    }
  } else {
    // 初めて
    localStorage.setItem("ct-lastType", 0);
    durationStatus = 0;
  }
  firstLoad = 1;
  durationStop = false;
  if (setType === "target") {
    setType = null;
  }
}





/*カウントダウン（一番大事）*/
function myCount() {
  var displayPlace = document.getElementById("displayTime");
  var date = new Date();
  var diffTime = target.getTime() - date.getTime(); //時間の差を計算
  if (diffTime || diffTime === 0) {
    localStorage.setItem("ct-lastSet", diffTime);
    let newMyDate = new Date(myDate);
    /* ステータスにアラームが鳴る時刻を表示 */
    let myDisplayTime;
    if (durationStatus) {
      let myTimeSplit = myTime.split(":");
      if (Number(myTimeSplit[1]) < 10) {
        myTimeSplit[1] = "0" + myTimeSplit[1];
      }
      myDisplayTime = myTimeSplit[0] + ":" + myTimeSplit[1];
    } else {
      myDisplayTime = myTime;
    }
    if (newMyDate.getFullYear() === date.getFullYear()) {
      if (newMyDate.getMonth() === date.getMonth() && newMyDate.getDate() === date.getDate()) {
        document.getElementById("alarmTimeValue").textContent = myDisplayTime;// 今日(日付を省略)
      } else {
        document.getElementById("alarmTimeValue").textContent = newMyDate.getMonth() + 1 + "/" + newMyDate.getDate() + " " + myDisplayTime;// 同じ年(年を省略)
      }
    } else {
      document.getElementById("alarmTimeValue").textContent =
        myDate + " " + myDisplayTime;
    }
  }
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
  if (countTimes === 0) {
    document.getElementById("stopTimer").style.display = "inline-flex";
    document.getElementById("setTimer").style.display = "none";
  }
  if (display === "0:00:00") {
    display = "00:00";
    displayPlace.textContent = display;
    document.title = "やまだのタイマー";
    /*通知(タッチデバイスとIEはなし)*/
    try {
      if (useDevice) {
        let pushBody = ["時間になりました…見よ、我が悪しき闇を！","「時間に風は止み、海は荒れ、大地は腐ってゆきる」と預言書にあった────！","時間になり……世界は温かな光に包まれました……つけあがるなよ小娘ッ！","タイムになり、社会に貢献しました、君も見習った方がいい。","時間にイコール関係が成立しました！"];//プッシュ通知の本文の候補
        let min = Math.ceil(0);
        let max = Math.floor(pushBody.length);
        Push.create("時間です！", {
          body: pushBody[Math.floor(Math.random() * (max - min) + min)],
          icon: "/countdown-timer/favicon/favicon-32x32.png", //アイコン
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
      console.error("Cannot make a notification.");
    }

    alarm.play();
    stop();
    if (setType === "duration") {
      durationChange = true;
      setType = "duration";
    }
    document.title = "やまだのタイマー";
    displayEnd = setInterval(function () {
      document.title = "時間です！";
      displayPlace.style.color = "rgb(255 38 111)";
      displayPlace.style.visibility = "hidden";
      kiduke = setTimeout(function () {
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
    display = "00:00";
    displayPlace.textContent = display;
    document.title = "やまだのタイマー";
    noParams();
  } else {
    if (countTimes === 0) {
      // Local Storageにセット

      if (paramStatus) {
        if (!durationStatus) {
          localStorage.setItem("ct-date", myDate);
          localStorage.setItem("ct-time", myTime);
        }
        if (title) {
          localStorage.setItem("ct-title", title);
        } else {
          localStorage.removeItem("ct-title");
        }
      } else {
        paramStatus = 1;
      }

    }
    if (display != oldDisplay || countTimes === 0) {
      // 残り時間を更新
      let realDisplay;
      if (diffHour === 0) {
        realDisplay = display.split(":")[1] + ":" + display.split(":")[2];
      } else {
        realDisplay = display;
      }
      displayPlace.textContent = realDisplay;
      document.title = realDisplay;
      oldDisplay = display;
    }
    countTimes++;
  }
}


function noParams() {
  /*パラメータがなかったら*/
  let date = new Date();
  let after = new Date();
  after.setHours(date.getHours() + 1);
  let defaultSet = after.toLocaleString().split(" ");
  const defaultDate = defaultSet[0];
  let originalDefaultTime = defaultSet[1].split(":");
  const defaultTime = originalDefaultTime[0] + ":" + originalDefaultTime[1];
  document.getElementById("Date").value = defaultDate;
  document.getElementById("dateLabel").value =
    document.getElementById("Date").value;
  document.getElementById("Time").value = defaultTime;
  document.getElementById("timeLabel").value =
    document.getElementById("Time").value;
  document.getElementById("alarmTimeValue").textContent =
    defaultTime + " (自動設定)";
  localStorage.setItem("ct-lastType", 0);
  durationStatus = 0;
}
function set() {
  /*SETボタンを押したときの挙動*/
  if (setType === "duration") {

  } else {
    myDate = document.getElementById("Date").value;
    myTime = document.getElementById("Time").value;
    changeURL();
  }
  stop();
  audiostop();
  onload();
  Push.clear(); //通知削除
}

function changeURL() {
  // URLを変更
  let newURL = "?";
  if (myDate && myTime && !durationStatus) {
    newURL = newURL + "date=" + myDate + "&time=" + myTime;//設定時刻
  }
  if (title) {
    /*タイトル*/
    if (newURL.match("date")) {
      newURL = newURL + "&";
    }
    newURL = newURL + "title=" + encodeURIComponent(title);
  }
  if (!(myDate || myTime || title)) {
    newURL = "./";
  }
  history.replaceState(null, "やまだのタイマー", newURL);
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
  // collapsible
  var elems = document.querySelectorAll('.collapsible');
  var instances = M.Collapsible.init(elems, options);
});

function copy() {
  /*URLコピー*/
  var url = location.href;
  navigator.clipboard.writeText(url);
  M.toast({ html: "URLをコピーしました" });
}

function resize() {
  const place = document.getElementById("displayTime");
  let count = place.textContent.length;
  if (count < 7) {
    count = 7;
  }
  if (window.innerWidth <= 775) {
    document.getElementById("timerSetforOld").style.fontSize = 150 / count + "vmin";
    document.getElementById("timerSet").style.fontSize = "min(" + 150 / count + "vmin ," + window.innerWidth / count * 1.5 + "px)"; //文字サイズ調整(Tablet&SP)  

  } else {
    document.getElementById("timerSetforOld").style.fontSize = 185 / count + "vmin";
    document.getElementById("timerSet").style.fontSize = "min(" + 185 / count + "vmin ," + window.innerWidth * 0.95 / count * 1.5 + "px)"; //文字サイズ調整
  }
}

function stop() {
  clearInterval(down);
}

function audiostop() {
  document.getElementById("stopTimer").style.display = "";
  document.getElementById("setTimer").style.display = "";
  stopAlarm();
  clearInterval(displayEnd);
  clearTimeout(kiduke);
  var timerbox = document.getElementById("displayTime");
  timerbox.style.color = "";
  timerbox.style.visibility = "";
  document.title = "やまだのタイマー";//点滅・タイトルを初期化
  if (durationStatus) {
    durationStop = true;
    /*一時停止中の表示*/
    document.getElementById("alarmTimeValue").textContent = "一時停止中";
    if (document.getElementById("displayTime").textContent !== "00:00") {
      document.title = "一時停止中";
    }
  }
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
      alarm.src = reader.result;
      testAlarm.src = reader.result;
      M.toast({
        html: "アラーム音を設定しました。<br>※このページから離れると、アラーム音はリセットされます。",
      });
      window.addEventListener("beforeunload", move, false);
    };

    reader.readAsDataURL(file);
  }
  // Drug & Drop
  let dropbox;
  dropbox = document.getElementById("droppable");
  dropbox.addEventListener("dragenter", dragenter, false);
  dropbox.addEventListener("dragover", dragover, false);
  dropbox.addEventListener("dragleave", dragleave, false);
  dropbox.addEventListener("drop", drop, false);
  function dragenter(e) {
    e.stopPropagation();
    e.preventDefault();
  }

  function dragover(e) {
    dropbox.style.backgroundColor = "#4db6ac8e";
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
    dropbox.style.backgroundColor = "";
    const dt = e.dataTransfer;
    const files = dt.files;
    selectFile(files);
  }
});

function move(e) {
  //ページ離脱時に警告
  e.preventDefault();
  // Chrome では returnValue を設定する必要がある
  e.returnValue = "";
}



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

window.addEventListener("resize", function () {
  resize();
});

document.getElementById("testAudio").addEventListener(
  "click",
  (e) => {
    testAlarm.play();
    e.stopPropagation();
    document.addEventListener(
      "click",
      (e) => {
        if (e.target.id !== "audioVolume") {
          testAlarm.pause();
          testAlarm.currentTime = 0; //音停止
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
    // 音量を変更
    alarm.volume = document.getElementById("audioVolume").value / 100;
    testAlarm.volume = document.getElementById("audioVolume").value / 100;
    showVolume();
  },
  false
);
document.getElementById("title").addEventListener("input", () => {
  // タイトルを変更
  title = document.getElementById("title").value;
  if (title) {
    localStorage.setItem("ct-title", title);
  } else {
    localStorage.removeItem("ct-title");
  }
  changeURL();// URLを変更
});
document.addEventListener("DOMContentLoaded", function () {
  if (!localStorage.getItem("ct-skip")) {
    document.getElementById("openWelcome").click();// 「ようこそ」画面を表示
    document.getElementById("howToCheck").checked = true;
  } else {
    document.getElementById("nextSkip").checked = true;
  }
});
function showVolume() {
  // 現在の音量をステータスに表示
  document.getElementById("volumeStatusValue").textContent =
    Math.floor(alarm.volume * 100) + "%";
  localStorage.setItem("volume", alarm.volume)
}
document.getElementById("alarmTimeValue").addEventListener(
  "click",
  () => {
    // アラーム日時のステータスをクリックすると、日時の設定が開く
    document.getElementById("openSettings").click();
    setTimeout(() => {
      document.getElementById("timeTab").click();
    }, 200);
  },
  false
);
document.getElementById("volumeStatusValue").addEventListener(
  "click",
  () => {
    // 音量のステータスをクリックすると、アラーム音の設定が開く
    document.getElementById("openSettings").click();
    setTimeout(() => {
      document.getElementById("audioTab").click();
    }, 200);
  },
  false
);

/*テーマ切り替え*/
document.addEventListener(
  "DOMContentLoaded",
  function () {
    let auto = document.getElementById("auto"); //「システムに従う」ボタン
    let light = document.getElementById("light"); //「ライトモード」ボタン
    let dark = document.getElementById("dark"); //「ダークモード」ボタン
    auto.addEventListener(
      "click",
      () => {
        if (auto.checked) {
          toggleTheme("a");
        }
      },
      false
    );
    light.addEventListener(
      "click",
      () => {
        if (light.checked) {
          toggleTheme("l");
        }
      },
      false
    );
    dark.addEventListener(
      "click",
      () => {
        if (dark.checked) {
          toggleTheme("d");
        }
      },
      false
    );
  },
  false
);
function toggleTheme(mql) {
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
      // 「システムに任せる」選択時
      if (isDark.matches) {
        /* ダークテーマの時 */
        document.body.classList.add("dark"); //ダークモードにする
        changeThemeColor("dark"); //フッターのアイコンを変更
        localStorage.setItem("theme", "auto"); //Local Storageに保存
      } else {
        /* ライトテーマの時 */
        document.body.classList.remove("dark");
        changeThemeColor("light");
        localStorage.setItem("theme", "auto"); //Local Storageに保存
      }
      noActive();
      auto.setAttribute("checked", null); //選択中のボタンを目立たせる
    }
  } else {
    /*現時点でオート設定の時*/
    if ((isDark.matches || mql === "d") && mql !== "l") {
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
function tweet() {
  // ツイート文を作成
  let base = "https://twitter.com/intent/tweet?";
  let hashtags = "やまだのタイマー,やまだけんいち";
  let text = "10万年先まで計れるやまだのタイマーでカウントダウン！";
  let url;
  if (title) {
    url =
      base +
      "text=" +
      text +
      "「" +
      title +
      "」%0a&hashtags=" +
      hashtags +
      "&url=" +
      encodeURIComponent(window.location.href);
  } else {
    url =
      base +
      "text=" +
      text +
      "%0a&hashtags=" +
      hashtags +
      "&url=" +
      encodeURIComponent(window.location.href);
  }
  return url;
}
document.addEventListener("DOMContentLoaded", () => {

// Enable wake lock.
// (must be wrapped in a user input event handler e.g. a mouse or touch handler)
const ID = ["flex", "welcome"];
const CLASS_ELEMENT = document.getElementsByClassName("modal-overlay");
for (let i = 0; i < ID.length; i++) {
  const element = document.getElementById(ID[i]);
  element.setAttribute("onclick", " ");
  element.addEventListener('click', function enableNoSleep() {
    element.removeEventListener('click', enableNoSleep, false);
    noSleep.enable();
  }, false);
}
for (let i = 0; i < CLASS_ELEMENT.length; i++) {
  const element = CLASS_ELEMENT[i];
  element.setAttribute("onclick", " ");
  element.addEventListener('click', function enableNoSleep() {
    element.removeEventListener('click', enableNoSleep, false);
    noSleep.enable();
  }, false);
}
document.addEventListener('click', function enableNoSleep() {
  document.removeEventListener('click', enableNoSleep, false);
  noSleep.enable();
}, false);
  document.getElementById("durationSetBtn").addEventListener("click", () => {
    // 「経過時間」でセット
    durationChange = true;
    setType = "duration";
    set();
  }, false);
  document.getElementById("targetSetBtn").addEventListener("click", () => {
    // 「日時」でセット
    setType = "target";
    set();
  }, false);
  document.getElementById("setTimer").addEventListener("click", set, false);
  document.getElementById("stopTimer").addEventListener("click", () => {
    // ストップボタンをクリックしたとき
    stop();
    audiostop();
    Push.clear();
  }, false);
  document.getElementById("nextSkip").addEventListener("click", () => {
    // ようこそ画面の「今後は表示しない」をクリックしたとき
    if (document.getElementById("nextSkip").checked) {
      localStorage.setItem("ct-skip", 1);// Local Storageにセット
      document.getElementById("howToCheck").checked = false;//設定画面のチェックボックスを外す
    } else {
      localStorage.removeItem("ct-skip");// Local Storageにセット
      document.getElementById("howToCheck").checked = true;//設定画面のチェックボックスを入れる
    }
  }, false);
  document.getElementById("howToCheck").addEventListener("click", () => {
    // 設定画面の「使い方を表示」をクリックしたとき
    if (document.getElementById("howToCheck").checked) {
      localStorage.removeItem("ct-skip");
      document.getElementById("nextSkip").checked = false;
    } else {
      localStorage.setItem("ct-skip", 1);
      document.getElementById("nextSkip").checked = true;
    }
  }, false);

  /*隠しテキストボックスと設定画面のテキストボックスを同期*/
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


  document.getElementById("seconds").addEventListener("change", () => {
    // 設定画面の「秒」の項目を変えたとき、0を埋める
    let element = document.getElementById("seconds");
    if (element.value < 10 && (element.value.length < 2 || element.value === 0)) {
      element.value = "0" + element.value;
    }
  }, false);
  let easySetElements = document.getElementsByClassName("easySetBtn");
  // 「クイックセットボタン」をクリックしたとき
  for (let i = 0; i < easySetElements.length; i++) {
    const element = easySetElements[i];
    element.addEventListener("click", (e) => {
      const setTime = e.target.getAttribute("setTime");
      let durationSettingElements = document.getElementsByClassName("durationSet");
      for (let i = 0; i < durationSettingElements.length; i++) {
        const element = durationSettingElements[i];
        element.value = 0;
      }
      if (setTime.indexOf("min") !== -1) {
        document.getElementById("minute").value = setTime.match(/\d{1,2}/);
      } else if (setTime.indexOf("h") !== -1) {
        document.getElementById("hour").value = setTime.match(/\d{1,2}/);
      }
      document.getElementById("durationSetBtn").click();
    })
  }
}, false);

window.toggleTheme = toggleTheme;
window.copy = copy;
window.tweet = tweet;