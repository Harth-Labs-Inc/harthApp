// //import { ThemeProvider } from "@react-navigation/native";
// import { StyleSheet, View } from "react-native";
// import { AppText, Avatar } from "../../../common";
// import theme from "../../../styles/Globalstyles";

// export const TopActionBar = ({ sectionTitle, callChangeName }) => {
//   return (
//     <View style={styles.TopActionBar}>
//       <AppText fontWeight="xbold" style={styles.Title}>
//         {sectionTitle}
//       </AppText>
//       <Avatar isPressable={true} picSize={40} />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   TopActionBar: {
//     display: "flex",
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     height: 56,
//     width: "100%",
//     paddingRight: 16,
//     paddingLeft: 16,
//     borderBottomWidth: 1,
//     backgroundColor: theme.color_oxygen,
//     borderColor: theme.color_fuel_10,
//     hadowColor: "#000",
//     shadowOffset: {width: 2,height: 6,},
//     shadowOpacity: .25,
//     shadowRadius: 6,
//     elevation: 100,
//   },
//   Title: {
//     fontSize: 24,
//     lineHeight: 26,
//   },
// });