let timeoutLet;
export function recalTabs (){
    clearTimeout(timeoutLet);
     document.getElementById("settings").style.transform = "scale(1)";
     timeoutLet = setTimeout(() => {
       M.Tabs.getInstance(document.getElementById("settingsTab")).updateTabIndicator();
       document.getElementById("settings").style.transform = "";
     }, 200);
 }