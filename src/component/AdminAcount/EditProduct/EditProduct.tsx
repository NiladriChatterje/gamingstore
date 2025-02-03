// import styles from './EditProduct.module.css';
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const EditProduct = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState<any[]>(() => [1, 2, 3, 4, 5])

    useEffect(() => {
        async function getProductList() {

        }
    }, [])

    return (<>
        {products?.map(item => (
            <div
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`${item}`)}
            >EditProduct {item}</div>))}
    </>
    )
}

export default EditProduct