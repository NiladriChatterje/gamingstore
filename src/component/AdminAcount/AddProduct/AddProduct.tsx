import { FormEvent, useState } from "react";
import styles from './AddProduct.module.css';
import { IoIosArrowDropdownCircle, IoIosPersonAdd } from "react-icons/io";
import { AiFillProduct } from "react-icons/ai";
import { MdConfirmationNumber, MdModelTraining } from "react-icons/md";
import toast from "react-hot-toast";

enum EanUpcIsbn { EAN = "EAN", UPC = "UPC", ISBN = "ISBN", ASIN = "ASIN", GTIN = "GTIN", OTHERS = "OTHERS" }
enum currency { INR = "INR", YEN = "YEN", USD = "USD" }

type productPriceType = {
    currency: currency;
    pdtPrice: number;
    discountPercentage: number;
}

interface productType {
    productName: string;
    image: File[];
    eanUpcIsbnGtinAsinType: EanUpcIsbn;
    eanUpcIsbnGtinAsinNumber: string;
    modelNumber?: string;
    quantity: number;
    seller: string[];//type will be adminType
    price: productPriceType;
    keywords: string[]
}

const AddProduct = () => {
    const [modelNumber, setModelNumber] = useState<string>('');
    const [eanUpc, setEacUpc] = useState<string>('')
    const [eacUpcType, setEacUpcType] = useState<EanUpcIsbn>(EanUpcIsbn.EAN);
    const [toggleEacUpcType, setToggleEacUpcType] = useState<boolean>(true);//close the dropdown

    async function handleSubmitPdt(e: FormEvent) {
        e.preventDefault();
        toast('submitting')
        return;
        await fetch('http://localhost:5000/add-product', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify('')
        });
    }

    return (
        <form onSubmit={handleSubmitPdt}
            id={styles['form-container']}>
            <div id={styles['form-input-field-container']}>
                <section data-label="product-details">
                    <fieldset style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <legend>Product Details</legend>
                        <section>
                            <div
                                style={{ backgroundColor: 'rgba(255, 255, 255, 0.963)' }}
                                data-section={'product-name'}
                                className={styles['input-containers']}>
                                <AiFillProduct />
                                <input

                                    name={'product-name'} placeholder={'Product Name'}
                                    maxLength={6} minLength={6}
                                    type='text' />
                            </div>
                        </section>
                        <section
                            style={{ display: 'flex', gap: 10, width: '100%' }}>
                            <div style={{ maxWidth: 120, backgroundColor: 'rgba(255, 255, 255, 0.963)' }}
                                data-section={'eanUpcIsbnGtinAsinType'}
                                className={styles['input-containers']}>
                                <IoIosArrowDropdownCircle cursor={'pointer'}
                                    onClick={() => setToggleEacUpcType(prev => !prev)}
                                />
                                {toggleEacUpcType && <section className={`${toggleEacUpcType ? '' : styles['product-identification-list']}`}>
                                    <dl onClick={() => { setEacUpcType(EanUpcIsbn.EAN); setToggleEacUpcType(true) }}>EAN</dl>
                                    <dl onClick={() => { setEacUpcType(EanUpcIsbn.UPC); setToggleEacUpcType(true) }}>UPC</dl>
                                    <dl onClick={() => { setEacUpcType(EanUpcIsbn.ISBN); setToggleEacUpcType(true) }}>ISBN</dl>
                                    <dl onClick={() => { setEacUpcType(EanUpcIsbn.ASIN); setToggleEacUpcType(true) }}>ASIN</dl>
                                    <dl onClick={() => { setEacUpcType(EanUpcIsbn.GTIN); setToggleEacUpcType(true) }}>GTIN</dl>
                                </section>}
                            </div>
                            <div
                                style={{ backgroundColor: 'rgba(255, 255, 255, 0.963)' }}
                                data-section={'EAC-UPC-ISBN-ASIN-OTHERS-Identification-Number'}
                                className={styles['input-containers']}>
                                <MdConfirmationNumber />
                                <input
                                    value={eanUpc}
                                    onChange={e => { setEacUpc(e.target.value) }}
                                    name={'ean-upc'} placeholder={'EAN | UPC | ISBN | ASIN | GTIN | OTHERS'} type='text' />
                            </div>
                        </section>
                        <section>
                            <div
                                data-section={'modelNumber'}
                                style={{ backgroundColor: 'rgba(255, 255, 255, 0.963)' }}
                                className={styles['input-containers']}>
                                <MdModelTraining />
                                <input value={modelNumber}
                                    onChange={e => {
                                        setModelNumber(e.target.value)
                                    }}
                                    name={'model-number'} placeholder={'model number'} type='text'
                                />
                            </div>
                        </section>
                    </fieldset>
                </section>
            </div>
            <section style={{ display: 'flex', justifyContent: 'flex-end', gap: 15 }}>
                <IoIosPersonAdd
                    color='white'
                    cursor={'pointer'}
                    style={{
                        backgroundColor: 'rgb(52, 48, 105)',
                        borderRadius: 5, padding: '5px 10px'
                    }}
                    size={25}
                    type={'submit'}
                />
            </section>
        </form>
    )
}

export default AddProduct