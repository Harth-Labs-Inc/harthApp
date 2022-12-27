// import { StyleSheet, View } from "react-native";
import { Avatar, Button } from "../../Common";
// import { EditGathering } from "../Buttons/EditGathering";
// import { useNavigation } from "@react-navigation/native";
// import theme from "../../../../styles/Globalstyles";

//import typestyle from "../../../../common/Type/Headings/AppText2";

// import { Workspace, Stream, Voice, HeadsetMic } from "../../../../icons";
// import { AppText, PrimaryButton } from "../../../../common";

import { IconHeadsetMic } from "../../../resources/icons/IconHeadsetMic";
import { IconCastNoFill } from "../../../resources/icons/IconCastNoFill";
import { IconWorkspace } from "../../../resources/icons/IconWorkspace";

import styles from "./GatheringTile.module.scss";

export const GatheringTile = (props) => {
    const {
        type = "voice",
        name = "Brian's Party is a really good party as there is a lot of stuff",
        time = "10:30",
        date = "Mar 29",
        room,
        description = "this is going to be the best gathering because it just will be. blah blah blah...",
    } = props;
    const ampm = "pm";
    // const navigation = useNavigation();

    //not sure how timestamp shows up but probably need to process it somehow

    const Icon = () => {
        if (type === "voice") {
            return <IconHeadsetMic fill="#0DA1B5" />;
        }
        if (type === "stream") {
            return <IconCastNoFill fill="#F06573" />;
        }
        if (type === "party") {
            return <IconWorkspace fill="#BB7EC4" />;
        }
    };

    const handleJoinRoom = () => {
        console.log("navigate");
        // navigation.push("Gather", {
        //   room,
        // });
    };

    //temp function to test buttons
    const pressing = () => {
        console.log("pressed");
    };

    return (
        <div className={styles.GatheringTile}>
            <div className={styles.GatheringTileLabel}>
                <div className={styles.GatheringTileLabelIcon}>
                    <Icon />
                </div>
                {/* <AppText
          fontWeight="xbold"
          className={[styles.GatheringLabelText, styles[`GatheringLabel_${type}`]]}
        >
          {type}
        </AppText> */}
            </div>

            <div className={styles.GatheringTileInfo}>
                <p className={styles.GatheringTileName}>{name}</p>

                <div className={styles.GatheringTileInfoStructure}>
                    <div className={styles.GatheringTileScheduled}>
                        <div>
                            <p className={styles.GatheringTileScheduledTime}>
                                {time}
                            </p>
                            <p className={styles.GatheringTileScheduledAMPM}>
                                {ampm}
                            </p>
                        </div>
                        <p className={styles.GatheringTileScheduledDate}>
                            {date}
                        </p>
                    </div>
                    <div className={styles.GatheringTilePeopleDescription}>
                        <div className={styles.GatheringTileAttendeeWrapper}>
                            {/* <View zIndex={0}>
                                <Avatar
                                    isPressable={false}
                                    picSize={44}
                                    className={styles.AttendeeSelf}
                                />
                            </View>
                            <View zIndex={-1}>
                                <Avatar
                                    isPressable={false}
                                    picSize={44}
                                    className={styles.AttendeePresent}
                                />
                            </View>
                            <View zIndex={-2}>
                                <Avatar
                                    isPressable={false}
                                    picSize={44}
                                    className={styles.AttendeePresent}
                                />
                            </View>
                            <Avatar
                                isPressable={false}
                                picSize={44}
                                className={styles.AttendeePresent}
                            />
                            <Avatar
                                isPressable={false}
                                picSize={44}
                                className={styles.AttendeeAbsent}
                            />
                            <Avatar
                                isPressable={false}
                                picSize={44}
                                className={styles.AttendeeAbsent}
                            /> */}
                        </div>
                        <p className={styles.GatheringTileDescription}>
                            {description}
                        </p>
                    </div>
                </div>
                <div
                    className={styles.actionBar}
                    flexDirection="row"
                    justifyContent="flex-end"
                >
                    {/* <EditGathering onPress={pressing}/> */}
                    <Button
                        text="Join"
                        onPress={handleJoinRoom}
                        className={styles.GatheringTileActionButton}
                    />
                </div>
            </div>
        </div>
    );
};

