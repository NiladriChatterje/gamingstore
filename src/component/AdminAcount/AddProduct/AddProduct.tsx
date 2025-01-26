import { FormEvent } from "react";
import styles from './AddProduct.module.css';
import { IoIosPersonAdd } from "react-icons/io";

enum EanUpcIsbn { EAC = "EAC", UPC = "UPC", ISBN = "ISBN", ASIN = "ASIN", GTIN = "GTIN", OTHERS = "OTHERS" }
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

    async function handleSubmitPdt(e: FormEvent) {
        e.preventDefault();
        await fetch('http://localhost:5000/add-product', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify('')
        });
    }

    return (
        <form onSubmit={handleSubmitPdt}>
            <section style={{ display: 'flex', justifyContent: 'flex-end', gap: 15 }}>
                <IoIosPersonAdd
                    color='white'
                    cursor={'pointer'}
                    style={{
                        backgroundColor: 'rgb(52, 48, 105)',
                        borderRadius: 5, padding: '5px 10px'
                    }}
                    size={25}
                    // type={'submit'}
                    onClick={() => {

                    }}
                />
            </section>
        </form>
    )
}

export default AddProduct