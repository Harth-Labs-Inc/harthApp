import { IconClose } from "../../resources/icons/IconClose";

import styles from "./ChatInput.module.scss";

const ImageHolder = ({
  attachments,
  removeAttachment,
  attRefs,
  uploading,
  isDark,
}) => {
  if (attachments.length > 0) {
    return (
      <div
        className={` ${styles.imageBar} ${
          isDark ? styles.imageBarDark : null
        } `}
      >
        {(attachments || []).map((file, idx) => (
          <div
            className={`${styles.imageContainer} ${
              file?.name &&
              uploading?.includes(file.name) &&
              styles.imageUploading
            }`}
            key={file?.name}
          >
            <button
              onClick={() => {
                removeAttachment(idx);
              }}
            >
              <IconClose />
            </button>
            {file?.type.includes("video") ? (
              <video
                className={styles.video}
                ref={(el) => (attRefs.current[idx] = el)}
                type={file?.type}
              ></video>
            ) : (
              <img
                id={file?.name}
                key={file?.name}
                ref={(el) => (attRefs.current[idx] = el)}
                alt=""
                loading="lazy"
              />
            )}
          </div>
        ))}
      </div>
    );
  }

  return null;
};

export default ImageHolder;
