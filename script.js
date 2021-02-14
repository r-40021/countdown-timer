$ (function () {
    var count = $('.time').text().length;
    $('.time').css('font-size', 100/count + 'vw');//文字サイズ調整
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
        $('#Date').val(paramObject.date);
        $('#Time').val(paramObject.time);
    } else{
    var date = new Date();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    if (month < 10) {
        month = "0" + month;
    }
    if (day < 10) {
        day = "0" + day;
    }
    var date2 = date.getFullYear() + "/" + month + "/" + day
    var minute = date.getMinutes()
    if (minute < 10) {
        minute = "0" + minute
    }
    var SetTime = date.getHours() + ":" + minute;
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