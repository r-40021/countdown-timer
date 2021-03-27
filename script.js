window.addEventListener('DOMContentLoaded', (event) => {
    setTimeout(function(){
        const loader = document.getElementById('load');
        if (loader.classList.contains("loaded")===false){
        loader.classList.add('loaded');
    }}, 5000);
});
var down;
var displayEnd;
var displayPlace;
var useDevice = 0;
var alarm = new Audio("alarm.mp3");
alarm.loop = true;
var noSleep = new NoSleep();

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').then(function(registration) {
    // 登録成功
    console.log('ServiceWorker の登録に成功しました。スコープ: ', registration.scope);
    M.toast({html: '<span><i class="fas fa-check"></i>オフラインでも利用可能です</span>'});
  }).catch(function(err) {
    // 登録失敗
    console.log('ServiceWorker の登録に失敗しました。', err);
  });
}

window.addEventListener('load', (event) => {
    const loader = document.getElementById('load');
    loader.classList.add('loaded');
    setTimeout(function(){
        pushrequest();
    }, 499);
    
});

window.addEventListener('DOMContentLoaded', onload);

function onload() {
    var userAgent = window.navigator.userAgent.toLowerCase();//ブラウザ情報取得
    if ((userAgent.indexOf("msie") === -1&&userAgent.indexOf("trident") === -1/*IEを省く*/)&&(userAgent.indexOf("windows") != -1||(userAgent.indexOf("mac os x") != -1&&'ontouchend' in document ===false)/*mac os xが含まれていて、かつマウスデバイス*/||userAgent.indexOf("cros") != -1||userAgent.indexOf("linux") != -1&&'ontouchend' in document ===false)){//PCとIE以外でしか実行しない
        useDevice = 1;
    }
    if (userAgent.indexOf("msie") != -1||userAgent.indexOf("trident") != -1){
        alert('Internet Explorerでは正常に動作しない可能性があります。\nEdgeやChromeをお使いください。');
    }
    if(userAgent.indexOf("iphone") != -1 || (userAgent.indexOf("mac os x") != -1&&'ontouchend' in document))/*iPhone/iPad除く*/{
        const dateField = document.querySelector("#DateField");
        const timeField = document.querySelector("#TimeField");
        dateField.classList.remove("m5","s10");
        dateField.classList.add("m6","s12");
        timeField.classList.remove("m5","s10");
        timeField.classList.add("m6","s12");        
        
    } else{
        document.getElementById("audioInput").style.display = "inline";
        document.getElementById("playb").style.display = "inline";
    }
    resize();　//文字サイズ調整
    /*パラメータ取得*/
    var param = location.search;
    var paramObject = new Object();
    
    if (param) {
        param = param.substring(1);
        var parameters = param.split('&');
        
        for (var i =0 ; i < parameters.length; i++) {
            var element = parameters[i].split('=');

            var paramName = decodeURIComponent(element[0]);
            var paramValue = decodeURIComponent(element[1]);

            paramObject[paramName] = paramValue;
        }
        //テキストボックスに日時をセット
        document.getElementById('Date').value = paramObject.date;
        document.getElementById('Time').value = paramObject.time;

        var myDate = paramObject.date;
        var myTime = paramObject.time;
        var target = new Date(myDate + " " + myTime + ":00");//設定時間
        
        /*カウントダウン（一番大事）*/
        function myCount(){
        date = new Date();
        var diffTime = target.getTime() - date.getTime();//時間の差を計算
        var diffHour = Math.floor(diffTime / (1000*60*60));//時間に変換
        var diffMinute = Math.floor((diffTime-diffHour*1000*60*60) / (1000*60));//分に変換
        var diffSecond = Math.floor((diffTime - diffHour*1000*60*60 - diffMinute*1000*60) /1000);//秒に変換
        if (diffMinute < 10) {
            diffMinute = "0" + diffMinute;
        }
        if (diffSecond < 10) {
            diffSecond = "0" + diffSecond;
        }
        var display = diffHour + ":" + diffMinute + ":" + diffSecond;
        if (display === "0:00:00") {
             display = "0:00:00";
             var displayPlace = document.getElementById('displayTime');
             displayPlace.innerHTML = display;
             document.title = "やまだのタイマー";
              /*通知(タッチデバイスとIEはなし)*/
            if (useDevice){
              Push.create('時間です！', {
            　　body: 'くっ...時の流れが疾風迅雷の俺に追いついたようだ......',
            　　icon: './favicon/favicon.ico',//アイコン
            　　requireInteraction: true, // 永遠に通知
            　　vibrate: [1000, 1000, 1000, 1000, 1000] ,
                onClick: function () {
                    window.focus();
                    this.close();
                    stop();
                    audiostop();}
            }); 
            }
            alarm.play();
            stop();
　　　　　　 document.title = "やまだのタイマー";
            var timerbox = document.getElementById("displayTime")
            displayEnd  = setInterval(function(){
                               timerbox.style.color ="#26a69a";
　　　　　　　　　　　　　　　　　　　document.title = "時間です！";
                             setTimeout(function(){
                                timerbox.style.color ="#FFFFFF";
                                document.title = "やまだのタイマー";
                               }, 500);
                           }, 1000);

        } else /*計算結果が負orNaNのときの処理*/if(display.match("-|NaN")){
         stop();
         display = "0:00:00";
         var displayPlace = document.getElementById('displayTime');
         displayPlace.innerHTML = display;
         resize();
         document.title = "やまだのタイマー";}
        else{
        displayPlace = document.getElementById('displayTime');
        displayPlace.innerHTML = display;
        document.title = display;
        resize();}}
        down = setInterval(myCount, 100);
    } else {
        /*パラメータがなかったら*/
        let date = new Date();
        let after = new Date();
        after.setHours(date.getHours() +1);
        let defaultSet = after.toLocaleString().split(' ');
        const defaultDate = defaultSet[0];
        let originalDefaultTime = defaultSet[1].split(':');
        const defaultTime = originalDefaultTime[0] + ":" + originalDefaultTime[1];
        document.getElementById('Date').value = defaultDate;
        document.getElementById('Time').value = defaultTime;
    }
}

