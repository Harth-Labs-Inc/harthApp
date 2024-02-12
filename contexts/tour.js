import { createContext, useContext, useState } from "react";
import { updateUser } from "../requests/userApi";
import { useAuth } from "./auth";
import TalkingHead from "components/TalkingHead/TalkingHead";
import { useComms } from "./comms";
const TourContext = createContext({});

/* eslint-disable */
const stepObjects = {
  fisrtUse: [
    {
      target: "#tourFirstUse_harthIcon",
      content: (
        <TalkingHead
          text="Press here to access your settings and your other harths"
          isSmall={true}
          isTour={true}
        />
      ),
      disableBeacon: true,
      styles: {
        options: {
          zIndex: 10000,
          backgroundColor: "#aa68c8",
          arrowColor: "#aa68c8",
        },
        buttonClose: {
          display: "none",
        },
        buttonNext: {
          backgroundColor: "#fefff6",
          borderRadius: "99px",
          color: "#271623",
          padding: "12px 16px",
        },
        buttonBack: {
          color: "#fefff6",
          borderRadius: "99px",
          color: "#271623",
          padding: "12px 16px",
        },
        buttonSkip: {
          color: "#fefff6",
          borderRadius: "99px",
          padding: "12px 16px",
        },
      },
      locale: { skip: "Skip", next: "Next", last: "Got it" },
    },
    {
      target: "#tourFirstUse_harthProfile",
      content: (
        <TalkingHead
          text="Press here to customize your profile"
          isSmall={true}
          isTour={true}
        />
      ),
      disableBeacon: true,
      styles: {
        options: {
          zIndex: 10000,
          backgroundColor: "#aa68c8",
          arrowColor: "#aa68c8",
        },
        buttonClose: {
          display: "none",
        },
        buttonNext: {
          backgroundColor: "#fefff6",
          borderRadius: "99px",
          color: "#271623",
          padding: "12px 16px",
        },
        buttonBack: {
          color: "#fefff6",
          borderRadius: "99px",
          padding: "12px 16px",
        },
        buttonSkip: {
          color: "#fefff6",
          borderRadius: "99px",
          padding: "12px 16px",
        },
      },
      locale: { skip: "Skip", next: "Next", last: "Got it" },
    },
    {
      target: "#tourFirstUse_harthPageSwitcher",
      content: (
        <TalkingHead
          text="Switch between topics, gatherings, and messages for your current space"
          isSmall={true}
          isTour={true}
        />
      ),
      disableBeacon: true,
      showProgress: false,
      styles: {
        options: {
          zIndex: 10000,
          backgroundColor: "#aa68c8",
          arrowColor: "#aa68c8",
        },
        buttonClose: {
          display: "none",
        },
        buttonNext: {
          backgroundColor: "#fefff6",
          borderRadius: "99px",
          color: "#271623",
          padding: "12px 16px",
        },
        buttonBack: {
          color: "#fefff6",
          borderRadius: "99px",
          padding: "12px 16px",
        },
      },
      locale: { skip: "Skip", next: "Next", last: "Got it" },
    },
  ],
  firstPost: [
    {
      target: "#tourFirstUse_post",
      content: (
        <TalkingHead 
          text="Long press on a post to react" 
          isSmall={true} 
          isTour={true} />
      ),
      disableBeacon: true,
      showProgress: false,
      styles: {
        options: {
          zIndex: 10000,
          backgroundColor: "#aa68c8",
          arrowColor: "#aa68c8",
        },
        buttonClose: {
          display: "none",
        },
        buttonNext: {
          backgroundColor: "#fefff6",
          borderRadius: "99px",
          color: "#271623",
          padding: "12px 16px",
        },
        buttonBack: {
          color: "#fafafa",
        },
      },
      locale: { skip: "Skip", next: "Next", last: "Got it" },
    },
  ],
  firstGather: [
    {
      target: "#tourFirstUse_gather",
      content: (
        <TalkingHead 
          text="Start or schedule a gathering" 
          isSmall={true} 
          isTour={true} />
      ),
      disableBeacon: true,
      showProgress: false,
      styles: {
        options: {
          backgroundColor: "#aa68c8",
          arrowColor: "#aa68c8",
          zIndex: 10000,
        },
        buttonClose: {
          display: "none",
        },
        buttonNext: {
          backgroundColor: "#fefff6",
          borderRadius: "99px",
          color: "#271623",
          padding: "12px 16px",
        },
        buttonBack: {
          color: "#fafafa",
        },
      },
      locale: { skip: "Skip", next: "Next", last: "Got it" },
    },
  ],
};

export const TourProvider = ({ children }) => {
  const [activeTour, setActiveTour] = useState(null);
  const [lastStepIndex, setLastStepIndex] = useState(null);
  const [tourKey, setTourKey] = useState(null);

  const { user } = useAuth();
  const {
    toggleHasFinishedFirstUseTour,
    toggleHasFinishedFirstPostTour,
    toggleHasFinishedFirstGatherTour,
  } = useComms();

  const startTour = (tourKy, index) => {
    const tourSteps = stepObjects[tourKy];
    if (tourSteps) {
      let startingIndex = index || 0;
      setTourKey(tourKy);
      setLastStepIndex(startingIndex);
      setActiveTour({ steps: tourSteps, index: startingIndex });
    }
  };
  const nextStep = () => {
    setActiveTour((currentTour) => {
      if (!currentTour) return null;
      const newIndex = currentTour.index + 1;
      if (newIndex >= currentTour.steps.length) {
        skipStep();
        return null;
      }
      setLastStepIndex(newIndex);
      return { ...currentTour, index: newIndex };
    });
  };
  const prevStep = () => {
    setActiveTour((currentTour) => {
      if (!currentTour || currentTour.index === 0) {
        return currentTour;
      }
      const newIndex = currentTour.index - 1;
      setLastStepIndex(newIndex);
      return { ...currentTour, index: newIndex };
    });
  };
  const skipStep = () => {
    completedTour();
  };
  const endTour = () => {
    setActiveTour(null);
    setTourKey(null);
  };
  const completedTour = async () => {
    const flags = {
      fisrtUse: { firstUseTourApproved: true },
      firstPost: { firstPostTourApproved: true },
      firstGather: { firstGatherTourApproved: true },
    };

    if (flags[tourKey]) {
      setLastStepIndex(null);
      endTour();
      if (tourKey == "fisrtUse") {
        toggleHasFinishedFirstUseTour();
      }
      if (tourKey == "firstPost") {
        toggleHasFinishedFirstPostTour();
      }
      if (tourKey == "firstGather") {
        toggleHasFinishedFirstGatherTour();
      }
      updateUser({
        userIdForUpdate: user._id,
        update: flags[tourKey],
      });
    }
  };

  return (
    <TourContext.Provider
      value={{
        tourKey,
        activeTour,
        startTour,
        nextStep,
        skipStep,
        endTour,
        prevStep,
        lastStepIndex,
      }}
    >
      {children}
    </TourContext.Provider>
  );
};

export const useTourManager = () => useContext(TourContext);
