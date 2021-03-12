var down;
var vibrate;
var alarm = new Audio("alarm.mp3");
alarm.loop = true;
window.addEventListener('DOMContentLoaded', function() {
    /*トーストで通知の権限を通知*/
    if (Push.Permission.has() == true){
        M.toast({html: '時間になったらデスクトップ通知でお知らせします'})
    } else if (Push.Permission.has() == false){
         M.toast({html: '通知を許可して、時間になったらデスクトップに通知が届くようにしてください'})
    }
    /*プッシュ通知許可ダイアログ*/
   Push.Permission.request(onGranted);

    function onGranted() {
         M.toast({html: '時間になったらデスクトップ通知でお知らせします'})
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
              /*通知*/
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
            alarm.play();
            stop();
　　　　　　　document.title = "やまだのタイマー";
            vibrate = setInterval(function(){
                        window.navigator.vibrate([1000, 1000, 1000, 1000, 1000]);
                       }, 1000);
        } else /*計算結果が負のときの処理*/if(display.match("-")){
         stop();
         display = "0:00:00";
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
});

function set() {
    var url = new URL(window.location.href);
    var myDate = document.getElementById('Date').value;
    var myTime =  document.getElementById('Time').value;
    location.search = "?date=" + myDate + "&time=" + myTime;
}

$(document).ready(function(){
    $('.datepicker').datepicker({
        format:"yyyy/mm/dd"
    });
    $('.timepicker').timepicker({
        twelveHour:false
    });
    $('.modal').modal();
  });

  function copy() {
    $('body').append('<textarea id="currentURL" style="position:fixed;left:-100%;">'+location.href+'</textarea>');
    $('#currentURL').select();
    document.execCommand('copy');
    $('#currentURL').remove();
    M.toast({html: 'URLをコピーしました'})
  }

  function resize(params) {
    var count = $('#displayTime').text().length;
    $('#displayTime').css('font-size', 150/count + 'vw');//文字サイズ調整
  }

  function stop(){
    clearInterval(down);
}

function audiostop(){
    alarm.pause();
    alarm.currentTime = 0;//音停止
    clearInterval(vibrate);//バイブ停止
}
