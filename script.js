$ (function () {
    var count = $('.time').text().length;
    $('.time').css('font-size', 100/count + 'vw');
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
    var SetTime = date.getHours() + ":" + minute
    /*var params = url.searchParams;
    // getメソッド
    date2 = params.get('date');
    SetTime = params.get('time');*/
    $("#Date").val(date2);
    $("#Time").val(SetTime);
});

function set() {
    var url = new URL(window.location.href);
    var myDate = $('#Date').val();
    var myTime = $('#Time').val();
    url.searchParams.append('username','taro');
    url.searchParams.append('mode','data1');
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
