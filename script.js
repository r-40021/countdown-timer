$ (function () {
    var count = $('#displayTime').text().length;
    $('#displayTime').css('font-size', 100/count + 'vw');//文字サイズ調整
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
        $('#Date').val(paramObject.date);
        $('#Time').val(paramObject.time);

        var myDate = paramObject.date;
        var myTime = paramObject.time;
        myDate = myDate.split('/');
        var targetTime = myDate[0] + "-" + myDate[1] + "-" + myDate[2] + " " + myTime + ":00";
        console.log(targetTime);
        var setmonth = date.getMonth() + 1;
        var setday = date.getDate();
        if (setmonth < 10) {
            setmonth = "0" + setmonth;
        }
        if (setday < 10) {
            setday = "0" + setday;
        }
        var setminute = date.getMinutes;
        var setseconds = date.getSeconds;
        if (setminute < 10) {
            setminute = "0" + setminute;
        }
        if (setseconds < 10) {
            setseconds = "0" + setseconds;
        }
        var now = date.getFullYear + "-" + setmonth + "-" + setday + " " + date.getHours + ":" + setminute + ":" + setseconds;
        var diffTime = targetTime.getTime() - now.getTime();
        var diffHour = Math.floor(diffTime / (1000*60*60));
        var diffMinute = Math.floor((diffTime-diffHour*1000*60*60) / (1000*60));
        var diffSecond = (diffTime - diffHour*1000*60*60 - diffMinute*1000*60) *1000;
        if (diffMinute < 10) {
            diffMinute = "0" + diffMinute;
        }
        if (diffSecond < 10) {
            diffSecond = "0" + diffSecond;
        }
        var display = diffHour + ":" + diffMinute + ":" + diffSecond;
        var displayPlace = document.getElementById('displayTime');
        displayPlace.innerHTML = display;
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
        format:"yyyy/mm/dd",
        autoClose:true
    });
    $('.timepicker').timepicker({
        twelveHour:false,
        autoClose:false
    });
    $('.fixed-action-btn').floatingActionButton();
  });

  function copy() {
    $('body').append('<textarea id="currentURL" style="position:fixed;left:-100%;">'+location.href+'</textarea>');
    $('#currentURL').select();
    document.execCommand('copy');
    $('#currentURL').remove();
    M.toast({html: 'URLをコピーしました'})
  }