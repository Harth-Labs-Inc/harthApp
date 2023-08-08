export const resize = (container, isMobile, isActiveScreenShare) => {
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

  max = max - 4 * 2;

  for (var s = 0; s < children.length; s++) {
    let element = children[s];
    if (children.length === 1) {
      if (isMobile) {
        element.style.width = "100%";
      } else {
        element.style.width = max + "px";
      }
    } else if (children.length < 7) {
      const divisor = Math.ceil(children.length / 2);
      const widthOnMobile =
        !isActiveScreenShare && isMobile && children.length <= 2
          ? "100%"
          : max / 2 + "px";
      element.style.width = widthOnMobile;
      element.style.minWidth = "calc(50%  - 16px)";
      element.style.maxHeight = `calc(100% / ${divisor} - 8px)`;
    } else if (children.length > 6) {
      const divisor = Math.ceil(children.length / 3);
      element.style.width = max / 3 + "px";
      element.style.minWidth = "calc(100% / 3 - 16px)";
      element.style.maxHeight = `calc(100% / ${divisor} - 8px)`;
    }
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
