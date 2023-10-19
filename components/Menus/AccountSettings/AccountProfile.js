import { useState } from "react";
import { useAuth } from "../../../contexts/auth";
import {
  saveAcountSettingsUpdates,
  sendFullRefreshOTPEmail,
} from "../../../requests/userApi";
import {
  // getBraintreeToken,
  submitBraintreePurchase,
} from "../../../requests/braintree";

import { Button, BackButton, EditButton, Modal } from "../../Common";

import OtpValidator from "../../../pages/auth/OtpValidator";

import styles from "./SettingsMenu.module.scss";
import { useRef } from "react";
import { useEffect } from "react";

const AccountProfile = (props) => {
  const { toggleCurrentPage } = props;
  const { user, setContextUser } = useAuth();
  const [currentTab, setCurrentTab] = useState("");
  const [formData, setFormData] = useState({ ...user });
  /* eslint-disable-next-line */
  const [originalData, setOriginalData] = useState({ ...user });
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [paymentInstance, setPaymentInstance] = useState();
  const [paymentNonce, setPaymentNonce] = useState();
  const [error, setError] = useState("");

  const dropinContainerRef = useRef(null);

  useEffect(() => {
    addBraintreeScript();
  }, []);

  const addBraintreeScript = () => {
    const script = document.createElement("script");
    script.src =
      "https://js.braintreegateway.com/web/dropin/1.31.0/js/dropin.min.js";
    script.async = true;
    script.onload = () => {
      console.log("Braintree script loaded successfully");
    };
    script.onerror = () => {
      console.error("Failed to load Braintree script");
    };
    document.head.appendChild(script);
  };
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
  // const startPaymentProcess = async () => {
  //   teardownBraintreeUI();

  //   const { clientToken } = await getBraintreeToken();

  //   if (clientToken) {
  //     window.braintree.dropin.create(
  //       {
  //         authorization: clientToken,
  //         container: dropinContainerRef.current,
  //         paymentOptionPriority: [
  //           "card",
  //           "paypal",
  //           "venmo",
  //           "applePay",
  //           "googlePay",
  //         ],
  //       },
  //       (_, instance) => {
  //         if (instance) {
  //           setPaymentInstance(instance);
  //         }
  //       }
  //     );
  //   }
  // };
  const handlePaymentNonce = async () => {
    if (!paymentInstance) {
      return;
    }

    paymentInstance.requestPaymentMethod((err, payload) => {
      if (err) {
        console.log("Error requesting payment method: ", err);
        return;
      }
      setPaymentNonce(payload);
    });
  };
  const teardownBraintreeUI = () => {
    if (paymentInstance) {
      paymentInstance.teardown((err) => {
        if (!err) {
          setPaymentInstance(null);
        }
      });
    }
  };
  const resetPayment = () => {
    setPaymentNonce(null);
    teardownBraintreeUI();
  };
  const handlePurchase = async () => {
    const { ok } = await submitBraintreePurchase({
      paymentNonce,
      amount: "0.01",
    });
    if (ok) {
      resetPayment();
    }
  };

  if (!currentTab) {
    return (
      <>
        <div
          id="payment_modal"
          ref={dropinContainerRef}
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            zIndex: paymentInstance || paymentNonce ? 1 : 0,
            transform: "translate3d(-50%,-50%, 0)",
            background:
              paymentInstance || paymentNonce ? "white" : "transparent",
            minHeight: paymentInstance ? 400 : paymentNonce ? 280 : 0,
            minWidth: paymentInstance ? 400 : paymentNonce ? 280 : 0,
            padding: "10px",
          }}
        >
          {paymentNonce ? (
            <button
              style={{
                display: "block",
                bottom: "10px",
                right: "10px",
                position: "absolute",
              }}
              onClick={handlePurchase}
            >
              Purchase
            </button>
          ) : paymentInstance ? (
            <button
              style={{
                display: "block",
                bottom: "10px",
                right: "10px",
                position: "absolute",
              }}
              onClick={handlePaymentNonce}
            >
              Continue
            </button>
          ) : null}
        </div>
        <div className={styles.SettingsContainer}>
          <div className={styles.SettingsContainerHeader}>
            <BackButton clickHandler={handleBack} />
            <p>Your Account</p>
          </div>

          <div className={styles.sectionContainer}>
            <div className={styles.SettingsContainerTitle}>Email</div>
            <div className={styles.optionHolder}>
              {user.email}
              <EditButton clickHandler={() => toggleCurrentSetting("email")} />
            </div>

            <div className={styles.SettingsContainerTitle}>Full Name</div>
            <div className={styles.optionHolder}>
              {user.fullName}
              <EditButton
                clickHandler={() => toggleCurrentSetting("fullName")}
              />
            </div>

            <div className={styles.SettingsContainerTitle}>Birthday</div>
            <div className={styles.optionHolder}>
              {user.dob}
              <EditButton clickHandler={() => toggleCurrentSetting("dob")} />
            </div>
          </div>

          {/* <div>
            <button onClick={startPaymentProcess}>Upgrade!</button>
          </div> */}
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