function set() {
    var url = new URL(window.location.href);
    var myDate = document.getElementById('Date').value;
    var myTime =  document.getElementById('Time').value;
    history.replaceState( null, "やまだのタイマー", "index.html?date=" + myDate + "&time=" + myTime);//パラメータセット（リロードなし）
    stop();
    pushrequest();
    onload();
    audiostop();
    Push.clear();//通知削除
}

 document.addEventListener('DOMContentLoaded', function() {
     /*datepicker*/
    var elems = document.querySelectorAll('.datepicker');
    var options = {
        "format":"yyyy/m/d"
    }
    var instances = M.Datepicker.init(elems, options);
     /*timepicker*/
    elems = document.querySelectorAll('.timepicker');
    options = {
        "twelveHour":false
    }
    instances = M.Timepicker.init(elems, options);
     /*modal*/
     elems = document.querySelectorAll('.modal');
     instances = M.Modal.init(elems);
　　　elems = document.querySelectorAll('.tooltipped');
     instances = M.Tooltip.init(elems);
  });

  function copy() {
     var url = location.href;
     navigator.clipboard.writeText(url);
    M.toast({html: 'URLをコピーしました'})
  }

  function resize(params) {
    var count = document.querySelector('#displayTime').innerHTML.length;
    document.querySelector('#displayTime').style.fontSize = 150/count + 'vw';//文字サイズ調整
  }

  function stop(){
    clearInterval(down);
}

function audiostop(){
    alarm.pause();
    alarm.currentTime = 0;//音停止
    clearInterval(displayEnd);
    var timerbox = document.getElementById("displayTime")
    timerbox.style.color ="#FFFFFF";
}

function pushrequest(){
    if (useDevice){//PCとIE以外でしか実行しない
    /*トーストで通知の権限を通知*/
    if (Push.Permission.has() == false){
         M.toast({html: '通知を許可して、時間になったらデスクトップに通知が届くようにしてください'})
    }
       /*プッシュ通知許可ダイアログ*/
   Push.Permission.request(onGranted);

    function onGranted() {
         M.toast({html: '時間になったらデスクトップ通知でお知らせします'})
    }
    } else{
         M.toast({html: '<span>ご利用の環境では、時間になってもプッシュ通知を行うことができません。</span><a class="btn-flat toast-action modal-trigger" href="#push">MORE</a>'})
    }
}

  window.addEventListener('load', () => {
  const f = document.getElementById('file1');
  var player = document.getElementById('player');
  f.addEventListener('change', evt => {
    let input = evt.target;
    if (input.files.length == 0) {
      return;
    }
    const file = input.files[0];
     if(!file.type.match('audio.*')) {
            M.toast({html: '音声ファイルを選択してください'});
            return;
        }
    const reader = new FileReader();
    reader.onload = () => {
      alarm = new Audio(reader.result);
      alarm.loop = true;
      player.src = reader.result;
      M.toast({html: 'アラーム音を設定しました。<br>このページから離れると、アラーム音はリセットされます。'});
      window.addEventListener('beforeunload', move, false);
    };

    reader.readAsDataURL(file);
  });
});

var move = function(e){
    e.preventDefault();
  // Chrome では returnValue を設定する必要がある
  e.returnValue = '';
}

/*NoSleep*/
document.addEventListener('click', function enableNoSleep() {
  document.removeEventListener('click', enableNoSleep, false);
  noSleep.enable();
}, false);
