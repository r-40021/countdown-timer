import { changeUseDevice, pushrequest } from "./index";
let useDevice;
export function device() {
    let userAgent = window.navigator.userAgent.toLowerCase(); //ブラウザ情報取得
    if (
        userAgent.indexOf("msie") === -1 &&
        userAgent.indexOf("trident") === -1 /*IEを省く*/ &&
        (userAgent.indexOf("windows") != -1 ||
            (userAgent.indexOf("mac os x") != -1 &&
                "ontouchend" in document ===
                false) /*mac os xが含まれていて、かつマウスデバイス*/ ||
            userAgent.indexOf("cros") != -1 ||
            (userAgent.indexOf("linux") != -1 && "ontouchend" in document === false))
    ) {
        //PCとIE以外でしか実行しない
        changeUseDevice(1);
    } else {
        document.getElementById("nophone").remove();
    }
    if (
        userAgent.indexOf("iphone") != -1 ||
        (userAgent.indexOf("mac os x") != -1 && "ontouchend" in document)
    ) {
        /*iPhone/iPad除く*/ /*iPhone/iPadのときは全画面表示関連を非表示*/
        const elements = document.getElementsByClassName("noiphone");
        for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            element.style.display = "none";
        }
        document.getElementById("file1").setAttribute("accept", ".mp3,.m4a,.aac,.wav,.flac");
    }
    pushrequest();
}
