import { recalTabs } from "./Tabs";
export function materializeInit() {
    /*datepicker*/
    var elems = document.querySelectorAll(".datepicker");
    var options = {
      autoClose: true,
      defaultDate: new Date(),
      minDate: new Date(),
      i18n: {
        months: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
        monthsShort: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
        weekdays: ["日曜日", "月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日"],
        weekdaysShort: ["日曜日", "月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日"],
        weekdaysAbbrev: ["日", "月", "火", "水", "木", "金", "土"],
        nextMonth: "翌月",
        previousMonth: "前月",
        labelMonthSelect: "月を選択",
        labelYearSelect: "年を選択",
        setDefaultDate: true,
        cancel: 'キャンセル',
        clear: 'クリア',
        done: 'OK',
        close: "閉じる",
      },
      format: "yyyy/mm/dd"
    };
    var instances = M.Datepicker.init(elems, options);
    /*timepicker*/
    elems = document.querySelectorAll(".timepicker");
    options = {
      twelveHour: false,
      i18n: {
        cancel: 'キャンセル',
        clear: 'クリア',
        done: 'OK',
        close: "閉じる",
      },
      autoClose: true
    };
    instances = M.Timepicker.init(elems, options);
    // tab
    elems = document.querySelectorAll(".tabs");
    instances = M.Tabs.init(elems, {});
    // collapsible
    var elems = document.querySelectorAll('.collapsible');
    var instances = M.Collapsible.init(elems, options);
  
    /** 監視対象の要素オブジェクト */
    const obElem = document.getElementsByClassName("date-text")[0];
  
    /** 監視時のオプション */
    const config = {
      attributes: true,
      childList: true,
      characterData: true
    };
  
    var observer = new MutationObserver(function (record) {
      /** DOM変化の監視を一時停止 */
      observer.disconnect();
  
      formatCal();
  
      /** DOM変化の監視を再開 */
      observer.observe(obElem, config);
    });
  
    observer.observe(obElem, config);
  
    function formatCal() {
      var elem = document.getElementsByClassName("date-text")[0];
      if (elem.textContent.match(",")) {
        try {
          document.getElementById("calDate").remove();
          document.getElementById("calDay").remove();
        } catch (error) {
  
        }
        let parts = elem.textContent.split(",");
        elem.textContent = null;
        let date = document.createElement("span");
        date.innerText = parts[1].replace(" ", "") + "日";
        date.style.display = "inline-block";
        date.setAttribute("id", "calDate");
        elem.appendChild(date);
  
        let day = document.createElement("span");
        day.innerText = "(" + parts[0].replace("曜日", "") + ")";
        day.style.display = "inline-block";
        day.setAttribute("id", "calDay");
        elem.appendChild(day);
      }
    }
    recalTabs();
  }