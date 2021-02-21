var down;
var alarm;
var display;
$ (function () {
    resize();
    var param = location.search;
    var paramObject = new Object();
    var date = new Date();
    alarm = new Audio('alarm.mp3');
    
    if (param) {
        param = param.substring(1);
        var parameters = param.split('&');
        
        for (var i =0 ; i < parameters.length; i++) {
            var element = parameters[i].split('=');

            var paramName = decodeURIComponent(element[0]);
            var paramValue = decodeURIComponent(element[1]);

            paramObject[paramName] = paramValue;
        }
        $('#Date').val(paramObject.date);
        $('#Time').val(paramObject.time);
        var lineShare = document.getElementById('line');
        lineshare.data-url = location.href;

        var myDate = paramObject.date;
        var myTime = paramObject.time;
        myDate = myDate.split('/');
        var target = new Date(myDate[0] + "-" + myDate[1] + "-" + myDate[2] + " " + myTime + ":00");
        
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
        var now = new Date(date.getFullYear() + "-" + setmonth + "-" + setday + " " + date.getHours() + ":" + setminute + ":" + setseconds);
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
        display = diffHour + ":" + diffMinute + ":" + diffSecond;
        if (diffTime === 0) {
            stop();
            music.addEventListener("ended", function () {
            music.currentTime = 0;
            music.play();
            }, false);
        } else if (diffTime < 0) {
            stop();
        }
        else{
            displaytime(display);
            stop();
        }}
        down = setInterval(myCount, 1000);
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
        var SetTime = date.getHours()+1 + ":" + minute;
    $("#Date").val(date2);
    $("#Time").val(SetTime);}
});

function set() {
    var url = new URL(window.location.href);
    var myDate = $('#Date').val();
    var myTime = $('#Time').val();
    location.search = "?date=" + myDate + "&time=" + myTime;
}

$(document).ready(function(){
    $('.datepicker').datepicker({
        format:"yyyy/mm/dd"
    });
    $('.timepicker').timepicker({
        twelveHour:false
    });
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
    $('#displayTime').css('font-size', 100/count + 'vw');//文字サイズ調整
  }

  function displaytime(display){
      var displayPlace = document.getElementById('displayTime');
      displayPlace.innerHTML = display;
      if(display == "0:00:00"){
          display = "Countdown Timer";
      }
      document.title = display;
      resize();
  }

  function stop(){
    clearInterval(down);
    displaytime("0:00:00");
}

  function stopalarm(){
    alarm.pause();
    alarm.currentTime = 0;
}