// StyleSheet.create({
//   GatheringTile: {
//     // flexDirection: "row",
//     width: "100%",
//     minHeight: 240,
//     borderRadius: 18,
//     overflow: "hidden",
//     backgroundColor: theme.color_white,
//   },

//   //Gathering Label
//   GatheringLabel: {
//     flexDirection: "column",

//     justifyContent: "flex-start",
//     //alignItems: "flex-start",
//     width: 64,
//     //height: "100%",
//     backgroundColor: theme.color_fuel,
//   },
//   GatheringLabelIcon: {
//   transform: [{ rotate: "90deg" }, { translateX: 24 }, { translateY: 0 }],
//   },
//   GatheringLabelText: {
//     width: 180,
//     fontSize: 48,
//     //lineHeight: 48,
//     textTransform: "capitalize",
//     transform: [{ rotate: "90deg" }, { translateX: 88 }, { translateY: 58 }],
//   },
//   GatheringLabel_party: {
//     color: theme.color_purple,
//   },
//   GatheringLabel_stream: {
//     color: theme.color_red,
//   },
//   GatheringLabel_voice: {
//     color: theme.color_blue,
//   },

//   // Gathering Info
//   GatheringInfo: {
//     flexDirection: "column",
//     flexShrink: 1,
//     paddingTop: 16,
//     paddingHorizontal: 16,
//   },
//   GatheringName: {
//     fontSize: 24,
//     lineHeight: 26,
//     flexGrow: 1,
//     paddingBottom: 12,
//   },

//   InfoStructure: {
//     flexDirection: "row",
//   },

//   //LeftSide
//   DateTime: {
//     flexDirection: "column",
//     width: 84,
//     paddingRight: 8,
//     paddingTop: 8,
//     paddingBottom: 8,
//     //alignContent: "center",
//   },
//   GatheringTime: {
//     fontSize: 20,
//     lineHeight: 22,
//     textAlign: "center",
//   },
//   GatheringTimeAMPM: {
//     fontSize: 12,
//     lineHeight: 22,
//     textAlign: "center",
//   },
//   GatheringDate: {
//     fontSize: 14,
//     lineHeight: 20,
//     textAlign: "center",

//   },

//   //RightSide
//   PeopleDescription: {
//     flexDirection: "column",
//     flexShrink: 1,
//     paddingLeft: 8,
//     paddingTop: 8,
//     paddingBottom: 8,
//     borderLeftWidth: 1,
//     borderColor: theme.color_fuel,
//   },
//   AttendeeHolder: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     paddingBottom: 8,
//     //flexDirection: "row-reverse",
//   },
//   AttendeePresent: {
//     marginBottom: 1,
//     marginRight: 1,
//     marginRight: -6,
//     //opacity: .5,
//   },
//   AttendeeAbsent: {
//     marginBottom: 1,
//     marginRight: 1,
//     marginRight: -6,
//     opacity: .5,
//   },
//   AttendeeSelf: {
//     borderColor: theme.color_pink,
//     borderWidth: 3,
//     marginBottom: 1,
//     marginRight: -6,

//   },
//   AttendeeSelfAbsent: {
//     borderColor: theme.color_pink,
//     borderWidth: 3,
//     marginBottom: 1,
//     marginRight: -6,
//     opacity: .5,

//   },
//   GatheringDescription: {
//     fontSize: 12,
//     lineHeight: 16,

//   },

//   actionBar: {
//     paddingTop: 8,
//     paddingBottom: 16,
//   },
//   ActionButton: {
//     width: 108,
//   },
// });
