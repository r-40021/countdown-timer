require("@materializecss/materialize");// Materialize読み込み
var Push = require("push.js");// プッシュ通知のライブラリを読み込み
import NoSleep from "../node_modules/nosleep.js/dist/NoSleep";// スリープしないように
import { modalTrigger, modalClose, closeAllModal } from "./Modal";
import { recalTabs } from "./Tabs";
import { materializeInit } from "./materialize";
import { device } from "./device";
import { fullscreen } from "./fullscreen";
import { resize, resizeTitleInput } from "./resize";
import { toggleTheme } from "./theme";
import { copy, tweet, shareAPI } from "./share";
import { registerInstallAppEvent } from "./pwa";

/*変数の定義*/
var down, displayEnd, oldDisplay, title, myDate, myTime, target, kiduke;
var useDevice = 0;
let firstLoad = 0;
var paramStatus = 1;//パラメータがあるか
var durationStatus = 0;//「経過時間」で設定か
let countTimes = 0;//SETボタン押下後すぐか
var durationStop = false;//「経過時間」でせっていし、一時停止中か
let durationChange = false;//「経過時間」の設定が変わったか
let setType;//「経過時間」or「経過時間→日時設定」
let stopTest;
/*Dark Theme*/
const isDark = window.matchMedia("(prefers-color-scheme: dark)");//ダークモード？
const { Howl, Howler } = require('howler');
/*初期アラーム音設定*/
var alarm;
var testAlarm;
/*アラーム音の視聴用 */
var noSleep = new NoSleep();

materializeInit();

modalTrigger();
modalClose();

registerInstallAppEvent(document.getElementById("getPWA"));

function second() {
  if (localStorage.getItem("ct-skip")) {
    localStorage.removeItem("ct-skip");
  }
}
second();
function third() {
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
    if (localStorage.getItem("ct-lastType") === "1") {
      setType = "duration";
    } else {
      setType = null;
    }
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
      if (setType !== "duration") {
        setType = null;
      }
    } else {
      // Local Storageの時間が過去だったら
      noParams();
      if (setType === "duration") {
        localStorage.setItem("ct-lastType", 1);
      } else {
        setType = null;
      }
    }
  } else {
    //パラメータ＆Local Storageなし
    noParams();
    if (setType !== "duration") {
      openTimeSetting();
    }
    if (setType === "duration") {
      localStorage.setItem("ct-lastType", 1);
    } else {
      setType = null;
    }
  }
  if (localStorage.getItem("volume")) {
    let localVolume = Number(localStorage.getItem("volume"));
    document.getElementById("audioVolume").value = localVolume * 100;//前回の音量を取得しセット
  }
  alarm = new Howl({
    src: ['/countdown-timer/alarm.mp3'],
    volume: document.getElementById("audioVolume").value / 100,
    loop: true
  });
  testAlarm = new Howl({
    src: ['/countdown-timer/alarm.mp3'],
    volume: document.getElementById("audioVolume").value / 100,
    loop: true
  });
  onload();
}
third();
function clickHeader() {
  M.Collapsible.getInstance(document.querySelector(".collapsible")).open(1);//「経過時間で設定」の項目を表示させる
}

fullscreen();

shareAPI();

