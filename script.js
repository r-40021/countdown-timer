var down;
var vibrate;
var alarm = new Audio("alarm.mp3");
alarm.loop = true;
window.addEventListener('DOMContentLoaded', onload);

function onload() {
    var userAgent = window.navigator.userAgent.toLowerCase();//ブラウザ情報取得
    if (userAgent.indexOf("msie") != -1||userAgent.indexOf("trident") != -1){
        alert('Internet Explorerでは正常に動作しない可能性があります。\nEdgeやChromeをお使いください。');
    }
        
    if ((userAgent.indexOf("msie") === -1&&userAgent.indexOf("trident") === -1/*IEを省く*/)&&(userAgent.indexOf("windows") != -1||(userAgent.indexOf("mac os x") != -1&&'ontouchend' in document ===false)/*mac os xが含まれていて、かつマウスデバイス*/||userAgent.indexOf("cros") != -1||userAgent.indexOf("linux") != -1)&&userAgent.indexOf("android") === -1/*android省く*/){//PCとIE以外でしか実行しない
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
    
    resize();　//文字サイズ調整
    /*パラメータ取得*/
    var param = location.search;
    var paramObject = new Object();
    var date = new Date();
    
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
        if (display == "-1:59:59") {
              /*通知(タッチデバイスとIEはなし)*/
            if ((userAgent.indexOf("msie") === -1&&userAgent.indexOf("trident") === -1/*IEを省く*/)&&(userAgent.indexOf("windows") != -1||(userAgent.indexOf("mac os x") != -1&&'ontouchend' in document === false)/*mac os xが含まれていて、かつマウスデバイス*/||userAgent.indexOf("cros") != -1||userAgent.indexOf("linux") != -1)&&userAgent.indexOf("android") === -1/*android省く*/){
              Push.create('時間です！', {
            　　body: 'くっ...時の流れが疾風迅雷の俺に追いついたようだ......',
            　　icon: './fabicon/fabicon.ico',//アイコン
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
            vibrate = setInterval(function(){
                        window.navigator.vibrate([1000, 1000, 1000, 1000, 1000]);
                       }, 6000);
        } else /*計算結果が負orNaNのときの処理*/if(display.match("-|NaN")){
         stop();
         display = "00:00:00";
         var displayPlace = document.getElementById('displayTime');
         displayPlace.innerHTML = display;
         document.title = "やまだのタイマー";}
        else{
        var displayPlace = document.getElementById('displayTime');
        displayPlace.innerHTML = display;
        document.title = display;
        resize();}}
        down = setInterval(myCount, 200);
    } else{
        /*パラメータがないとき*/
        var month = date.getMonth() + 1;
        var day = date.getDate();
        if (month < 10) {
            month = "0" + month;
        }
        if (day < 10) {
            day = "0" + day;
        }
        var date2 = date.getFullYear() + "/" + month + "/" + day;
        var minute = date.getMinutes();
        if (minute < 10) {
            minute = "0" + minute;
        }
        var SetTime = date.getHours() + ":" + minute;
    document.getElementById('Date').value = date2;
    document.getElementById('Time').value = SetTime;}
}

function set() {
    var url = new URL(window.location.href);
    var myDate = document.getElementById('Date').value;
    var myTime =  document.getElementById('Time').value;
    history.replaceState( null, "やまだのタイマー", "index.html?date=" + myDate + "&time=" + myTime);
    stop();
    onload();
}

 document.addEventListener('DOMContentLoaded', function() {
     /*datepicker*/
    var elems = document.querySelectorAll('.datepicker');
    var options = {
        "format":"yyyy/mm/dd"
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
    clearInterval(vibrate);//バイブ停止
}
