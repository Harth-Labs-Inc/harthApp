import { useContext, useEffect, useState } from "react";
import { MobileContext } from "contexts/mobile";
import OutsideClickHandler from "components/Common/Modals/OutsideClick";
import { getCustomEmojis } from "../../requests/chat";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { useComms } from "contexts/comms";
/* eslint-disable */
export const EmojiWrapper = (props) => {
  const { addEmoji, closeWrapper, showCustom } = props;
  const [emojiData, setEmojiData] = useState([]);
  const [transition, setTransition] = useState(false);
  const { isMobile } = useContext(MobileContext);

  const { selectedcomm } = useComms();

  useEffect(() => {
    setTransition(true);
  }, []);

  useEffect(() => {
    if (selectedcomm?._id && showCustom) {
      fetchEmojis(selectedcomm?._id);
    }
  }, [selectedcomm?._id, showCustom]);

  function extractIdFromUrl(url) {
    let shortenedURL = url.split("/").pop().split(".")[0];
    if (shortenedURL) {
      return shortenedURL.split("-")[1];
    }
    return url;
  }
  const fetchEmojis = async (harthId) => {
    try {
      const { ok, urls } = await getCustomEmojis({ harthId });
      if (ok) {
        const customEmojis = urls.map((url) => {
          return {
            id: "custom_" + extractIdFromUrl(url),
            name: extractIdFromUrl(url),
            keywords: ["custom"],
            skins: [{ src: url }],
          };
        });

        const mergedData = [
          {
            id: "custom",
            name: "Custom",
            emojis: customEmojis,
          },
        ];
        setEmojiData(mergedData);
      }
    } catch (error) {
      console.error("Error fetching custom emojis:", error);
    }
  };

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
            custom={emojiData}
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
        <style jsx global>{`
          em-emoji-picker {
            z-index: 301;
          }
        `}</style>
        <Picker
          data={data}
          custom={emojiData}
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
