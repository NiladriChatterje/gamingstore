import { FormEvent, useState, KeyboardEvent, useRef, ReactNode } from "react";
import styles from "../AddProduct.module.css";
import { IoIosArrowDropdownCircle, IoIosPersonAdd, IoIosAddCircle } from "react-icons/io";
import { AiFillCloseCircle, AiFillProduct } from "react-icons/ai";
import {
    MdConfirmationNumber,
    MdDelete,
    MdDeleteSweep,
    MdOutlineProductionQuantityLimits
} from "react-icons/md";
import toast from "react-hot-toast";
import { FaPercentage, FaRupeeSign } from "react-icons/fa";
import { ImUpload } from "react-icons/im";
import { EanUpcIsbnType, currency } from "../../../../enums/enums";
import { ProductType } from "../../../../declarations/ProductContextType";
import { useAdminStateContext } from "../../AdminStateContext";
import { v7 as uuid7 } from "uuid";
import { AdminFieldsType } from "../../../../declarations/AdminType";
import { useAuth } from "@clerk/clerk-react";

const keywordsSet = new Set<string>();

interface BaseProductFormProps {
    category: string;
    additionalPayload?: Record<string, any>;
    children?: ReactNode;
    validate?: () => string | null;
}

const BaseProductForm = ({ category, additionalPayload = {}, children, validate }: BaseProductFormProps) => {
    const [eanUpc, setEacUpc] = useState<string>(() => "");
    const [productName, setProductName] = useState<string>(() => "");
    const [productDescription, setProductDescription] = useState<string>(
        () => ""
    );
    const [images, setImages] = useState<File[]>(() => []);
    const [quantity, setQuantity] = useState<number>(0);
    const [eanUpcType, setEacUpcType] = useState<EanUpcIsbnType>(
        () => EanUpcIsbnType.EAN
    );
    const [price, setPrice] = useState<number>(() => 0);
    const [discount, setDiscount] = useState<number>(() => 0);
    const [variationList, setVariationList] = useState<{ key: string; value: string }[]>(
        () => [{ key: "", value: "" }]
    );
    const [keyword, setKeyword] = useState<string>(() => "");
    const [imageToUrlPreviewMap, _] = useState<Map<Blob, string>>(
        () => new Map<Blob, string>()
    );
    const [keywordArray, setKeywordArray] = useState<string[]>(() => []);
    const [toggleEacUpcType, setToggleEacUpcType] = useState<boolean>(
        () => false
    );

    const [blobUrlForPreview, setBlobUrlForPreview] = useState<string[]>(
        () => []
    );

    const keywordsRef = useRef<HTMLDivElement>(null);
    const ImageInputRef = useRef<HTMLInputElement>(null);
    const imageCarouselContainerRef = useRef<HTMLDivElement>(null);

    const { getToken } = useAuth();
    const { admin }: { admin?: AdminFieldsType } = useAdminStateContext();

    async function handleSubmitPdt(e: FormEvent) {
        e.preventDefault();
        if (!eanUpc || !quantity || !price || !keywordArray.length) {
            toast("Please fill necessary fields!");
            return;
        }

        if (validate) {
            const error = validate();
            if (error) {
                toast(error);
                return;
            }
        }

        const base64Images: { size: number; extension: string; base64: string }[] =
            [] as { size: number; extension: string; base64: string }[];

        for (let image of images) {
            const fileReader = new FileReader();
            fileReader.addEventListener("loadend", async () => {
                if (fileReader.result)
                    base64Images.push({
                        size: image.size,
                        extension: image.type.split("/")[1],
                        base64: fileReader.result as string,
                    });

                if (base64Images.length === images.length) {
                    const formData: ProductType = {
                        productName: productName,
                        category,
                        eanUpcIsbnGtinAsinType: eanUpcType,
                        eanUpcNumber: eanUpc,
                        quantity,
                        pincode: admin?.address.pincode ?? '700135',
                        currency: currency.INR,
                        price: {
                            pdtPrice: price,
                            discountPercentage: discount,
                            currency: 'INR'
                        },
                        keywords: keywordArray,
                        imagesBase64: [...base64Images],
                        seller: admin?._id,
                        productDescription: productDescription,
                        variations: variationList.filter(v => v.key || v.value),
                        _id: `product_${uuid7()}`,
                        ...additionalPayload
                    };

                    const token = await getToken();
                    const response = await fetch("http://localhost:5002/add-product", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                            "x-admin-id": admin?._id ?? ''
                        },
                        body: JSON.stringify(formData),
                    });

                    if (response?.ok) {
                        toast.success("Product added successfully!");
                        setProductName("");
                        setPrice(0);
                        setQuantity(0);
                        setEacUpc("");
                        setImages([] as File[]);
                        setBlobUrlForPreview([] as string[]);
                        setKeywordArray([] as string[]);
                        setVariationList([{ key: "", value: "" }]);
                        keywordsSet.clear();
                    }
                }
            });
            fileReader.readAsDataURL(image);
        }
    }

    function fillKeywordsArray(e: KeyboardEvent) {
        if (e.key === "Tab") {
            e.preventDefault();
            if (keywordArray.length > 30) {
                toast.error("limit reached");
                return;
            }
            if (keywordsSet.has(keyword.toLowerCase())) {
                toast("Keyword is already added");
                return;
            }
            keywordsSet.add(keyword.toLowerCase());
            setKeywordArray([...keywordArray, keyword]);
            setKeyword("");
        }
    }

    function spliceKeywordArray(index: number) {
        setKeywordArray([...keywordArray.filter((_, i) => i !== index)]);
    }

    return (
        <form
            onSubmit={handleSubmitPdt}
            encType={"multipart/form-data"}
            id={styles["form-container"]}
            style={{ height: 'auto', maxHeight: '100%' }}
        >
            <div id={styles["form-input-field-container"]}>
                <section data-label="product-ProductDetail">
                    <fieldset
                        style={{ display: "flex", flexDirection: "column", gap: "15px" }}
                    >
                        <legend>Product ProductDetail</legend>
                        <section>
                            <label>Product Name</label>
                            <div
                                style={{ backgroundColor: "rgba(255, 255, 255, 0.963)" }}
                                data-section={"product-name"}
                                className={styles["input-containers"]}
                            >
                                <AiFillProduct />
                                <input
                                    value={productName}
                                    name={"product-name"}
                                    placeholder={"Product Name"}
                                    onInput={(e) => {
                                        setProductName(e.currentTarget.value);
                                    }}
                                    type="text"
                                />
                            </div>
                        </section>

                        {/* Category Display (Read Only) */}
                        <section>
                            <label>Category</label>
                            <div
                                className={styles["category-containers"]}
                                style={{ justifyContent: 'flex-start', padding: '10px 0' }}
                            >
                                <span className={`${styles["span-category"]} ${styles["span-category-selected"]}`} style={{ cursor: 'default' }}>
                                    {category}
                                </span>
                            </div>
                        </section>

                        <section>
                            <label>Variations</label>
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "10px",
                                    width: "100%"
                                }}
                            >
                                {variationList.map((variation, index) => (
                                    <div
                                        key={index}
                                        style={{
                                            display: "flex",
                                            gap: "10px",
                                            alignItems: "center",
                                            width: "100%"
                                        }}
                                    >
                                        <div
                                            style={{
                                                backgroundColor: "rgba(255, 255, 255, 0.963)",
                                                flex: 1
                                            }}
                                            className={styles["input-containers"]}
                                        >
                                            <input
                                                value={variation.key}
                                                placeholder="Key (e.g. Color)"
                                                onChange={(e) => {
                                                    const newList = [...variationList];
                                                    newList[index].key = e.target.value;
                                                    setVariationList(newList);
                                                }}
                                                type="text"
                                            />
                                        </div>
                                        <div
                                            style={{
                                                backgroundColor: "rgba(255, 255, 255, 0.963)",
                                                flex: 1
                                            }}
                                            className={styles["input-containers"]}
                                        >
                                            <input
                                                value={variation.value}
                                                placeholder="Value (e.g. Red)"
                                                onChange={(e) => {
                                                    const newList = [...variationList];
                                                    newList[index].value = e.target.value;
                                                    setVariationList(newList);
                                                }}
                                                type="text"
                                            />
                                        </div>
                                        {variationList.length > 1 && (
                                            <MdDelete
                                                size={20}
                                                color="#e53e3e"
                                                cursor="pointer"
                                                onClick={() => {
                                                    setVariationList(variationList.filter((_, i) => i !== index));
                                                }}
                                            />
                                        )}
                                    </div>
                                ))}
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "center",
                                        marginTop: "5px"
                                    }}
                                >
                                    <IoIosAddCircle
                                        size={32}
                                        color="#4a5568"
                                        cursor="pointer"
                                        onClick={() => {
                                            setVariationList([...variationList, { key: "", value: "" }]);
                                        }}
                                        title="Add Variation"
                                    />
                                </div>
                            </div>
                        </section>

                        <section>
                            <label>EAN|UPC|GTIN|ISBN|ASIN|OTHERS</label>
                            <article
                                style={{
                                    display: "flex",
                                    gap: 10,
                                    width: "100%",
                                    position: "relative",
                                }}
                            >
                                <div
                                    style={{
                                        maxWidth: 100,
                                        backgroundColor: "rgba(255, 255, 255, 0.963)",
                                        flexGrow: 1,
                                    }}
                                    data-section={"EanUpcIsbnTypeGtinAsinType"}
                                    className={styles["input-containers"]}
                                >
                                    <IoIosArrowDropdownCircle
                                        cursor={"pointer"}
                                        onClick={() => setToggleEacUpcType((prev) => !prev)}
                                    />
                                    <input name="eanUpcType" value={eanUpcType} disabled />
                                    {toggleEacUpcType && (
                                        <section
                                            className={`${toggleEacUpcType
                                                ? ""
                                                : styles["product-identification-list"]
                                                }`}
                                        >
                                            {Object.keys(EanUpcIsbnType).map((key) => (
                                                <dl
                                                    key={key}
                                                    onClick={() => {
                                                        setEacUpcType(EanUpcIsbnType[key as keyof typeof EanUpcIsbnType]);
                                                        setToggleEacUpcType(false);
                                                    }}
                                                >
                                                    {key}
                                                </dl>
                                            ))}
                                        </section>
                                    )}
                                </div>
                                <div
                                    style={{
                                        backgroundColor: "rgba(255, 255, 255, 0.963)",
                                        flexGrow: 3,
                                    }}
                                    data-section={
                                        "EAC-UPC-ISBN-ASIN-OTHERS-Identification-Number"
                                    }
                                    className={styles["input-containers"]}
                                >
                                    <MdConfirmationNumber />
                                    <input
                                        value={eanUpc}
                                        onChange={(e) => {
                                            setEacUpc(e.target.value);
                                        }}
                                        name={"ean-upc"}
                                        placeholder={"EAN | UPC | ISBN | ASIN | GTIN | OTHERS"}
                                        type="text"
                                    />
                                </div>
                            </article>
                        </section>

                        {/* Additional Fields Injection */}
                        {children}

                        <section style={{ display: "flex", gap: 15 }}>
                            <div>
                                <label>Quantity :</label>
                                <div
                                    data-section={"quantity"}
                                    style={{ backgroundColor: "rgba(255, 255, 255, 0.963)" }}
                                    className={styles["input-containers"]}
                                >
                                    <MdOutlineProductionQuantityLimits />
                                    <input
                                        value={quantity}
                                        onChange={(e) => {
                                            if (isNaN(parseInt(e.target.value))) {
                                                // toast.error("Quantity must be whole number!"); // Can be annoying on empty
                                                setQuantity(0);
                                                return;
                                            }
                                            // ... existing validations handled roughly locally, keeping valid checks simple
                                            if (Number(e.target.value) < 0) return;
                                            if (e.target.value.includes(".")) return;
                                            if (e.target.value[0] === "0" && e.target.value.length > 1)
                                                e.target.value = e.target.value.slice(1);

                                            setQuantity(parseInt(e.target.value));
                                        }}
                                        name={"quantity"}
                                        placeholder={"Quantity"}
                                        type="number"
                                        step={1}
                                        pattern="\d+"
                                    />
                                </div>
                            </div>
                            <div style={{ flexGrow: 1 }}>
                                <label>Price :</label>
                                <div
                                    data-section={"price"}
                                    style={{ backgroundColor: "rgba(255, 255, 255, 0.963)" }}
                                    className={styles["input-containers"]}
                                >
                                    <FaRupeeSign />
                                    <input
                                        value={price}
                                        onChange={(e) => {
                                            if (isNaN(Number(e.target.value))) return;
                                            if (Number(e.target.value) < 0) return;
                                            // ... validation logic
                                            setPrice(Number(e.target.value));
                                        }}
                                        name={"price"}
                                        placeholder={"price"}
                                        type="number"
                                    />
                                </div>
                            </div>
                        </section>
                        <section>
                            <label>Keywords :</label>
                            <div>
                                <div
                                    data-section={"keywords"}
                                    style={{ backgroundColor: "rgba(255, 255, 255, 0.963)" }}
                                    className={styles["input-containers"]}
                                >
                                    <MdOutlineProductionQuantityLimits />
                                    <input
                                        value={keyword}
                                        onChange={(e) => {
                                            setKeyword(e.target.value);
                                        }}
                                        onKeyDown={fillKeywordsArray}
                                        name={"keywords"}
                                        placeholder={"keywords [press Tab to add]"}
                                        type="text"
                                    />
                                </div>
                                <div
                                    ref={keywordsRef}
                                    id={styles["keyword-list"]}
                                    onWheel={(e) => {
                                        e.stopPropagation();
                                        if (keywordsRef.current)
                                            keywordsRef.current.scrollLeft += e.deltaY;
                                    }}
                                >
                                    {keywordArray?.map((item, i) => (
                                        <article key={i} className={styles["keyword"]}>
                                            <span>{item}</span>
                                            <AiFillCloseCircle
                                                cursor={"pointer"}
                                                onClick={() => {
                                                    spliceKeywordArray(i);
                                                    keywordsSet.delete(item);
                                                }}
                                            />
                                        </article>
                                    ))}
                                </div>
                            </div>
                        </section>
                        <section>
                            <label>Product images :</label>
                            <div style={{ display: "flex", flexDirection: "column" }}>
                                <div
                                    onClick={() => {
                                        ImageInputRef.current?.click();
                                    }}
                                    data-section={"product-images"}
                                    className={`${styles["input-containers"]} ${styles["image-upload-area"]}`}
                                    style={{
                                        backgroundColor: "rgba(255, 255, 255, 0.963)",
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        height: 120,
                                        cursor: "pointer",
                                        gap: 8,
                                    }}
                                >
                                    <ImUpload size={32} id={"img-upload"} />
                                    <span style={{ fontSize: '0.875rem', color: '#718096', fontWeight: 500 }}>
                                        Click to upload images
                                    </span>
                                    <input
                                        id={styles["images-input"]}
                                        ref={ImageInputRef}
                                        onChange={async (e) => {
                                            if (images && images?.length > 6) {
                                                toast.error("Images list full!");
                                                return;
                                            }
                                            const imagesList: (File | null)[] = [];
                                            if (e.target?.files?.length)
                                                for (let i = 0; i < e.target.files?.length; i++)
                                                    imagesList.push(e.target.files.item(i));

                                            setImages([...images, ...imagesList] as File[]);

                                            const urlPreview: string[] = [];
                                            async function convertArrayBufferToObjectUrl(
                                                image: File
                                            ) {
                                                const arrayBuffer = await image?.arrayBuffer();

                                                if (arrayBuffer) {
                                                    const blob = new Blob([arrayBuffer]);
                                                    const url = URL.createObjectURL(blob);
                                                    urlPreview.push(url);
                                                    imageToUrlPreviewMap.set(image, url);
                                                }
                                            }

                                            for (let image of imagesList)
                                                if (image) await convertArrayBufferToObjectUrl(image);
                                            setBlobUrlForPreview([
                                                ...blobUrlForPreview,
                                                ...urlPreview,
                                            ]);
                                        }}
                                        multiple={true}
                                        name={"product-images"}
                                        placeholder={"Image"}
                                        type="file"
                                        accept="image/*"
                                    />
                                </div>
                                <div
                                    ref={imageCarouselContainerRef}
                                    onWheel={(e) => {
                                        if (imageCarouselContainerRef.current)
                                            imageCarouselContainerRef.current.scrollLeft += e.deltaY;
                                    }}
                                    style={{
                                        display: "flex",
                                        gap: 15,
                                        marginTop: 10,
                                        width: 390,
                                        overflow: "auto clip",
                                    }}
                                >
                                    {blobUrlForPreview?.map((item, i) => (
                                        <figure
                                            key={i}
                                            className={styles["image-preview-container"]}
                                        >
                                            <img src={item} className={styles["preview-images"]} />
                                            <figcaption
                                                onClick={() => {
                                                    const newImages = images.filter((img) => item !== imageToUrlPreviewMap.get(img));
                                                    setImages(newImages);
                                                    setBlobUrlForPreview(blobUrlForPreview.filter((url) => url !== item));
                                                }}
                                                className={styles["bottom-label-delete-image"]}
                                            >
                                                <MdDeleteSweep />
                                            </figcaption>
                                        </figure>
                                    ))}
                                </div>
                            </div>
                        </section>
                        <section>
                            <label>Discount :</label>
                            <div>
                                <div
                                    data-section={"discount"}
                                    style={{ backgroundColor: "rgba(255, 255, 255, 0.963)" }}
                                    className={styles["input-containers"]}
                                >
                                    <FaPercentage />
                                    <input
                                        value={discount}
                                        onChange={(e) => {
                                            const val = Number(e.target.value);
                                            if (isNaN(val) || val < 0 || val > 100) return;
                                            setDiscount(val);
                                        }}
                                        name={"discount"}
                                        placeholder={"discount (%)"}
                                        type="number"
                                    />
                                </div>
                            </div>
                        </section>
                        <section>
                            <label>Product Description :</label>
                            <div>
                                <div
                                    data-section={"product-description"}
                                    style={{
                                        backgroundColor: "rgba(255, 255, 255, 0.963)",
                                        height: "max-content",
                                    }}
                                    className={styles["input-containers"]}
                                >
                                    <textarea
                                        style={{
                                            border: "none",
                                            width: "100%",
                                            outline: "none",
                                            resize: "none",
                                            height: 150,
                                        }}
                                        value={productDescription}
                                        onChange={(e) => {
                                            setProductDescription(e.target.value);
                                        }}
                                        name={"productDescription"}
                                        placeholder={"Give a brief about the product (optional)"}
                                    />
                                </div>
                            </div>
                        </section>
                    </fieldset>
                </section>
            </div>
            <section className={styles["submit-button-container"]}>
                <button
                    className={styles["submit-button"]}
                    type="submit"
                >
                    <IoIosPersonAdd size={20} />
                    Add Product
                </button>
            </section>
        </form>
    );
};

export default BaseProductForm;
