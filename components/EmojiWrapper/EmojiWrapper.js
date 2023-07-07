import { useContext, useEffect, useState } from "react";
import { MobileContext } from "contexts/mobile";
import OutsideClickHandler from "components/Common/Modals/OutsideClick";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";

export const EmojiWrapper = (props) => {
  const { addEmoji, closeWrapper } = props;

  const [transition, setTransition] = useState(false);
  const { isMobile } = useContext(MobileContext);

  useEffect(() => {
    setTransition(true);
  }, []);

  if (isMobile) {
    return (
      <div>
        <OutsideClickHandler
          onClickOutside={closeWrapper}
          onFocusOutside={closeWrapper}
        >
          <style jsx global>{`
            em-emoji-picker {
              width: 100vw;
              min-width: 250px;
              resize: horizontal;
              overflow: auto;
              left: 0;
              position: fixed;
              z-index: 301;
              bottom: 0;
              border-radius: none;
              transform: translateY(${transition ? "0%" : "100%"});
              transition: transform 0.2s ease-out;
              --border-radius: 0px;
            }
          `}</style>
          <Picker
            data={data}
            className={"attach-emoji"}
            onEmojiSelect={addEmoji}
            dynamicWidth={true}
            emojiButtonColors={[
              "rgba(187, 126, 196, 0.8)",
              "rgb(13, 161, 181, .8)",
              "rgba(240, 101, 115, 0.8)",
              "rgb(0, 163, 150, 0.8)",
            ]}
          />
        </OutsideClickHandler>
      </div>
    );
  }

  return (
    <div>
      <OutsideClickHandler
        onClickOutside={closeWrapper}
        onFocusOutside={closeWrapper}
      >
        <Picker
          data={data}
          className="attach-emoji"
          onEmojiSelect={addEmoji}
          autoFocus={true}
          emojiButtonColors={[
            "rgba(187, 126, 196, 0.8)",
            "rgb(13, 161, 181, .8)",
            "rgba(240, 101, 115, 0.8)",
            "rgb(0, 163, 150, 0.8)",
          ]}
        />
      </OutsideClickHandler>
    </div>
  );
};
