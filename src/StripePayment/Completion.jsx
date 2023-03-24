import { useEffect } from "react";
import { runFireworks } from './utils.jsx';
import { useStateContext } from "../StateContext";
import { BsBagCheckFill } from 'react-icons/bs'
import { useNavigate } from 'react-router-dom';
import './Completion.css';

function Completion() {
    const navigate = useNavigate();
    const { setData, setTotalPrice } = useStateContext();

    useEffect(() => {
        console.log(JSON.parse(localStorage.getItem('oneItem')))
        if (!JSON.parse(localStorage.getItem('oneItem'))) {
            localStorage.removeItem("orders");
            setTotalPrice(0);
            setData([]);
        };
        (function () {
            document.onkeydown = function (e) {
                return (e.which || e.keyCode) !== parseInt(116);
            };
        })();
        function preventBack() { window.history.forward(); }
        setTimeout(preventBack(), 0);
        window.onunload = null;
        preventBack();
        runFireworks();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="success-wrapper">
            <div className="success">
                <p className="icon">
                    <BsBagCheckFill />
                </p>
                <h2>Thank you for your order!</h2>
                <p className="description">
                    If you have any questions, please email
                    <a className="email" href="mailto:cniladri415@gmail.com">
                        cniladri415@gmail.com
                    </a>
                </p>

                <button
                    onClick={() => navigate('/')}
                    type="button" width="300px" className="btn">
                    Continue Shopping
                </button>
            </div>
        </div>
    );
}

export default Completion;