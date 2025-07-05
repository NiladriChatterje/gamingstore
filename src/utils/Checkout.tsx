import { FormEvent, useState } from 'react'
import toast from 'react-hot-toast'
import { useRazorpay, RazorpayOrderOptions } from 'react-razorpay'
import { CurrencyCode } from 'react-razorpay/dist/constants/currency'
import { useStateContext } from '../StateContext'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import { useUserStateContext } from '@/component/UserAccount/UserStateContext'
// import { io } from 'socket.io-client';

// const socket = io("http://localhost:5002",{
//   transports:["polling","websocket","webtransport"]
// })

const PayButtonStyle = {
  padding: '5px 20px',
  borderRadius: 5,
  cursor: 'pointer',
  width: 'max-content',
  outline: 'none',
  fontWeight: 600,
  borderStyle: 'none',
  color: 'white',
  backgroundColor: 'rgb(85, 88, 117)',
}

const Checkout = ({
  price,
  callback,
}: {
  price: number;
  callback?: Function
}) => {
  const { error, Razorpay } = useRazorpay()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const navigate = useNavigate()
  const { defaultLoginAdminOrUser } = useStateContext();
  const { userData } = useUserStateContext();
  const { getToken } = useAuth();

  // const { user } = useUser()

  const handlePayment = async (e: FormEvent, _callback?: Function) => {
    e.preventDefault()
    setIsLoading(true)
    try {


      const response: Response = await fetch('http://localhost:5000/razorpay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${await getToken()}`,
          'x-user-id': userData?._id ?? ''
        },
        body: JSON.stringify({ price: price * 100 }),
      })
      const data: { id: string; currency: CurrencyCode } = await response.json()

      const options: () => RazorpayOrderOptions = () => ({
        key: import.meta.env.VITE_RAZORPAY_API_KEY,
        amount: price * 100, // Amount in paise
        currency: data.currency,
        name: 'XV Store',
        description: 'Test Transaction',
        order_id: data.id, // Generate order_id on server
        redirect: true,
        handler: response => {
          console.log(response)
          setIsLoading(false)
          if (
            !response.razorpay_order_id ||
            !response.razorpay_payment_id ||
            !response.razorpay_signature
          ) {

            toast.error('payment failed')
            return
          }
          toast.success('Payment Successful!')
          if (_callback)
            _callback(
              response.razorpay_payment_id,
              response.razorpay_signature,
              response.razorpay_order_id,
              defaultLoginAdminOrUser,
            )

          if (
            defaultLoginAdminOrUser === 'user' &&
            response.razorpay_order_id &&
            response.razorpay_payment_id &&
            response.razorpay_signature
          )
            navigate(`/user/completion/`)
        },
        theme: {
          color: 'rgb(85, 88, 117)',
        },
        readonly: {
          contact: false,
        },
        modal: {
          animation: true,
          ondismiss: () => {
            setIsLoading(false)
          },
        },
      })

      const razorpayInstance = new Razorpay(options())
      razorpayInstance.open()
      razorpayInstance.on('payment.failed', () => {
        setIsLoading(false)
      })
    } catch (e: Error | any) {
      toast.error(e.message)
    }
  }

  return (
    <form onSubmit={e => handlePayment(e, callback)}>
      {error && <p>Error loading Razorpay: {error}</p>}
      <input
        style={PayButtonStyle}
        type='submit'
        value={!isLoading ? 'Pay Now' : 'loading...'}
        disabled={isLoading}
      />
    </form>
  )
}

export default Checkout
