import { ProductCategories } from "../../../../enums/enums";
import BaseProductForm from "./BaseProductForm";
import { useState, useRef, useEffect } from "react";
import styles from "../AddProduct.module.css";
import { MdModelTraining } from "react-icons/md";

const GadgetsForm = () => {
    const [modelNumber, setModelNumber] = useState("");
    const [checked, setChecked] = useState(false);
    const modelNumberRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (checked && modelNumberRef.current) {
            modelNumberRef.current.style.border = "1px solid red";
            modelNumberRef.current.style.boxShadow = "0 0 8px -5px red";
        } else if (modelNumberRef.current) {
            modelNumberRef.current.style.border = "none";
            modelNumberRef.current.style.boxShadow = "0 0 0 0 transparent";
        }
    }, [checked]);

    const validate = () => {
        if (checked && !modelNumber) {
            return "Model number for gadgets are mandatory!";
        }
        return null;
    };

    return (
        <BaseProductForm
            category={ProductCategories.GADGETS}
            additionalPayload={checked ? { modelNumber } : {}}
            validate={validate}
        >
            <section>
                <label>Model Number</label>
                <div style={{ display: "flex", gap: 15 }}>
                    <div
                        data-section={"isGadget"}
                        style={{ backgroundColor: "rgba(255, 255, 255, 0.963)" }}
                        className={styles["input-containers"]}
                    >
                        <input
                            onChange={(e) => {
                                setChecked(e.target.checked);
                            }}
                            name={"is-gadget"}
                            type="checkbox"
                        />
                        <label>Gadget</label>
                    </div>
                    <div
                        ref={modelNumberRef}
                        data-section={"modelNumber"}
                        style={{ backgroundColor: "rgba(255, 255, 255, 0.963)" }}
                        className={styles["input-containers"]}
                    >
                        <MdModelTraining />
                        <input
                            value={modelNumber}
                            onChange={(e) => {
                                setModelNumber(e.target.value);
                            }}
                            name={"model-number"}
                            placeholder={"model number"}
                            type="text"
                        />
                    </div>
                </div>
            </section>
        </BaseProductForm>
    );
};

export default GadgetsForm;
