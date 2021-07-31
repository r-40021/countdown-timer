export function fullscreen() {
    // フルスクリーン表示
    document.getElementById("fullscreen").addEventListener("click", function () {
      // Chrome & Firefox v64以降
      if (document.body.requestFullscreen) {
        document.body.requestFullscreen();
        // Firefox v63以前
      } else if (document.body.mozRequestFullScreen) {
        document.body.mozRequestFullScreen();
        // Safari & Edge & Chrome v68以前
      } else if (document.body.webkitRequestFullscreen) {
        document.body.webkitRequestFullscreen();
        // IE11
      } else if (document.body.msRequestFullscreen) {
        document.body.msRequestFullscreen();
      }
    });
    // フルスクリーン解除
    document
      .getElementById("escFullscreen")
      .addEventListener("click", function () {
        // Chrome & Firefox v64以降
        if (document.exitFullscreen) {
          document.exitFullscreen();
          // Firefox v63以前
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
          // Safari & Edge & Chrome v44以前
        } else if (document.webkitCancelFullScreen) {
          document.webkitCancelFullScreen();
          // IE11
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
      }, false);
  }