const reducer = (state, action) => {
  switch (action.type) {
    case "SET_MOBILE":
      return {
        ...state,
        screenSize: "isMobile",
      };
    case "SET_DESKTOP":
      return {
        ...state,
        screenSize: "isDesktop"
      }
  }
};

export default reducer