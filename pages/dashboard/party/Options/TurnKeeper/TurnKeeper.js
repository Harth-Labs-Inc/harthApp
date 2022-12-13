import { useEffect, useState } from "react";
import { Toggle } from "../../../../../components/Common";

import styles from "./TurnKeeper.module.scss";

const TurnKeeper = ({
    peers = [],
    turnCallHandler,
    openTurnKeeper,
    turnKeeperToggleHandler,
}) => {
    const [sortedPeers, setSortedPeers] = useState([]);

    const turnKeeperHandler = (name, value) => {
        if (value) {
            let data = sortedPeers;
            data.forEach((peer, index) => {
                if (index === 0) {
                    peer.activeTurnUser = true;
                } else {
                    peer.activeTurnUser = false;
                }
            });

            turnCallHandler(data);
        } else {
            turnKeeperToggleHandler();
        }
    };
    const changeOrder = (path, index, data) => {
        let mergedArr;
        if (path === "up") {
            let arr = sortedPeers.filter((peer) => peer?.name !== data?.name);
            mergedArr = [...arr];
            mergedArr.splice(index - 1, 0, data);
        }
        if (path === "down") {
            let arr = sortedPeers.filter((peer) => peer?.name !== data?.name);
            mergedArr = [...arr];
            mergedArr.splice(index + 1, 0, data);
        }
        if (openTurnKeeper) {
            turnCallHandler(mergedArr);
        } else {
            setSortedPeers(mergedArr);
        }
    };

    useEffect(() => {
        setSortedPeers(peers);
    }, [peers]);

    useEffect(() => {
        if (openTurnKeeper) {
            setSortedPeers(openTurnKeeper);
        }
    }, [openTurnKeeper]);

    return (
        <div className={styles.TurnKeeper}>
            <div className={styles.TurnKeeperHeader}>
                Turnkeeper
                <Toggle
                    onToggleChange={turnKeeperHandler}
                    toggleName="turn keeper"
                    isChecked={openTurnKeeper}
                ></Toggle>
            </div>
            <section className={styles.TurnKeeperList}>
                {sortedPeers.map((data, index) => {
                    return (
                        <div
                            className={styles.TurnKeeperListPeer}
                            key={data.name}
                        >
                            <span>
                                {index + 1}. {data.name}
                            </span>
                            <div>
                                <button
                                    className={styles.TurnKeeperListUp}
                                    onClick={() =>
                                        changeOrder("up", index, data)
                                    }
                                    disabled={index === 0 ? true : false}
                                >
                                    move up
                                </button>
                                <button
                                    className={styles.TurnKeeperListDown}
                                    onClick={() =>
                                        changeOrder("down", index, data)
                                    }
                                    disabled={
                                        index + 1 === sortedPeers.length
                                            ? true
                                            : false
                                    }
                                >
                                    move down
                                </button>
                            </div>
                        </div>
                    );
                })}
            </section>
        </div>
    );
};

export default TurnKeeper;
