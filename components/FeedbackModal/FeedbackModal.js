import { useState } from "react";
import OutsideClickHandler from "../Common/Modals/OutsideClick";
import styles from "./FeedbackModal.module.scss";
import { sendFeedbackEmail } from "requests/userApi";
import { useComms } from "contexts/comms";
import { generateID } from "services/helper";
import { IconClose } from "resources/icons/IconClose";

export const FeedbackModal = (props) => {
  const { onToggleModal, disableOutsideClose } = props;

  const { profile } = useComms();

  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [userFeedback, setUserFeedback] = useState("");
  const [screenshot, setScreenshot] = useState(null);

  const closeModal = () => {
    onToggleModal();
  };
  const detectPlatformBrowser = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    let browserName = "Unknown";
    let platform = "Unknown";

    if (userAgent.includes("chrome") && !userAgent.includes("edge")) {
      browserName = "Chrome";
    } else if (userAgent.includes("safari") && !userAgent.includes("chrome")) {
      browserName = "Safari";
    } else if (userAgent.includes("firefox")) {
      browserName = "Firefox";
    } else if (userAgent.includes("msie") || userAgent.includes("trident/")) {
      browserName = "Internet Explorer";
    } else if (userAgent.includes("edge")) {
      browserName = "Edge";
    }

    if (userAgent.includes("windows")) {
      platform = "Windows";
    } else if (userAgent.includes("mac")) {
      platform = "MacOS";
    } else if (userAgent.includes("linux")) {
      platform = "Linux";
    } else if (userAgent.includes("iphone") || userAgent.includes("ipad")) {
      platform = "iOS";
    } else if (userAgent.includes("android")) {
      platform = "Android";
    }

    return {
      browser: browserName,
      platform: platform,
    };
  };
  const detectDisplayMode = () => {
    let displayMode = "browser_tab";

    if (navigator.standalone) {
      displayMode = "standalone_ios";
    } else if (window.matchMedia("(display-mode: standalone)").matches) {
      displayMode = "standalone";
    }

    return displayMode;
  };
  const gatherSupportedFeatures = () => {
    return {
      cookiesEnabled: navigator.cookieEnabled,
      localStorage: !!window.localStorage,
      sessionStorage: !!window.sessionStorage,
      serviceWorkers: "serviceWorker" in navigator,
      notifications: "Notification" in window,
      wakeLock: "wakeLock" in navigator,
    };
  };
  const gatherNetworkInfo = () => {
    if (!navigator.connection) {
      return "Not Supported";
    }
    return {
      type: navigator.connection.type || "N/A",
      effectiveType: navigator.connection.effectiveType || "N/A",
      rtt: navigator.connection.rtt || "N/A",
    };
  };
  const gatherServiceWorkerStatus = async () => {
    if (!("serviceWorker" in navigator)) {
      return "Not Supported";
    }
    const registration = await navigator.serviceWorker.getRegistration();
    return registration ? "Activated" : "Not Activated";
  };
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result.split(",")[1];
        const format = file.type.split("/")[1];
        resolve({ base64: base64String, format });
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!isLoading) {
      setIsLoading(true);
      const collectedData = {
        ticketID: generateID(),
        currentURL: window.location.href,
        networkInfo: gatherNetworkInfo(),
        supportedFeatures: gatherSupportedFeatures(),
        timestamp: new Date().toISOString(),
        platformData: detectPlatformBrowser(),
        installData: detectDisplayMode(),
        serviceWorkerStatus: await gatherServiceWorkerStatus(),
      };

      let screenshotBase64;
      let imageFormat;
      if (screenshot) {
        const fileData = await fileToBase64(screenshot);
        screenshotBase64 = fileData.base64;
        imageFormat = fileData.format;
      }

      await sendFeedbackEmail(
        collectedData,
        userFeedback,
        screenshotBase64,
        imageFormat,
        profile?.name || ""
      );
      setUserFeedback("");
      setIsComplete(true);
      setIsLoading(false);
    }
  };

  const inputChangeHandler = (e) => {
    const { value } = e.target;
    setUserFeedback(value);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size <= 5000000) {
      setScreenshot(file);
    }
  };

  return (
    <div className={styles.mainContainer}>
      <OutsideClickHandler
        onMouseUpOutside={() => (disableOutsideClose ? closeModal() : null)}
      >
        <form onSubmit={submitHandler} className={styles.innerContainer}>
          <h2>Submit Feedback</h2>
          <button className={styles.closeBtn} onClick={closeModal}>
            <IconClose />
          </button>

          {isComplete ? (
            <div className={styles.successContainer}>
              <p>Thank you for your feedback</p>
              <p>
                We appreciate you taking the time to help us make Härth a better
                place.
              </p>
              <p style={{width: 100}}>
              <button onClick={closeModal}>
                Close
              </button>
              </p>
            </div>
          ) : (
            <>
              <div className={styles.contentContainer}>
                <label htmlFor="feedback">
                  What would you like to tell us?
                </label>
                <div className={styles.inputContainer}>
                  <textarea
                    onChange={inputChangeHandler}
                    id="feedback"
                    rows="13"
                  ></textarea>
                </div>
                <br />
                <div className={styles.fileContainer}>
                  <label htmlFor="screenshot">
                    Attach a screenshot (optional)
                  </label>
                  <input
                    type="file"
                    id="screenshot"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>
              </div>
              <div className={styles.submitContainer}>
                <button type="submit">Submit</button>
              </div>
            </>
          )}
        </form>
      </OutsideClickHandler>
    </div>
  );
};
