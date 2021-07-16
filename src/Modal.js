const isSP = window.ontouchstart !== undefined && 0 < navigator.maxTouchPoints;
export function modalTrigger() {
    let elements = document.getElementsByClassName("myModalTrigger");
    for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        if (isSP) {
            let leave = false;
            element.addEventListener("touchstart", (e) => {
                leave = false;
                element.addEventListener("touchend", (e) => {
                    if (!leave) {
                        document.getElementById(element.getAttribute("myModal-data").replace("#", "")).classList.add("activeModal");
                    }
                })
            }, false);
            element.addEventListener("touchmove", (e) => {
                if (document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY) !== element) {
                    leave = true;
                }
            }, false);
        } else {
            element.addEventListener("click", (e) => {
                e.preventDefault();
                document.getElementById(element.getAttribute("myModal-data").replace("#", "")).classList.add("activeModal");
            }, false);
        }
    }
}

export function modalClose() {
    history.replaceState(null, null, "./");
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
                })
            }, false);
            element.addEventListener("touchmove", (e) => {
                if (document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY) !== element) {
                    leave = true;
                }
            }, false);
        } else {
            element.addEventListener("click", (e) => {
                e.preventDefault();
                closeAllModal();

            }, false);
        }
    }
}
function closeAllModal() {
    const elements = document.getElementsByClassName("myModal");
    for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        element.classList.remove("activeModal");
    }
}