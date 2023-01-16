import { useState } from "react";

export const VolumeSlider = () => {
    const [hasVolumePanel, setHasVolumePanel] = useState(false);

    if (hasVolumePanel) {
        return (
            <div
                className={`
                  ${styles.volumePanel} 
                  ${isVolumeExpanded && styles.volumePanelActive} 
              `}
            >
                <VolumeButton onClick={toggleVolumeExpanded} />
                {isVolumeExpanded && (
                    <>
                        <input
                            type="range"
                            min={0}
                            max={100}
                            defaultValue={50}
                            className={styles.volumeSlider}
                        />
                        <MuteProfileButton
                            onClick={toggleMuted}
                            buttonState={isMuted}
                        />
                    </>
                )}
            </div>
        );
    }

    return null;
};
