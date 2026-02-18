import { ProductCategories } from "../../../../enums/enums";
import BaseProductForm from "./BaseProductForm";
import { useState, useRef } from "react";
import styles from "../AddProduct.module.css";
import { MdModelTraining } from "react-icons/md";

const GadgetsForm = () => {
    const [modelNumber, setModelNumber] = useState("");
    const modelNumberRef = useRef<HTMLDivElement>(null);

    const validate = () => {
        if (!modelNumber) {
            return "Model number for gadgets are mandatory!";
        }
        return null;
    };

    return (
        <BaseProductForm
            category={ProductCategories.GADGETS}
            additionalPayload={{ modelNumber }}
            validate={validate}
        >
            <section>
                <label>Model Number</label>
                <div style={{ display: "flex", gap: 15 }}>
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
