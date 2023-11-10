import React, { useEffect, useRef, useState } from "react";
import { useTourManager } from "../../contexts/tour";
import Tour from "react-joyride";
/* eslint-disable */
const TourComponent = React.memo(() => {
  const { activeTour, nextStep, prevStep, skipStep } = useTourManager();
  const overlayRef = useRef(null);
  const [cutoutRect, setCutoutRect] = useState({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  });

  useEffect(() => {
    if (activeTour && activeTour.steps.length > 0) {
      const targetElement = document.querySelector(
        activeTour.steps[activeTour.index].target
      );
      if (targetElement) {
        const rect = targetElement.getBoundingClientRect();

        setCutoutRect(rect);
        overlayRef.current.style.clipPath = `polygon(
          0% 0%,
          0% 100%,
          ${rect.left}px 100%,
          ${rect.left}px ${rect.top}px,
          ${rect.right}px ${rect.top}px,
          ${rect.right}px ${rect.bottom}px,
          ${rect.left}px ${rect.bottom}px,
          ${rect.left}px 100%,
          100% 100%,
          100% 0%
        )`;
      }
    }
  }, [activeTour]);

  if (!activeTour) {
    return null;
  }
  const handleCallback = (data) => {
    const { status, action, type } = data;
    if (status === "finished" || status === "skipped") {
      skipStep();
    } else if (type === "step:after" && action === "next") {
      nextStep();
    } else if (type === "step:after" && action === "prev") {
      prevStep();
    }
  };
  return (
    <div>
      <div
        id="tour_overlay"
        ref={overlayRef}
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "fixed",
          top: "0px",
          left: "0px",
          width: "100vw",
          height: "100vh",
          background: "rgba(0, 0, 0, 0.7)",
          zIndex: 30,
          pointerEvents: "auto",
        }}
      ></div>
      <Tour
        run={activeTour}
        steps={activeTour.steps}
        stepIndex={activeTour.index}
        continuous={true}
        showProgress={true}
        showSkipButton={true}
        disableOverlay={true}
        callback={handleCallback}
      />
    </div>
  );
});

export default TourComponent;
