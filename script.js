var down;
var alarm = new Audio("alarm.mp3");
alarm.loop = true;
window.addEventListener('DOMContentLoaded', function() {
    Push.Permission.request();//プッシュ通知許可ダイアログ
    resize();　//文字サイズ調整
    //パラメータ取得
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
        var target = new Date(myDate + " " + myTime + ":00");
        
        function myCount(){
        date = new Date();
        var setmonth = date.getMonth() + 1;
        var setday = date.getDate();
        if (setmonth < 10) {
            setmonth = "0" + setmonth;
        }
        if (setday < 10) {
            setday = "0" + setday;
        }
        var setminute = date.getMinutes();
        var setseconds = date.getSeconds();
        if (setminute < 10) {
            setminute = "0" + setminute;
        }
        if (setseconds < 10) {
            setseconds = "0" + setseconds;
        }
        var now = new Date(date.getFullYear() + "/" + setmonth + "/" + setday + " " + date.getHours() + ":" + setminute + ":" + setseconds);
        var diffTime = target.getTime() - now.getTime();
        var diffHour = Math.floor(diffTime / (1000*60*60));
        var diffMinute = Math.floor((diffTime-diffHour*1000*60*60) / (1000*60));
        var diffSecond = (diffTime - diffHour*1000*60*60 - diffMinute*1000*60) /1000;
        if (diffMinute < 10) {
            diffMinute = "0" + diffMinute;
        }
        if (diffSecond < 10) {
            diffSecond = "0" + diffSecond;
        }
        var display = diffHour + ":" + diffMinute + ":" + diffSecond;
        if (display == "-1:59:59") {
              Push.create('時間です！', {
            　　body: '時間です！',
            　　icon: './fabicon/fabicon.ico',//アイコン
            　　timeout: 8000, // 通知時間
            　　vibrate: [200, 200, 200, 200, 200]            　　
            }); 
            alarm.play();
            stop();
　　　　　　　document.title = "やまだのタイマー";
        } else if(display.match("-")){
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
    alarm.currentTime = 0;
}
