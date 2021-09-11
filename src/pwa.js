/* PWA Install Button (https://demi-urge.com/pwa-sw/) */

export function registerInstallAppEvent(elem) {
    //インストールバナー表示条件満足時のイベントを乗っ取る
    window.addEventListener('beforeinstallprompt', function (event) {
        elem.promptEvent = event; //eventを保持しておく
        elem.style.display = "inline-block"; //要素を表示する
        return false;
    });
    //インストールダイアログの表示処理
    function installApp() {
        if (elem.promptEvent) {
            elem.promptEvent.prompt(); //ダイアログ表示
            elem.promptEvent.userChoice.then(function (choice) {
                elem.style.display = "none";
                elem.promptEvent = null; //一度しか使えないため後始末
            });//end then
        }
    }//end installApp
    //ダイアログ表示を行うイベントを追加
    elem.addEventListener("click", installApp);
}
