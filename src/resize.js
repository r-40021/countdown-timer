export function resize() {
  const place = document.getElementById("displayTime");
  let count = place.textContent.length;
  if (count < 7) {
    count = 7;
  }
  if (window.innerWidth <= 775) {
    document.getElementById("timerSetforOld").style.fontSize = 150 / count + "vmin";
    document.getElementById("timerSet").style.fontSize = "min(" + 150 / count + "vmin ," + window.innerWidth / count * 1.5 + "px)"; //文字サイズ調整(Tablet&SP)  
  } else {
    document.getElementById("timerSetforOld").style.fontSize = 185 / count + "vmin";
    document.getElementById("timerSet").style.fontSize = "min(" + 185 / count + "vmin ," + window.innerWidth * 0.95 / count * 1.5 + "px)"; //文字サイズ調整
  }
}
export function resizeTitleInput() {
  const title = document.getElementById("title");
  const windowWidth = window.innerWidth;
  let defaultFontSize;
  if (windowWidth < 480) {
    defaultFontSize = vminToPx(6);
  } else if (windowWidth < 768) {
    defaultFontSize = vminToPx(5);
  } else {
    defaultFontSize = vminToPx(6.7);
  }
  title.style.fontSize = Math.max(Math.min((title.offsetWidth / getLen(title.value) + 5) * 0.8, defaultFontSize), 20) + "px";
}
function vminToPx(vmin) {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  return Math.min(windowWidth, windowHeight) * vmin / 100;
}

function getLen(str) {
  var result = 0;
  for (var i = 0; i < str.length; i++) {
    var chr = str.charCodeAt(i);
    if ((chr >= 0x00 && chr < 0x81) ||
      (chr === 0xf8f0) ||
      (chr >= 0xff61 && chr < 0xffa0) ||
      (chr >= 0xf8f1 && chr < 0xf8f4)) {
      result += 0.5;
    } else {
      result += 1;
    }
  }
  return result;
};