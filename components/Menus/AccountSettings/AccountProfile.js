import { useState, useContext } from "react";
import { useAuth } from "../../../contexts/auth";
import {
  saveAcountSettingsUpdates,
  sendFullRefreshOTPEmail,
} from "../../../requests/userApi";
import { Button, BackButton, EditButton, Modal } from "../../Common";
import OtpValidator from "../../../pages/auth/OtpValidator";
import Cookies from "js-cookie";
import styles from "./SettingsMenu.module.scss";
import { MobileContext } from "contexts/mobile";

const AccountProfile = (props) => {
  const { toggleCurrentPage } = props;
  const { user, setContextUser } = useAuth();
  const [currentTab, setCurrentTab] = useState("");
  const [formData, setFormData] = useState({ ...user });
  /* eslint-disable-next-line */
  const [originalData, setOriginalData] = useState({ ...user });
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [error, setError] = useState("");
  const [theme, setTheme] = useState(Cookies.get("theme"));
  const [textSize, setTextSize] = useState(Cookies.get("textSize"));
  const { isMobile } = useContext(MobileContext);

  const toggleCurrentSetting = (name) => {
    setCurrentTab(name);
  };
  const submitHandler = async (e) => {
    if (e) {
      e.preventDefault();
    }

    if (currentTab == "email") {
      if (formData[currentTab] !== originalData[currentTab]) {
        toggleOTPVerification();
      }
    } else {
      let results = await saveAcountSettingsUpdates(
        user._id,
        currentTab,
        formData[currentTab]
      );
      if (results.ok) {
        setContextUser({ ...user, [currentTab]: formData[currentTab] });
      } else {
        setError(results.msg);
      }
    }
  };
  const toggleOTPVerification = async () => {
    const token = localStorage.getItem("token");
    let results = await sendFullRefreshOTPEmail(token, formData[currentTab]);

    if (results.ok) {
      setShowOTPModal(true);
    } else if (results.lockDown) {
      localStorage.removeItem("token");
      window.location.pathname = "/";
    } else {
      setError(results.msg);
    }
  };
  const handleBack = () => {
    toggleCurrentPage("");
  };
  const inputChangeHandler = (e) => {
    const { value } = e.target;

    setFormData({
      ...formData,
      [currentTab]: value,
    });
  };
  const SaveFromOTPSuccess = async () => {
    let results = await saveAcountSettingsUpdates(
      user._id,
      currentTab,
      formData[currentTab]
    );
    if (results.ok) {
      setContextUser({ ...user, [currentTab]: formData[currentTab] });
    } else {
      setError(results.msg);
    }
  };

  const toggleLightMode = () => {
    document.body.classList.remove("dark-mode");
    document.body.classList.add("light-mode");
    Cookies.set("theme", "light-mode", { expires: 365 });
    setTheme("light-mode");
    //now set the theme color for manifest
    let themeColor = "#e8e8ee"; // menu color

    let themeColorMetaTag = document.querySelector('meta[name="theme-color"]');
    if (themeColorMetaTag) {
      themeColorMetaTag.setAttribute("content", themeColor);
    } else {
      // If the meta tag does not exist, create it
      let metaTag = document.createElement("meta");
      metaTag.setAttribute("name", "theme-color");
      metaTag.setAttribute("content", themeColor);
      document.head.appendChild(metaTag);
    }
  };

  const toggleDarkMode = () => {
    document.body.classList.remove("light-mode");
    document.body.classList.add("dark-mode");
    Cookies.set("theme", "dark-mode", { expires: 365 });
    setTheme("dark-mode");

    //now set the theme color for manifest
    let themeColor = "#38383e"; // menu color

    let themeColorMetaTag = document.querySelector('meta[name="theme-color"]');
    if (themeColorMetaTag) {
      themeColorMetaTag.setAttribute("content", themeColor);
    } else {
      // If the meta tag does not exist, create it
      let metaTag = document.createElement("meta");
      metaTag.setAttribute("name", "theme-color");
      metaTag.setAttribute("content", themeColor);
      document.head.appendChild(metaTag);
    }
  };

  const toggleTextReg = () => {
    document.body.classList.remove("text-large");
    document.body.classList.add("text-reg");
    Cookies.set("textSize", "text-reg", { expires: 365 });
    setTextSize("text-reg");
  };

  const toggleTextLarge = () => {
    document.body.classList.remove("text-reg");
    document.body.classList.add("text-large");
    Cookies.set("textSize", "text-large", { expires: 365 });
    setTextSize("text-large");
  };

  if (!currentTab) {
    return (
      <>
        <div className={styles.SettingsContainer}>
          <div className={styles.SettingsContainerHeader}>
            <BackButton clickHandler={handleBack} />
            <p>Settings</p>
          </div>

          <div className={styles.sectionContainer}>
            <div className={styles.SettingsContainerTitle}>Email</div>
            <div className={styles.optionHolder}>
              <p>{user.email}</p>
              <EditButton clickHandler={() => toggleCurrentSetting("email")} />
            </div>
{/* 
            <div className={styles.SettingsContainerTitle}>Interface</div>
            <div className={styles.themeHolder}>
              <button
                className={`${styles.theme} ${
                  theme === "dark-mode" ? styles.active : ""
                }`}
                onClick={toggleDarkMode}
              >
                <p>Dark Mode</p>
                <img src="/images/darkmode.png" />
              </button>

              <button
                className={`${styles.theme} ${
                  theme === "light-mode" ? styles.active : ""
                }`}
                onClick={toggleLightMode}
              >
                <p>Light Mode</p>
                <img src="/images/lightmode.png" />
              </button>
            </div> */}


            <div className={styles.SettingsContainerTitle}>Chat Text Size</div>
            <div className={styles.textSizeHolder}>
              <button
                className={`${styles.theme} ${
                  textSize === "text-reg" ? styles.active : ""
                }`}
                onClick={toggleTextReg}
              >
                <p>Reg Text</p>
                <span className={isMobile ? styles.regTextMobile : styles.regText}>The quick brown fox jumps over the lazy dog.</span>
              </button>

              <button
                className={`${styles.theme} ${
                  textSize === "text-large" ? styles.active : ""
                }`}
                onClick={toggleTextLarge}
              >
                <p>Large Text</p>
                <span className={isMobile ? styles.largeTextMobile : styles.largeText}>The quick brown fox jumps over the lazy dog.</span>
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }
  return (
    <>
      {showOTPModal ? (
        <Modal onToggleModal={() => setShowOTPModal(false)}>
          <OtpValidator
            userForModal={originalData}
            alternativeEmail={formData["email"]}
            isInModal={true}
            closeModal={() => setShowOTPModal(false)}
            parentSubmit={SaveFromOTPSuccess}
          />
        </Modal>
      ) : null}
      <div className={styles.SettingsContainer}>
        <div className={styles.SettingsContainerHeader}>
          <BackButton
            clickHandler={() => {
              setError("");
              setFormData({ ...user });
              toggleCurrentSetting("");
            }}
          />
          <p>
            {currentTab == "dob" && "Edit Birthday"}
            {currentTab == "fullName" && "Edit Name"}
            {currentTab == "email" && "Edit Email"}
          </p>
        </div>

        <form className={styles.EditContainer} onSubmit={submitHandler}>
          {currentTab == "dob" ? (
            <input
              value={formData[currentTab] || ""}
              type="date"
              className={styles.inputEdit}
              onInput={inputChangeHandler}
              required
            />
          ) : (
            <input
              value={formData[currentTab] || ""}
              placeholder={formData[currentTab]}
              onInput={inputChangeHandler}
              type="text"
              className={styles.inputEdit}
              required
            />
          )}
          <p>{error}</p>
          <div className={styles.buttonBar}>
            <Button
              size="small"
              text="Cancel"
              tier="secondary"
              type="button"
              onClick={() => {
                setError("");
                setFormData({ ...user });
                toggleCurrentSetting("");
              }}
              className={styles.cancelButton}
            ></Button>
            <Button size="small" text="Confirm" type="submit"></Button>
          </div>
        </form>
      </div>
    </>
  );
};

export default AccountProfile;
