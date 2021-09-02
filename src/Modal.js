const isSP = window.ontouchstart !== undefined && 0 < navigator.maxTouchPoints;
export function modalTrigger() {
    let modalElements = document.getElementsByClassName("myModal");
    for (let i = 0; i < modalElements.length; i++) {
        modalElements[i].style.zIndex = -1;
    }
    let elements = document.getElementsByClassName("myModalTrigger");
    for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        document.getElementById("myModal-overlay").style.zIndex = -2;
        if (isSP) {
            let leave = false;
            element.addEventListener("touchstart", (e) => {
                leave = false;
                element.addEventListener("touchend", (e) => {
                    if (!leave) {
                        const modal = document.getElementById(element.getAttribute("myModal-data").replace("#", ""));
                        document.getElementById("myModal-overlay").style.zIndex = "";
                        modal.style.zIndex = "";
                        modal.classList.add("activeModal");
                    }
                }, {passive: true});
            }, {passive: true});
            element.addEventListener("touchmove", (e) => {
                if (document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY) !== element) {
                    leave = true;
                }
            }, {passive: true});
        } else {
            element.addEventListener("click", (e) => {
                e.preventDefault();
                const modal = document.getElementById(element.getAttribute("myModal-data").replace("#", ""));
                document.getElementById("myModal-overlay").style.zIndex = "";
                modal.style.zIndex = "";
                modal.classList.add("activeModal");
            }, false);
        }
    }
}

export function modalClose() {
    let elements = document.getElementsByClassName("myModal-close");
    for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        if (isSP) {
            let leave = false;
            element.addEventListener("touchstart", (e) => {
                leave = false;
                element.addEventListener("touchend", (e) => {
                    if (!leave) {
                        closeAllModal();
                    }
                }, {passive: true})
            }, {passive: true});
            element.addEventListener("touchmove", (e) => {
                if (document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY) !== element) {
                    leave = true;
                }
            }, {passive: true});
        } else {
            element.addEventListener("click", (e) => {
                e.preventDefault();
                closeAllModal();

            }, false);
        }
    }
    document.addEventListener("keydown", (e)=>{
        if (!e.repeat && e.key ===  "Escape" && document.querySelector(".myModal.activeModal")) {
            closeAllModal();
        }
    });
}
let overlayTimeout;
let activeModal = [];
export function closeAllModal() { 
    clearTimeout(overlayTimeout);
    const elements = document.getElementsByClassName("myModal");
    for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        if (element.classList.contains("activeModal")) {
            element.classList.remove("activeModal");
            activeModal.push(element);
        }
    }
    overlayTimeout = setTimeout(changeIndex, 150);
}
function changeIndex(){
    document.getElementById("myModal-overlay").style.zIndex = -2;
        for (let i = 0; i < activeModal.length; i++) {
            const element = activeModal[i];
            element.style.zIndex = -1;
        }
}