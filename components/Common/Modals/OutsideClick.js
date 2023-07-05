import React from "react";

export default class OutsideClickHandler extends React.Component {
  clickCaptured = false;
  previousViewportHeight = window.visualViewport.height; // Store the previous viewport height
  hasResizedSinceClick = false; // Flag to track if resizing has occurred

  render() {
    if (typeof this.props.children === "function") {
      return this.props.children(this.getProps());
    }

    return this.renderComponent();
  }

  renderComponent() {
    return React.createElement(
      this.props.component || "span",
      { ...this.getProps(), className: this.props.className },
      this.props.children
    );
  }

  getProps() {
    return {
      onMouseDown: this.innerClick,
      onTouchStart: this.innerClick,
    };
  }

  innerClick = (event) => {
    this.clickCaptured = true;
    event.stopPropagation(); // Stop event propagation
  };

  componentDidMount() {
    document.addEventListener("mousedown", this.documentClick);
    document.addEventListener("touchstart", this.documentClick);
    window.visualViewport.addEventListener("resize", this.handleViewportResize);
  }

  componentWillUnmount() {
    document.removeEventListener("mousedown", this.documentClick);
    document.removeEventListener("touchstart", this.documentClick);
    window.visualViewport.removeEventListener(
      "resize",
      this.handleViewportResize
    );
  }

  documentClick = (event) => {
    if (
      !this.hasResizedSinceClick &&
      !this.clickCaptured &&
      this.props.onClickOutside
    ) {
      this.props.onClickOutside(event);
    }
    this.clickCaptured = false;
    setTimeout(() => {
      this.hasResizedSinceClick = false;
    }, 100);
  };

  handleViewportResize = () => {
    this.hasResizedSinceClick = true;
    this.previousViewportHeight = window.visualViewport.height;
  };
}
