import { useEffect } from "react";

function Completion(props) {

    useEffect(() => {
        window.onload = function () {
            document.onkeydown = function (e) {
                return (e.which || e.keyCode) != 116;
            };
        }
        function preventBack() { window.history.forward(); }
        setTimeout(preventBack(), 0);
        window.onunload = null;
        preventBack();
    })


    return <h1>Thank you! 🎉</h1>;
}

export default Completion;