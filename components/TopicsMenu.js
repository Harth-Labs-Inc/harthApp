import { useContext } from "react";
import { useComms } from "../contexts/comms";
import { MobileContext } from "../contexts/mobile";

const TopicsMenu = (props) => {
    const { selectedTopic } = useComms();
    const { on_toggle_panel, toggleMobileMenu } = props;
    const { isMobile } = useContext(MobileContext);

    return (
        <header>
            {isMobile ? (
                <button
                    id="topic_menu_back"
                    onClick={toggleMobileMenu}
                ></button>
            ) : null}

            <p id="topic_title">{(selectedTopic || {}).title}</p>
            <span>
                <button id="topic_menu_toggle" onClick={on_toggle_panel}>
                    menu
                </button>
            </span>
        </header>
    );
};

export default TopicsMenu;
