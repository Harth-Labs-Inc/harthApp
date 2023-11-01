import { useRef, useState, useEffect } from "react";
import { useComms } from "../../../contexts/comms";
import { sendInviteEmails } from "../../../requests/community";
import styles from "./inviteModal.module.scss";
import { IconClose } from "resources/icons/IconClose";

const InviteComp = (props) => {
  const { comms, setCommsFromChild, selectedCommRef, profile } = useComms();
  const [COMMS, SETCOMMS] = useState([]);
  const [selectedHarth, setSelectedHarth] = useState({});
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [enteredEmails, setEnteredEmails] = useState([]);
  const [submitError, setSubmitError] = useState(null);
  const [formatError, setFormatError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

  const { toggleCurrentPage } = props;

  const commsRef = useRef([]);

  useEffect(() => {
    if (comms) {
      commsRef.current = comms;
      SETCOMMS(comms);
    }
  }, [comms]);
  useEffect(() => {
    if (selectedCommRef.current) {
      setSelectedHarth(selectedCommRef.current);
    }
  }, [selectedCommRef.current]);
  useEffect(() => {
    return () => {
      setCommsFromChild(commsRef.current);
    };
  }, []);

  const handleBack = () => {
    toggleCurrentPage("");
  };
  const handleHarthChange = (harth) => {
    setSelectedHarth(harth);
    toggleDropdown(false);
  };
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };
  const handleInputChange = (e) => {
    setEmailInput(e.target.value);
    setSubmitError(null);
    setFormatError(null);
  };
  const handleInputKeyPress = (e) => {
    if (e.key === "Enter" || e.key === "," || e.key === "Tab") {
      e.preventDefault();

      const newEmail = emailInput.trim();
      if (newEmail && emailRegex.test(newEmail)) {
        if (!enteredEmails.includes(newEmail)) {
          setEnteredEmails([...enteredEmails, newEmail]);
        }

        setEmailInput("");
        setFormatError(null);
      } else if (newEmail && !emailRegex.test(newEmail)) {
        setFormatError(true);
      }
    }
  };
  const handleEmailDelete = (emailToDelete) => {
    const updatedEmails = enteredEmails.filter(
      (email) => email !== emailToDelete
    );
    setEnteredEmails(updatedEmails);
  };
  const submitHandler = async () => {
    let emails = enteredEmails;

    const newEmail = emailInput.trim();
    if (newEmail && emailRegex.test(newEmail)) {
      if (!emails.includes(newEmail)) {
        emails = [...emails, newEmail];
      }
    }

    if (!emails.length) {
      setSubmitError("Please enter an email");
      return;
    }

    if (!isSubmitting) {
      setIsSubmitting(true);
      await sendInviteEmails({ selectedHarth, enteredEmails: emails, profile });
      setEnteredEmails(emails);
      setIsSubmitting(false);
      setSubmitSuccess(true);
    }
  };
  const resetHandler = () => {
    setEmailInput("");
    setEnteredEmails([]);
    setSubmitError(null);
    setFormatError(null);
    setIsSubmitting(false);
    setSubmitSuccess(false);
    setSelectedHarth(selectedCommRef.current);
  };
  if (!comms) {
    return <p>...loading</p>;
  }

  if (!comms.length) {
    return <p>No harths found</p>;
  }

  return (
    <div className={styles.backdrop}>
      <div className={styles.innerContainer}>
        {!submitSuccess ? (
          <>
          <div className={styles.heading}>Send an Invite</div>
            

            <button className={styles.closeBtn} onClick={handleBack}>
              <IconClose />
            </button>

            <div className={styles.InviteList}>
              <div className={styles.harthdropdown}>
                <label htmlFor="harthSelect">Select a Harth</label>
                <div className={styles.dropdownheader} onClick={toggleDropdown}>
                  <div className={styles.dropdownSelected}>
                    {selectedHarth?.iconKey && (
                      <img
                        style={{ height: "48px", width: "48px" }}
                        src={selectedHarth.iconKey}
                        alt={selectedHarth.name}
                        className="harth-iconKey"
                      />
                    )}
                    <span>{selectedHarth?.name}</span>
                  </div>

                  <span className={styles.arrow}>&#9660;</span>
                </div>
                {isDropdownOpen && (
                  <div className={styles.dropdownoptions}>
                    {COMMS.map((harth) => (
                      <div
                        className={styles.dropdownoption}
                        key={harth._id}
                        onClick={() => handleHarthChange(harth)}
                      >
                        {harth.iconKey && (
                          <img
                            style={{ height: "48px", width: "48px" }}
                            src={harth.iconKey}
                            alt={harth.name}
                            className="harth-iconKey"
                          />
                        )}
                        <span>{harth.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <label htmlFor="harthSelect">Recipient Email</label>
              <p>
                {formatError ? "Invalid format" : ""}
              </p>
              <div className={styles.emailinput}>
                <input
                  type="text"
                  placeholder="email@email.com"
                  value={emailInput}
                  onChange={handleInputChange}
                  onKeyDown={handleInputKeyPress}
                />
                <div className={styles.enteredemails}>
                  <div className={styles.innerenteredemails}>
                    {enteredEmails.map((email, index) => (
                      <div className={styles.email} key={index}>
                        <button
                          onClick={() => handleEmailDelete(email)}
                        >
                          X
                        </button>
                        {index !== enteredEmails.length - 1 ? (
                          <span>,</span>
                        ) : null}
                        {email}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <p className={styles.error}>
              {submitError ? "Please add an email" : ""}
            </p>

            <div className={styles.actionBar}>
              <button className={styles.cancel} onClick={handleBack}>
                Cancel
              </button>
              <button className={styles.submit} onClick={submitHandler}>
                {!isSubmitting ? (
                  "Invite"
                ) : (
                  <span className={styles.loader} />
                )}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className={` ${styles.heading} ${styles.headingCenter} `}>Invite Sent!</div>
            <button className={styles.closeBtn} onClick={handleBack}>
              X
            </button>
            <div className={styles.success}>
              <p>Your invite has been sent to:</p>
              <p>
                {enteredEmails.join(", ")}
              </p>
              < br />
              < br />
              <p>
                Invite will expire in 48 hours.
              </p>
            </div>

            <div className={styles.actionBar}>
              <button
                className={styles.cancel}
                onClick={handleBack}
              >
                Cancel
              </button>
              <button
                className={styles.submit}
                onClick={resetHandler}
              >
                <p>Send Another Invite</p>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default InviteComp;
