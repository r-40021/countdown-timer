$ (function () {
    var count = $('.time').text().length;
    $('.time').css('font-size', 150/count + 'vw');
});

$(document).ready(function(){
    $('.datepicker').datepicker({
        format:"yyyy/mm/dd"
    });
    $('.timepicker').timepicker({
        twelveHour:false
    });
  });
