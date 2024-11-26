import { FormEvent } from "react"

const AddProduct = () => {

    async function handleSubmitPdt(e: FormEvent) {
        e.preventDefault();

    }

    return (
        <form onSubmit={handleSubmitPdt}>

        </form>
    )
}

export default AddProduct