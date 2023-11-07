export const resize = (container, isMobile, isActiveScreenShare) => {
  let children = container.children;
  let paddingSize = 4;
  let borderSize = 1;
  let spacing = (paddingSize + borderSize) * 2;

  let aspectRatio = 16 / 9;

  let rows, columns;

  if (!isMobile && !isActiveScreenShare) {
    rows = Math.ceil(Math.sqrt(children.length));
    columns = Math.ceil(children.length / rows);
  } else {
    rows = children.length;
    columns = 1;
  }

  let maxVideoWidth =
    (container.offsetWidth - (columns - 1) * spacing) / columns;
  let maxVideoHeight = (container.offsetHeight - (rows - 1) * spacing) / rows;

  let videoWidth, videoHeight;
  if (!isMobile && maxVideoWidth > maxVideoHeight * aspectRatio) {
    videoHeight = maxVideoHeight;
    videoWidth = videoHeight * aspectRatio;
  } else if (!isMobile) {
    videoWidth = maxVideoWidth;
    videoHeight = videoWidth / aspectRatio;
  }

  for (let i = 0; i < children.length; i++) {
    let element = children[i];
    if (isMobile) {
      element.style.width = "100%";
      element.style.height = `calc(${
        container.offsetWidth / aspectRatio
      }px - ${spacing}px)`;
    } else {
      element.style.width = `${videoWidth}px`;
      element.style.height = `${videoHeight}px`;
    }
  }
};
