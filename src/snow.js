const targetPlace = document.body;
let snowInterval;

export function createSnow() {
    const createNewSnow = () => {
        const snow = document.createElement('span');
        snow.className = "snow";
        const maxSize = 5;
        const minSize = 10;
        const size = Math.random() * (maxSize - minSize) + minSize;
        snow.style.width = size + "px";
        snow.style.height = size + "px";
        snow.style.left = Math.random() * 100 + "%";
        targetPlace.appendChild(snow);

        setTimeout(() => {
            snow.remove();
        }, 18000);
    }

    if (!snowInterval) snowInterval = setInterval(createNewSnow, 800);
}

export function removeSnow() {
    if (snowInterval){
         clearInterval(snowInterval);
         snowInterval = null;
    }
    const snows = document.getElementsByClassName("snow");
    for (const elem of snows) {
        elem.remove();
    }
}
