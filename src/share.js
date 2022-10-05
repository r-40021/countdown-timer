export function shareAPI (){
    const element = document.getElementById("shareAPI");
    if(!navigator.share){
        element.remove();
    }
    element.addEventListener("click", async () => {
        let title = document.getElementById("title").value;
        const shareData = {
            title: 'やまだのタイマー',
            text: (title ? title + "\n" : "") + '10万年先まで計れるやまだのタイマーでカウントダウン！',
            url: location.href
          }

        try {
            await navigator.share(shareData)
          } catch(err) {
              console.error("Web Share API:" + err);
          }
    })
}

export function copy() {
    /*URLコピー*/
    var url = location.href;
    navigator.clipboard.writeText(url);
    M.toast({ html: "URLをコピーしました" });
}

export function tweet() {
    let title = document.getElementById("title").value;
    // ツイート文を作成
    let base = "https://twitter.com/intent/tweet?";
    let hashtags = "やまだのタイマー,カエルアプリ工房";
    let text = "10万年先まで計れるやまだのタイマーでカウントダウン！";
    let url;
    if (title) {
        url =
            base +
            "text=" +
            "「" +
            title +
            "」%0a" +
            text +
            "%0a&hashtags=" +
            hashtags +
            "&url=" +
            encodeURIComponent(window.location.href);
    } else {
        url =
            base +
            "text=" +
            text +
            "%0a&hashtags=" +
            hashtags +
            "&url=" +
            encodeURIComponent(window.location.href);
    }
    return url;
}
