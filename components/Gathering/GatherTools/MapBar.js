import { Dice } from "../Dice/Dice";
import { useState } from "react";
import styles from "./gatherTools.module.scss";
import { IconClose } from "../../../resources/icons/IconClose";
import Draggable from "react-draggable";
import { DraggableCore } from "react-draggable";



export const MapBar = (props) => {
    const {
        type = "desktop",
    } = props;


    return (
        <>

        {type == "desktop"
        ? (
        <Draggable>
        <div className={styles.mainContainer} >
        <div className={styles.topBar} >
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

        <div
            className={styles.diceContainer} 
            aria-label="dice bar"
        >
        <Dice number={4} size="small" ariaLabel="D 4"/>
        <Dice number={6} size="small" ariaLabel="D 6"/>
        <Dice number={8} size="small" ariaLabel="D 8"/>
        <Dice number={10} size="small" ariaLabel="D 10"/>
        <Dice number={12} size="small" ariaLabel="D 12"/>
        <Dice number={20} size="small" ariaLabel="D 20"/>

        </div>
        </div>
        </Draggable>

        ):(

        <div
            className={styles.mobileDiceContainer} 
            aria-label="dice bar"
        >
            <div className={styles.grabber} />

            <div className={styles.diceRow} >
                <Dice number={4} size="large" ariaLabel="D 4"/>
                <Dice number={6} size="large" ariaLabel="D 6"/>
                <Dice number={8} size="large" ariaLabel="D 8"/>
            </div>
            <div className={styles.diceRow} >
                <Dice number={10} size="large" ariaLabel="D 10"/>
                <Dice number={12} size="large" ariaLabel="D 12"/>
                <Dice number={20} size="large" ariaLabel="D 20"/>
            </div>

        </div>

        )}
        </>
    );
};
