import { Dice } from "../Dice/Dice";
import { useState } from "react";
import styles from "./gatherTools.module.scss";
import { IconClose } from "../../../resources/icons/IconClose";
import Draggable from "react-draggable";
import { Button } from "../../Common";
import { IconMap } from "../../../resources/icons/IconMap";
import ReactPanZoom from "react-image-pan-zoom-rotate";
import { LeaveButtonMobile } from "../Controls/LeaveButtonMobile";


export const MapBar = (props) => {
    const {
        type = "desktop",
    } = props;

    const [hasMap, setHasMap] = useState(false);
    const [mapImg, setMapImg] = useState();
    const [hasBottomBar, setHasBottomBar] = useState();

    
    const addMap = () => {
        //no logic here yet. 
        setMapImg("https://i.pinimg.com/originals/9a/d3/df/9ad3df0f61b83d0bfe3e5221430a6df4.jpg");

        setHasMap(true);
        
    };

    const clearMap = () => {
        //no logic here yet. 
        setMapImg("");
        
        setHasMap(false);
        
    };

    const showBottomBar =() => {
        setHasBottomBar(true);

    }
    
    const hideBottomBar =() => {
        setHasBottomBar(false);

    }


    return (
        <>

        {type == "desktop"
        ? (

        <Draggable handle="#handle">
        <div className={styles.mainContainer} >

            <div className={styles.topBar} id="handle">
                <div className={styles.spacer} />
                <div className={styles.grabber} />
                <button
                    className={styles.close}
                    ariaLabel="close dice bar"
                    //onClick={} //need a close function
                >
                    <IconClose />
                </button>
            </div>

            {!hasMap 
            ? (
                <div className={styles.mapContainer}>
                    <div className={styles.icon}><IconMap /></div>
                    <div className={styles.label} >Game Board</div>
                    <Button
                        tier="primary"
                        size="small"
                        text="add an image"
                        onClick={addMap}
                    />
                </div>

            ):(
                <div className={`
                ${styles.mapContainer} 
                ${styles.mapContainerActive} 
                `} 
                onMouseOver = {showBottomBar}
                onMouseLeave = {hideBottomBar}
                >
                    <ReactPanZoom
                        image={mapImg}
                        alt='Image alt text'
                    />
                    {hasBottomBar 
                    && (
                        <div className={styles.bottomBar}> 
                            <Button
                            tier="secondary"
                            size="small"
                            text="clear image"
                            onClick={clearMap}
                            />
                        </div>

                    )}
                    
                </div>
            )}
        </div>
        </Draggable>

        ):(

            
        <div
            className={styles.mobileMapContainer} 
            aria-label="dice bar"
        >
            {!hasMap 
            ? (
                <>
                <div className={styles.grabber} />

                <div className={styles.icon}><IconMap /></div>
                <div className={styles.label} >Game Board</div>
                <Button
                    tier="primary"
                    size="small"
                    text="add an image"
                    onClick={addMap}
                />
                </>
            ):(
                <>
                <div className={styles.closeBar} >
                <LeaveButtonMobile />
                </div>

                
                <div className={styles.mobileMapContainerActive} >
                    <ReactPanZoom
                        image={mapImg}
                        alt='Image alt text'
                    />
                        <div className={styles.bottomBar}> 
                            <Button
                            tier="primary"
                            size="small"
                            text="clear image"
                            onClick={clearMap}
                            />
                        </div>
                    
                </div>
                </>
            )}

        </div>

        )}
        </>
    );
};
