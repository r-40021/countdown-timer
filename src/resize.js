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