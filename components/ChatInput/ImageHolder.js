import { IconClose } from "../../resources/icons/IconClose";

import styles from "./ChatInput.module.scss";

const ImageHolder = ({ attachments, removeAttachment, attRefs }) => {
  if (attachments.length > 0) {
    return (
      <div className={styles.imageBar}>
        {(attachments || []).map((file, idx) => (
          <div className={styles.imageContainer}>
            <button
              onClick={() => {
                removeAttachment(idx);
              }}
            >
              <IconClose />
            </button>
            <img
              id={file.name}
              key={file.name}
              ref={(el) => (attRefs.current[idx] = el)}
              alt=""
              loading="lazy"
            />
          </div>
        ))}
      </div>
    );
  }

  return null;
};

export default ImageHolder;