function onload() {
  resize(); //文字サイズ調整
  /*パラメータ取得*/
  countTimes = 0;
  showVolume();
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
    resizeTitleInput();
  } else if (localStorage.getItem("ct-title") && !paramObject.date && !paramObject.time) {
    title = localStorage.getItem("ct-title");
    document.getElementById("title").value = title;
    resizeTitleInput();
  }
  if ((setType === "duration") || ((firstLoad === 0 && localStorage.getItem("ct-lastType") == "1") && !paramObject.date && !paramObject.time)) {
    durationStatus = 1;
    clickHeader();
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
          element.focus();
          element.value = 0;
          element.blur();
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
      reTimer();
      document.getElementById("alarmTimeValue").textContent = "一時停止中";
      localStorage.setItem("ct-lastType", 1);
      setType = "duration";
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
    changeURL();
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
      setType = "target";
      set();
    } else {
      localStorage.removeItem("ct-date");
      localStorage.removeItem("ct-time");
      noParams();
      openTimeSetting();
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
  if (countTimes === 0) {
    document.getElementById("playTimer").style.display = "";
    document.getElementById("reTimer").style.display = "none";
    document.getElementById("stopTimer").style.display = "inline-flex";
    document.getElementById("setTimer").style.display = "none";
  }
  var displayPlace = document.getElementById("displayTime");
  var date = new Date();
  var diffTime = target.getTime() - date.getTime(); //時間の差を計算
  if (diffTime || diffTime === 0) {
    if (setType === "duration") {
      localStorage.setItem("ct-lastSet", diffTime);
    } else {
      localStorage.removeItem("ct-lastSet");
    }
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
  var diffSecond = Math.ceil(
    (diffTime - diffHour * 1000 * 60 * 60 - diffMinute * 1000 * 60) / 1000
  ); //秒に変換
  if (diffSecond === 60) {
    diffMinute++;
    diffSecond = 0;
    if (diffMinute === 60) {
      diffHour++;
      diffMinute = 0;
    }
  }
  if (diffMinute < 10) {
    diffMinute = "0" + diffMinute;
  }
  if (diffSecond < 10) {
    diffSecond = "0" + diffSecond;
  }
  var display = diffHour + ":" + diffMinute + ":" + diffSecond;
  if (display !== "0:00:00" && !display.match("-|NaN")) {
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
      if (title) {
        document.title = realDisplay + "　(" + title + ")";
      } else {
        document.title = realDisplay;
      }
      oldDisplay = display;
      resize();
    }
    countTimes++;
  } else if (display === "0:00:00") {
    display = "00:00";
    displayPlace.textContent = display;
    document.title = "やまだのタイマー";
    /*通知(タッチデバイスとIEはなし)*/
    try {
      if (useDevice) {
        let pushBody = ["時間になりました…見よ、我が悪しき闇を！", "「時間に風は止み、海は荒れ、大地は腐ってゆきる」と預言書にあった────！", "時間になり……世界は温かな光に包まれました……つけあがるなよ小娘ッ！", "タイムになり、社会に貢献しました、君も見習った方がいい。", "時間にイコール関係が成立しました！"];//プッシュ通知の本文の候補
        let min = Math.ceil(0);
        let max = Math.floor(pushBody.length);
        Push.create("時間です！", {
          body: pushBody[Math.floor(Math.random() * (max - min) + min)],
          icon: "/countdown-timer/favicon/android-chrome-192x192.png", //アイコン
          requireInteraction: true, // 永遠に通知
          link: "/countdown-timer",
          onClick: () => {
            window.focus();
            this.close();
            stop();
            audiostop(true);
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
    displayEnd = setInterval(() => {
      document.title = "時間です！";
      displayPlace.style.color = "rgb(255 38 111)";
      displayPlace.style.visibility = "hidden";
      kiduke = setTimeout(() => {
        document.title = "気付け！！";
        displayPlace.style.visibility = "";
      }, 500);
    }, 1000);
  } /*計算結果が負orNaNのときの処理*/ else if (display.match("-|NaN")) {
    stop();
    document.getElementById("playTimer").style.display = "";
    document.getElementById("reTimer").style.display = "none";
    document.getElementById("stopTimer").style.display = "";
    document.getElementById("setTimer").style.display = "";
    if (display.match("-")) {
      M.toast({ text: "過去の日時はセットできません" });
    } else if (display.match("NaN")) {
      M.toast({ text: "むむ？" });
    }
    display = "00:00";
    displayPlace.textContent = display;
    document.title = "やまだのタイマー";
      openTimeSetting();
      if (!document.getElementById("targetLi").classList.contains("active")) {
        M.Collapsible.getInstance(document.querySelector("#selectSettings")).open(0);
      }
  }
}
function noParams() {
  /*パラメータがなかったら*/
  let date = new Date();
  let after = new Date();
  after.setHours(date.getHours() + 1);
  const defaultDate = after.getFullYear() + "/" + (after.getMonth() + 1) + "/" + after.getDate();
  let afterMin = after.getMinutes();
  if (afterMin < 10) {
    afterMin = "0" + afterMin;
  }
  const defaultTime = after.getHours() + ":" + afterMin;
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
  audiostop(false);
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

function stop() {
  clearInterval(down);
}
function reTimer() {
  document.getElementById("playTimer").style.display = "none";
  document.getElementById("reTimer").style.display = "";
  let h = Number(document.getElementById("hour").value);
  let m = Number(document.getElementById("minute").value);
  let s = Number(document.getElementById("seconds").value);
  if (h >= 0 && m >= 0 && s >= 0) {
    let display;
    if (h) {
      display = h + ":";
    }
    if (m) {
      if (m < 10) {
        m = "0" + m;
      }
      display = m + ":";
    } else {
      if (h) {
        display += "00:";
      } else {
        display = "00:";
      }

    }
    if (s) {
      if (s < 10) {
        s = "0" + s;
      }
      display += s;
    } else {
      display += "00";
    }
    document.getElementById("displayTime").textContent = display;
  }
}
function audiostop(ifAction) {
  if (document.getElementById("displayTime").textContent === "00:00") {
    if (setType === "duration") {
      reTimer();
    }
    if (ifAction) {
      openTimeSetting();
    }
  }
  document.getElementById("stopTimer").style.display = "";
  document.getElementById("setTimer").style.display = "";
  alarm.stop();
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
function doubleAlarmStop() {
  alarm.stop();
  testAlarm.stop();
}

function load1() {
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
      M.toast({ text: "音声ファイルを選択してください" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      let playing = false;
      if (alarm.playing()) {
        playing = true;
      }
      doubleAlarmStop();
      alarm = new Howl({
        src: [reader.result],
        volume: document.getElementById("audioVolume").value / 100,
        loop: true
      });
      testAlarm = new Howl({
        src: [reader.result],
        volume: document.getElementById("audioVolume").value / 100,
        loop: true
      });
      document.getElementById("audioFileName").textContent = file.name;
      document.getElementById("audioFileStatus").style.display = "flex";
      M.toast({text: "アラーム音を設定しました",});
      window.addEventListener("beforeunload", move, false);
      if (playing) {
        alarm.play();
      }
    };
    reader.readAsDataURL(file);
  }
  document.getElementById("audioReset").addEventListener("click", () => {
    let playing = false;
    if (alarm.playing()) {
      playing = true;
    }
    doubleAlarmStop();
    document.getElementById("file1").value = null;
    alarm = new Howl({
      src: ['/countdown-timer/alarm.mp3'],
      volume: document.getElementById("audioVolume").value / 100,
      loop: true
    });
    testAlarm = new Howl({
      src: ['/countdown-timer/alarm.mp3'],
      volume: document.getElementById("audioVolume").value / 100,
      loop: true
    });
    document.getElementById("audioFileStatus").style.display = "none";
    window.removeEventListener("beforeunload", move, false);
    if (playing) {
      alarm.play();
    }
  }, false);
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
}
load1();
function move(e) {
  //ページ離脱時に警告
  e.preventDefault();
  // Chrome では returnValue を設定する必要がある
  e.returnValue = "";
}

window.addEventListener("resize", () => {
  resize();
  recalTabs();
  resizeTitleInput();
});
document.getElementById("testAudio").addEventListener(
  "click",
  (e) => {
    testAlarm.stop();
    testAlarm.play();
    e.stopPropagation();
    document.getElementById("testAudio").style.display = "none";
    document.getElementById("stopTestAudio").style.display = "flex";
    document.addEventListener(
      "click",
      stopTest = (e) => {
        if (!e.target.closest(".audioFlex")) {
          testAlarm.stop(); //音停止
          document.removeEventListener("click", stopTest, false);
          document.getElementById("testAudio").style.display = "";
          document.getElementById("stopTestAudio").style.display = "";
        }
      },
      false
    );
  },
  false
);
document.getElementById("stopTestAudio").addEventListener("click", (e) => {
  document.removeEventListener("click", stopTest, false);
  testAlarm.stop(); //音停止
  document.getElementById("testAudio").style.display = "";
  document.getElementById("stopTestAudio").style.display = "";
}, false);
document.getElementById("audioVolume").addEventListener(
  "input",
  (e) => {
    // 音量を変更
    alarm.volume(document.getElementById("audioVolume").value / 100);
    testAlarm.volume(document.getElementById("audioVolume").value / 100);
    showVolume();
  },
  false
);
document.getElementById("title").addEventListener("input", () => {
  // タイトルを変更
  resizeTitleInput();
  title = document.getElementById("title").value;
  if (title) {
    localStorage.setItem("ct-title", title);
  } else {
    localStorage.removeItem("ct-title");
  }
  changeURL();// URLを変更
});
function showVolume() {
  // 現在の音量をステータスに表示
  document.getElementById("volumeStatusValue").textContent =
    Math.floor(alarm.volume() * 100) + "%";
  localStorage.setItem("volume", alarm.volume());
}
document.getElementById("alarmTimeValue").addEventListener("click", openTimeSetting, false);
function openTimeSetting() {
  // アラーム日時のステータスをクリックすると、日時の設定が開く
  document.getElementById("myModal-overlay").style.zIndex = "";
  let modal = document.getElementById("settings");
  modal.style.zIndex = "";
  modal.classList.add("activeModal");
  modal.setAttribute("aria-hidden", false);
  let settingsTab = M.Tabs.getInstance(document.getElementById("settingsTab"));
  setTimeout(() => {
    settingsTab.select("settings-1");
  }, 200);
}
document.getElementById("volumeStatusValue").addEventListener(
  "click",
  () => {
    // 音量のステータスをクリックすると、アラーム音の設定が開く
    document.getElementById("myModal-overlay").style.zIndex = "";
    let modal = document.getElementById("settings");
    modal.style.zIndex = "";
    modal.classList.add("activeModal");
    modal.setAttribute("aria-hidden", false);
    let settingsTab = M.Tabs.getInstance(document.getElementById("settingsTab"));
    setTimeout(() => {
      settingsTab.select("settings-2");
    }, 200);
  },
  false
);
/*テーマ切り替え*/
function sixth() {
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
}
sixth();


function seventh() {
  // Enable wake lock.
  // (must be wrapped in a user input event handler e.g. a mouse or touch handler)
  let eventType;
  if (window.ontouchstart) {
    eventType = "touchstart";
  } else {
    eventType = "click";
  }
  let eventTime = 0;
  document.body.addEventListener(eventType, enableNoSleep, false);
  function enableNoSleep() {
    if (eventTime <= 10) {
      noSleep.disable();
      noSleep.enable();
    } else {
      document.removeEventListener(eventType, enableNoSleep, false);
    }
    eventTime++;
  }
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
    audiostop(true);
    Push.clear();
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
      if (!element.value) {
        element.focus();
        element.value = "0" + element.value;
        element.blur();
      }
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
        if (!element.value) {
          element.focus();
        }
        element.value = 0;
        element.blur();
      }
      if (setTime.indexOf("min") !== -1) {
        document.getElementById("minute").value = setTime.match(/\d{1,2}/);
      } else if (setTime.indexOf("h") !== -1) {
        document.getElementById("hour").value = setTime.match(/\d{1,2}/);
      }
      document.getElementById("durationSetBtn").click();
      closeAllModal();
    })
  }
  let cursorTimeout;
  let flexArea = document.getElementById("flex");
  cursorTimeout = setTimeout(() => {
    flexArea.style.cursor = "none";
  }, 3000);
  document.addEventListener("mousemove", () => {
    flexArea.style.cursor = "auto";
    clearTimeout(cursorTimeout);
    cursorTimeout = setTimeout(() => {
      flexArea.style.cursor = "none";
    }, 3000);
  })
}
seventh();
document.addEventListener("keydown", (e) => {
  if (/^[0-9]{1}/.test(e.key)) {
    if (document.activeElement.tagName.toLocaleLowerCase() !== "input" && !e.repeat) {
      let durationSettingElements = document.getElementsByClassName("durationSet");
      for (let i = 0; i < durationSettingElements.length; i++) {
        const element = durationSettingElements[i];
        if (!element.value) {
          element.focus();
        }
        element.value = 0;
        element.blur();
      }
      document.getElementById("minute").value = Number(e.key == 0 ? 10 : e.key);
      document.getElementById("durationSetBtn").click();
      closeAllModal();
    }
  }
}, false);

export function changeUseDevice(value) {
  useDevice = value;
}

export function pushrequest() {
  if (useDevice) {
    //PCとIE以外でしか実行しない
    /*プッシュ通知許可ダイアログ*/
    Push.Permission.request();
  }
}

window.toggleTheme = toggleTheme;
window.copy = copy;
window.tweet = tweet;
window.closeAllModal = closeAllModal;
