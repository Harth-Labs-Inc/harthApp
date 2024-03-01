import { useEffect, useState } from "react";

import styles from "./UserIcon.module.scss";
import { useComms } from "contexts/comms";
import { useAuth } from "contexts/auth";

import { fetchImage, getAttachment, saveAttachment } from "services/helper";
import { getDownloadURL } from "requests/s3";

const UserIcon = ({
  img,
  name,
  showName = true,
  size = "regular",
  iconClass = "",
  isPressable = false,
  pressHandler,
  shouldIgnoreUserId,
}) => {
  const [dimensions, setDimensions] = useState({ height: 48, width: 48 });
  const [imageUrl, setImageUrl] = useState();

  const { user } = useAuth();

  const {
    selectedcomm,
    indexAvatarController,
    imageCacheRef,
    imageCheckCacheRef,
  } = useComms();

  useEffect(() => {
    if (size === "small") {
      setDimensions({ height: 36, width: 36 });
    } else {
      setDimensions({ height: 40, width: 40 });
    }
  }, [size]);

  useEffect(() => {
    const storeName = "avatar";

    const loadImageAndCheck = (img) => {
      return new Promise((resolve) => {
        const tempImage = new Image();
        tempImage.onload = () => resolve(true);
        tempImage.onerror = () => resolve(false);
        tempImage.src = img;
      });
    };

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

    const checkAndFetchImage = async () => {
      if (img && indexAvatarController) {
        const keyName = extractFileNameFromUrl(img);
        if (imageCacheRef[keyName]) {
          let isGood;
          if (!imageCheckCacheRef[keyName]) {
            isGood = await loadImageAndCheck(imageCacheRef[keyName]);
          } else {
            isGood = true;
          }

          if (isGood) {
            imageCheckCacheRef[keyName] = true;
            setImageUrl(imageCacheRef[keyName]);
            return;
          }
        }

        const cachedData = await getAttachment(
          indexAvatarController,
          storeName,
          keyName
        ).catch(() => null);

        if (cachedData && cachedData.data) {
          const url = URL.createObjectURL(cachedData.data);
          let isGood;
          if (!imageCheckCacheRef[keyName]) {
            isGood = await loadImageAndCheck(url);
          } else {
            isGood = true;
          }

          if (isGood) {
            imageCheckCacheRef[keyName] = true;
            imageCacheRef[keyName] = url;
            setImageUrl(url);
          }
        } else {
          if (
            img.startsWith(
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
                  saveAttachment(
                    indexAvatarController,
                    storeName,
                    keyName,
                    imageBlob
                  );
                  const url = URL.createObjectURL(imageBlob);
                  let isGood;
                  if (!imageCheckCacheRef[keyName]) {
                    isGood = await loadImageAndCheck(url);
                  } else {
                    isGood = true;
                  }
                  if (isGood) {
                    imageCheckCacheRef[keyName] = true;
                    imageCacheRef[keyName] = url;
                    setImageUrl(url);
                  }
                } catch (error) {
                  console.log("Failed to save attachment:", error);
                }
              }
            } catch (error) {
              console.log("Failed to fetch or save image:", error);
            }
          } else {
            let isGood = await loadImageAndCheck(img);
            if (isGood) {
              setImageUrl(img);
            }
          }
        }
      }
    };

    checkAndFetchImage();
  }, [img, indexAvatarController, imageCacheRef]);

  return (
    <>
      {isPressable ? (
        <button
          onClick={pressHandler}
          className={styles.userIconButton}
          aria-label="profile settings"
        >
          <span
            className={`iconWrapper ${styles.userIconWrapper} ${
              size === "small" ? styles.userIconSmall : styles.userIconRegular
            }`}
          >
            <img
              className={`${styles.userIconImage} ${iconClass} ${
                !shouldIgnoreUserId ? `${selectedcomm?._id}_${user?._id}` : ""
              } `}
              src={
                imageUrl ? imageUrl : img ? img : "/images/profile_default.png"
              }
              alt="profile image"
              loading="eager"
              height={dimensions.height}
              width={dimensions.width}
            />
            {showName ? (
              <span className={styles.userIconName}>{name}</span>
            ) : null}
          </span>
        </button>
      ) : (
        <span
          className={`${styles.userIconWrapper} ${
            size === "small" ? styles.userIconSmall : styles.userIconRegular
          }`}
        >
          <img
            className={`${styles.userIconImage} ${iconClass} ${
              !shouldIgnoreUserId ? `${selectedcomm?._id}_${user?._id}` : ""
            }`}
            src={
              imageUrl ? imageUrl : img ? img : "/images/profile_default.png"
            }
            alt="profile image"
            loading="eager"
            height={dimensions.height}
            width={dimensions.width}
          />
          {showName ? (
            <span className={styles.userIconName}>{name}</span>
          ) : null}
        </span>
      )}
    </>
  );
};

export default UserIcon;
