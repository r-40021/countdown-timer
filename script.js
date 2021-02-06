$ (function () {
    var count = $('.time').text().length;
    $('.time').css('font-size', 100/count + 'vw');
    var date = new Date();
    var date2 = date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate()
    var minute = date.getMinutes()
    if (minute < 10) {
        minute = "0" + minute
    }
    var SetTime = date.getHours() + ":" + minute
    $("#Date").val(date2);
    $("#Time").val(SetTime);
});

function set() {
    var myquery = $(location).attr('search');
    console.log(myquery);
}

$(document).ready(function(){
    $('.datepicker').datepicker({
        format:"yyyy/mm/dd",
        autoClose:true
    });
    $('.timepicker').timepicker({
        twelveHour:false,
        autoClose:true
    });
    $('.fixed-action-btn').floatingActionButton();
  });
