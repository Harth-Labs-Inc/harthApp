export const resize = (container) => {
    // let container = document.getElementById('peerContainer')
    let children = container.children;

    let max = 0;
    let i = 1;
    while (i < 5000) {
        let area = getArea(i);
        if (area === false) {
            max = i - 1;
            break;
        }
        i++;
    }

    // remove margins
    max = max - 4 * 2;

    for (var s = 0; s < children.length; s++) {
        // camera fron dish (div without class)
        let element = children[s];
        // // custom margin
        // element.style.margin = 4 + 'px'

        // // calculate dimensions
        element.style.width = max + "px";
        element.style.height = max + "px";

        // // to show the aspect ratio in demo (optional)
        // element.setAttribute('data-aspect', 0.5625s[this._aspect])
    }
};
const getArea = (increment) => {
    let container = document.getElementById("peerContainer");
    let containerHeight = container.offsetHeight - 4 * 2;
    let containerWidth = container.offsetWidth - 4 * 2;
    let children = container.children;
    let i = 0;
    let w = 0;
    let h = increment + 4 * 2;
    while (i < children.length - 1) {
        if (w + increment > containerWidth) {
            w = 0;
            h = h + increment + 4 * 2;
        }
        w = w + increment + 4 * 2;
        i++;
    }
    if (h > containerHeight || increment > containerWidth) return false;
    else return increment;
};
