import { useContext, useEffect, useRef, useState } from "react";

import { MobileContext } from "../../../contexts/mobile";
import { useAuth } from "../../../contexts/auth";
import { IconAdd } from "../../../resources/icons/IconAdd";
import { IconFireFill } from "../../../resources/icons/IconFireFill";
import { Modal } from "../../Common/Modals/Modal";
import HarthSettings from "../../Menus/HarthSettings/HarthSettings";
import { IconHome } from "resources/icons/IconHome";

import styles from "./HarthList.module.scss";
import {
  fetchImage,
  getAttachment,
  openDB,
  saveAttachment,
} from "services/helper";
import { getDownloadURL } from "requests/s3";

const HarthList = ({
  comms,
  selectedcomm,
  unreadMsgs,
  unreadConvMsgs,
  toggleCreateComm,
  changeSelectedCom,
  toggleHarthEditModal,
}) => {
  const { isMobile } = useContext(MobileContext);
  const { user } = useAuth();
  const [modal, setModal] = useState(false);
  const [cachedIcons, setCachedIcons] = useState({});

  const activeItemRef = useRef(null);

  useEffect(() => {
    if (activeItemRef.current) {
      activeItemRef.current.scrollIntoView({
        behavior: "auto",
        block: "nearest",
      });
    }
  }, [selectedcomm?._id]);

  useEffect(() => {
    const dbName = "CommunityIcons";
    const storeName = "icons";

    const extractFileNameFromUrl = (url) => {
      const s3BucketUrl =
        "https://community-profile-images.s3.us-east-2.amazonaws.com/";

      if (url.startsWith(s3BucketUrl)) {
        return url.substring(s3BucketUrl.length);
      }

      const lastSlashIndex = url.lastIndexOf("/");
      if (lastSlashIndex !== -1) {
        return url.substring(lastSlashIndex + 1);
      }

      return null;
    };

    comms.forEach(async (comm) => {
      if (comm.iconKey) {
        const keyName = extractFileNameFromUrl(comm.iconKey);
        const db = await openDB(dbName, storeName);
        const cachedIcon = await getAttachment(db, storeName, keyName).catch(
          () => null
        );
        if (cachedIcon && cachedIcon.data) {
          setCachedIcons((prev) => ({
            ...prev,
            [comm._id]: URL.createObjectURL(cachedIcon.data),
          }));
        } else {
          if (
            comm.iconKey.startsWith(
              "https://community-profile-images.s3.us-east-2.amazonaws.com/"
            )
          ) {
            try {
              const fileType = keyName.split(".").pop() || "jpg";
              const fetchedData = await getDownloadURL(
                keyName,
                fileType,
                "community-profile-images"
              );
              if (fetchedData && fetchedData.ok) {
                const imageBlob = await fetchImage(fetchedData.downloadURL);
                try {
                  saveAttachment(db, storeName, keyName, imageBlob);
                  setCachedIcons((prev) => ({
                    ...prev,
                    [comm._id]: URL.createObjectURL(imageBlob),
                  }));
                } catch (error) {
                  console.log("Failed to save attachment:", error);
                }
              }
            } catch (error) {
              console.log("Failed to fetch or save image:", error);
            }
          } else {
            setCachedIcons((prev) => ({
              ...prev,
              [comm._id]: comm.iconKey,
            }));
          }
        }
      }
    });
  }, [comms]);

  const toggleEditMenu = (evt, id, harth) => {
    if (evt.button === 2) {
      const targetElement = document.getElementById(id);
      if (targetElement && targetElement.contains(evt.target)) {
        evt.preventDefault();
        toggleHarthEditModal({
          harth,
          pos: {
            x: evt.clientX,
            y: evt.clientY,
          },
        });
      }
    }
  };

  const handleHarthMenu = () => {
    setModal((prevState) => !prevState);
  };

  const showModal = () => {
    setModal((prevState) => !prevState);
  };

  return (
    <ul
      className={isMobile ? styles.HarthListMobile : styles.HarthList}
      id="left_nav_comms"
    >
      {comms &&
        comms.map((com) => {
          let active = false;
          let newMessage = false;
          if (selectedcomm && com._id === selectedcomm._id) {
            active = true;
          } else {
            let owner = com?.users.find((usr) => usr?.userId === user._id);
            unreadMsgs.forEach((msg) => {
              if (
                msg.comm_id === com._id &&
                msg.creator_id !== user._id &&
                owner &&
                !owner.muted
              ) {
                newMessage = true;
              }
            });

            unreadConvMsgs.forEach((msg) => {
              if (
                msg.comm_id === com._id &&
                msg.creator_id !== user._id &&
                owner &&
                !owner.muted
              ) {
                newMessage = true;
              }
            });
          }

          return (
            <div
              className={`
            ${styles.Item}
            ${active ? styles.ItemActive : null}
            ${newMessage && !active ? styles.ItemUnreadMessage : null}
          `}
              key={com?._id}
              id={com._id}
              ref={active ? activeItemRef : null}
            >
              <li>
                <button
                  onClick={() => {
                    let imgs = document.getElementsByClassName("active-image");

                    for (let img of imgs) {
                      if (img) {
                        img.setAttribute("src", "");
                      }
                    }
                    changeSelectedCom(com);
                  }}
                  onMouseUp={(e) => toggleEditMenu(e, com._id, com)}
                  aria-label={com.name}
                  className={styles.ItemButton}
                >
                  {com.iconKey ? (
                    <span className={styles.ItemImage}>
                      <img
                        src={cachedIcons[com._id] || com.iconKey}
                        loading="eager"
                        height={40}
                        width={40}
                      />
                    </span>
                  ) : (
                    <span className={styles.ItemIcon}>
                      <span className={styles.ItemIconFiller}>
                        <IconFireFill />
                      </span>
                    </span>
                  )}
                  {isMobile ? (
                    <span className={styles.ItemName}>{com.name}</span>
                  ) : null}
                </button>
                {isMobile && selectedcomm._id == com?._id ? (
                  <button
                    className={styles.ItemSettingsButton}
                    onClick={handleHarthMenu}
                    aria-label="Current Harth Settings"
                  >
                    <IconHome />
                  </button>
                ) : null}
              </li>
            </div>
          );
        })}
      {modal ? (
        <Modal fullHeight={isMobile ? true : false} onToggleModal={() => {}}>
          <HarthSettings
            communityName={selectedcomm?.name}
            communityId={selectedcomm?._id}
            onToggleModal={showModal}
            fullHeight={isMobile ? true : false}
          />
        </Modal>
      ) : (
        ""
      )}
      <li className={styles.NewHarth}>
        <button onClick={toggleCreateComm}>
          <IconAdd />
        </button>
      </li>
    </ul>
  );
};

export default HarthList;
