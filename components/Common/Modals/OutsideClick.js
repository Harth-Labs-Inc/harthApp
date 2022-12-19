import React from "react";

export default class OutsideClickHandler extends React.Component {
    clickCaptured = false;

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

    innerClick = () => {
        this.clickCaptured = true;
    };

    componentDidMount() {
        document.addEventListener("mousedown", this.documentClick);
        document.addEventListener("touchstart", this.documentClick);
    }

    componentWillUnmount() {
        document.removeEventListener("mousedown", this.documentClick);
        document.removeEventListener("touchstart", this.documentClick);
    }

    documentClick = (event) => {
        if (!this.clickCaptured && this.props.onClickOutside) {
            this.props.onClickOutside(event);
        }
        this.clickCaptured = false;
    };
}

// const OutsideClickHandler = (props) => {
//   let [clickCaptured, setClickCaptured] = useState(false)

//   useEffect(() => {
//     document.addEventListener('mousedown', documentClick)
//     document.addEventListener('touchstart', documentClick)
//     return () => {
//       document.removeEventListener('mousedown', documentClick)
//       document.removeEventListener('touchstart', documentClick)
//     }
//   }, [])

//   const documentClick = (event) => {
//     if (!clickCaptured && props.onClickOutside) {
//       props.onClickOutside(event)
//     }
//     clickCaptured = false
//   }

//   const innerClick = () => {
//     setClickCaptured(true)
//   }

//   const renderComponent = () => {
//     return React.createElement(
//       props.component || 'span',
//       getProps(),
//       props.children,
//     )
//   }

//   const getProps = () => {
//     return {
//       onMouseDown: innerClick,
//       onTouchStart: innerClick,
//     }
//   }

//   if (typeof props.children === 'function') {
//     return props.children(getProps())
//   }

//   return renderComponent()
// }

// export default OutsideClickHandler
