import { FormEvent, useState, KeyboardEvent, useRef, useEffect } from 'react'
import styles from './AddProduct.module.css'
import { IoIosArrowDropdownCircle, IoIosPersonAdd } from 'react-icons/io'
import { AiFillCloseCircle, AiFillProduct } from 'react-icons/ai'
import {
  MdConfirmationNumber,
  MdDeleteSweep,
  MdModelTraining,
  MdOutlineProductionQuantityLimits,
} from 'react-icons/md'
import toast from 'react-hot-toast'
import { FaRupeeSign } from 'react-icons/fa'
import { ImUpload } from 'react-icons/im'
import { EanUpcIsbnType, currency } from '@/enums/enums'
import { ProductType } from '@declarations/UserStateContextType'

const keywordsSet = new Set<string>()

const ProductCategories: string[] = [
  'clothing',
  'food-n-Groceries',
  'gadgets',
  'home-goods',
  'toys',
]

const AddProduct = () => {
  const [modelNumber, setModelNumber] = useState<string>(() => '')
  const [eanUpc, setEacUpc] = useState<string>(() => '')
  const [category, setCategory] = useState<string>(() => ProductCategories[0])
  const [productName, setProductName] = useState<string>(() => '')
  const [productDescription, setProductDescription] = useState<string>(() => '')
  const [images, setImages] = useState<File[]>(() => [])
  const [quantity, setQuantity] = useState<number>(0)
  const [eanUpcType, setEacUpcType] = useState<EanUpcIsbnType>(
    () => EanUpcIsbnType.EAN,
  )
  const [price, setPrice] = useState<number>(() => 0)
  const [discount, setDiscount] = useState<number>(() => 0)
  const [keyword, setKeyword] = useState<string>(() => '')
  const [imageToUrlPreviewMap, _] = useState<Map<Blob, string>>(
    () => new Map<Blob, string>(),
  )
  const [keywordArray, setKeywordArray] = useState<string[]>(() => [])
  const [toggleEacUpcType, setToggleEacUpcType] = useState<boolean>(() => false) //close the dropdown
  const [checked, setChecked] = useState<boolean>(() => false)
  const [blobUrlForPreview, setBlobUrlForPreview] = useState<string[]>(() => [])

  const keywordsRef = useRef<HTMLDivElement>(null) //for horizontal scrolling
  const modelNumberRef = useRef<HTMLDivElement>(null)
  const ImageInputRef = useRef<HTMLInputElement>(null)
  const imageCarouselContainerRef = useRef<HTMLDivElement>(null)
  const spanCategoryRef = useRef<HTMLSpanElement[]>([])

  async function handleSubmitPdt(e: FormEvent) {
    e.preventDefault()
    if (!eanUpc || !quantity || !price || !keywordArray.length) {
      toast('Please fill necessary fields!')
      return
    }

    const base64Images: { size: number; extension: string; base64: string }[] =
      []

    for (let image of images) {
      const fileReader = new FileReader()
      fileReader.addEventListener('loadend', async () => {
        if (fileReader.result)
          base64Images.push({
            size: image.size,
            extension: image.type.split('/')[1],
            base64: fileReader.result as string,
          })

        if (base64Images.length === images.length) {
          const formData: ProductType = {
            productName: productName,
            category,
            eanUpcIsbnGtinAsinType: eanUpcType,
            eanUpcNumber: eanUpc,
            quantity,
            currency: currency.INR,
            price: price,
            discount: 0,
            keywords: keywordArray,
            imagesBase64: [...base64Images],
            seller: [] as unknown as string,
            productDescription: productDescription,
            created_at: new Date(),
            update_at: new Date(),
          }
          if (checked) {
            if (!modelNumber) {
              toast('Model number for gadgets are mandatory!')
              return
            }
            formData.modelNumber = modelNumber
          }

          const response = await fetch('http://localhost:5000/add-product', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
          })

          //clearing form data on successful transfer
          if (response?.ok) {
            toast.success('Product added successfully!')
            setModelNumber('')
            setProductName('')
            setPrice(0)
            setQuantity(0)
            setEacUpc('')
            setImages([] as File[])
            setBlobUrlForPreview([] as string[])
            setKeywordArray([] as string[])
            keywordsSet.clear()
          }
        }
      })
      fileReader.readAsDataURL(image)
    }
  }

  function fillKeywordsArray(e: KeyboardEvent) {
    if (e.key === 'Tab') {
      if (keywordArray.length > 30) {
        toast.error('limit reached')
        return
      }
      if (keywordsSet.has(keyword.toLowerCase())) {
        toast('Keyword is already added')
        return
      }
      keywordsSet.add(keyword.toLowerCase())
      setKeywordArray([...keywordArray, keyword])
      setKeyword('')
    }
  }

  function spliceKeywordArray(index: number) {
    setKeywordArray([...keywordArray.filter((_, i) => i !== index)])
  }

  useEffect(() => {
    if (checked && modelNumberRef.current) {
      modelNumberRef.current.style.border = '1px solid red'
      modelNumberRef.current.style.boxShadow = '0 0 8px -5px red'
    } else if (modelNumberRef.current) {
      modelNumberRef.current.style.border = 'none'
      modelNumberRef.current.style.boxShadow = '0 0 0 0 transparent'
    }
  }, [checked])

  return (
    <form
      onSubmit={handleSubmitPdt}
      encType={'multipart/form-data'}
      id={styles['form-container']}
    >
      <div id={styles['form-input-field-container']}>
        <section data-label='product-details'>
          <fieldset
            style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}
          >
            <legend>Product Details</legend>
            <section>
              <label>Product Name</label>
              <div
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.963)' }}
                data-section={'product-name'}
                className={styles['input-containers']}
              >
                <AiFillProduct />
                <input
                  value={productName}
                  name={'product-name'}
                  placeholder={'Product Name'}
                  onInput={e => {
                    setProductName(e.currentTarget.value)
                  }}
                  type='text'
                />
              </div>
            </section>
            <section>
              <label>Category</label>
              <div
                data-section={'product-category'}
                className={styles['category-containers']}
              >
                {ProductCategories?.map((item, i) => (
                  <span
                    className={styles['span-category']}
                    ref={el => {
                      if (el) spanCategoryRef.current.push(el)
                    }}
                    key={i}
                    onClick={() => {
                      setCategory(item)
                      for (let i of spanCategoryRef.current)
                        i.classList.remove(styles['span-category-selected'])

                      spanCategoryRef.current[i].classList.add(
                        styles['span-category-selected'],
                      )
                    }}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </section>
            <section>
              <label>EAN|UPC|GTIN|ISBN|ASIN|OTHERS</label>
              <article
                style={{
                  display: 'flex',
                  gap: 10,
                  width: '100%',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    maxWidth: 100,
                    backgroundColor: 'rgba(255, 255, 255, 0.963)',
                    flexGrow: 1,
                  }}
                  data-section={'EanUpcIsbnTypeGtinAsinType'}
                  className={styles['input-containers']}
                >
                  <IoIosArrowDropdownCircle
                    cursor={'pointer'}
                    onClick={() => setToggleEacUpcType(prev => !prev)}
                  />
                  <input name='eanUpcType' value={eanUpcType} disabled />
                  {toggleEacUpcType && (
                    <section
                      className={`${
                        toggleEacUpcType
                          ? ''
                          : styles['product-identification-list']
                      }`}
                    >
                      <dl
                        onClick={() => {
                          setEacUpcType(EanUpcIsbnType.EAN)
                          setToggleEacUpcType(false)
                        }}
                      >
                        EAN
                      </dl>
                      <dl
                        onClick={() => {
                          setEacUpcType(EanUpcIsbnType.UPC)
                          setToggleEacUpcType(false)
                        }}
                      >
                        UPC
                      </dl>
                      <dl
                        onClick={() => {
                          setEacUpcType(EanUpcIsbnType.ISBN)
                          setToggleEacUpcType(false)
                        }}
                      >
                        ISBN
                      </dl>
                      <dl
                        onClick={() => {
                          setEacUpcType(EanUpcIsbnType.ASIN)
                          setToggleEacUpcType(false)
                        }}
                      >
                        ASIN
                      </dl>
                      <dl
                        onClick={() => {
                          setEacUpcType(EanUpcIsbnType.GTIN)
                          setToggleEacUpcType(false)
                        }}
                      >
                        GTIN
                      </dl>
                    </section>
                  )}
                </div>
                <div
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.963)',
                    flexGrow: 3,
                  }}
                  data-section={
                    'EAC-UPC-ISBN-ASIN-OTHERS-Identification-Number'
                  }
                  className={styles['input-containers']}
                >
                  <MdConfirmationNumber />
                  <input
                    value={eanUpc}
                    onChange={e => {
                      setEacUpc(e.target.value)
                    }}
                    name={'ean-upc'}
                    placeholder={'EAN | UPC | ISBN | ASIN | GTIN | OTHERS'}
                    type='text'
                  />
                </div>
              </article>
            </section>
            {category === 'gadgets' && (
              <section>
                <label>Model Number</label>
                <div style={{ display: 'flex', gap: 15 }}>
                  <div
                    data-section={'isGadget'}
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.963)' }}
                    className={styles['input-containers']}
                  >
                    <input
                      onChange={e => {
                        setChecked(e.target.checked)
                      }}
                      name={'is-gadget'}
                      type='checkbox'
                    />
                    <label>Gadget</label>
                  </div>
                  <div
                    ref={modelNumberRef}
                    data-section={'modelNumber'}
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.963)' }}
                    className={styles['input-containers']}
                  >
                    <MdModelTraining />
                    <input
                      value={modelNumber}
                      onChange={e => {
                        setModelNumber(e.target.value)
                      }}
                      name={'model-number'}
                      placeholder={'model number'}
                      type='text'
                    />
                  </div>
                </div>
              </section>
            )}
            <section style={{ display: 'flex', gap: 15 }}>
              <div>
                <label>Quantity :</label>
                <div
                  data-section={'quantity'}
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.963)' }}
                  className={styles['input-containers']}
                >
                  <MdOutlineProductionQuantityLimits />
                  <input
                    value={quantity}
                    onChange={e => {
                      if (isNaN(parseInt(e.target.value))) {
                        toast.error('Quantity must be whole number!')
                        setQuantity(0)
                        return
                      }
                      if (Number(e.target.value) < 0) {
                        toast.error('Quantity cannot be -ve!')
                        return
                      }
                      if (e.target.value.includes('.')) {
                        toast.error('Quantity cannot be in fraction!')
                        return
                      }
                      if (e.target.value[0] === '0')
                        e.target.value = e.target.value.slice(1)

                      setQuantity(parseInt(e.target.value))
                    }}
                    name={'quantity'}
                    placeholder={'Quantity'}
                    type='number'
                    step={1}
                    pattern='\d+'
                  />
                </div>
              </div>
              <div>
                <label>Price :</label>
                <div
                  data-section={'price'}
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.963)' }}
                  className={styles['input-containers']}
                >
                  <FaRupeeSign />
                  <input
                    value={price}
                    onChange={e => {
                      if (isNaN(Number(e.target.value))) {
                        toast.error('Only numbers are accepted!')
                        return
                      }
                      if (Number(e.target.value) < 0) {
                        toast.error('Price cannot be -ve!')
                        return
                      }
                      if (e.target.value[0] === '0')
                        e.target.value = e.target.value.slice(1)

                      setPrice(Number(e.target.value))
                    }}
                    name={'price'}
                    placeholder={'price'}
                    type='number'
                  />
                </div>
              </div>
            </section>
            <section>
              <label>Keywords :</label>
              <div>
                <div
                  data-section={'keywords'}
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.963)' }}
                  className={styles['input-containers']}
                >
                  <MdOutlineProductionQuantityLimits />
                  <input
                    value={keyword}
                    onChange={e => {
                      setKeyword(e.target.value)
                    }}
                    onKeyDown={fillKeywordsArray}
                    name={'keywords'}
                    placeholder={'keywords [press Tab to add]'}
                    type='text'
                  />
                </div>
                <div
                  ref={keywordsRef}
                  id={styles['keyword-list']}
                  onWheel={e => {
                    e.stopPropagation()
                    if (keywordsRef.current)
                      keywordsRef.current.scrollLeft += e.deltaY
                  }}
                >
                  {keywordArray?.map((item, i) => (
                    <article key={i} className={styles['keyword']}>
                      <span>{item}</span>
                      <AiFillCloseCircle
                        cursor={'pointer'}
                        onClick={() => {
                          spliceKeywordArray(i)
                          keywordsSet.delete(item)
                        }}
                      />
                    </article>
                  ))}
                </div>
              </div>
            </section>
            <section>
              <label>Product images :</label>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div
                  onClick={() => {
                    ImageInputRef.current?.click()
                  }}
                  data-section={'product-images'}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.963)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: 90,
                    cursor: 'pointer',
                  }}
                  className={styles['input-containers']}
                >
                  <ImUpload size={35} id={'img-upload'} />
                  <input
                    id={styles['images-input']}
                    ref={ImageInputRef}
                    onChange={async e => {
                      if (images && images?.length > 6) {
                        toast.error('Images list full!')
                        return
                      }
                      const imagesList: (File | null)[] = []
                      if (e.target?.files?.length)
                        for (let i = 0; i < e.target.files?.length; i++)
                          imagesList.push(e.target.files.item(i))

                      setImages([...images, ...imagesList] as File[])

                      const urlPreview: string[] = []
                      async function convertArrayBufferToObjectUrl(
                        image: File,
                      ) {
                        const arrayBuffer = await image?.arrayBuffer()

                        if (arrayBuffer) {
                          const blob = new Blob([new Uint8Array(arrayBuffer)])
                          const url = URL.createObjectURL(blob)
                          urlPreview.push(url)
                          imageToUrlPreviewMap.set(image, url)
                        }
                      }

                      for (let image of imagesList)
                        if (image) await convertArrayBufferToObjectUrl(image)
                      setBlobUrlForPreview([
                        ...blobUrlForPreview,
                        ...urlPreview,
                      ])
                    }}
                    multiple={true}
                    name={'product-images'}
                    placeholder={'Image'}
                    type='file'
                    accept='image/*'
                  />
                </div>
                <div
                  ref={imageCarouselContainerRef}
                  onWheel={e => {
                    if (imageCarouselContainerRef.current)
                      imageCarouselContainerRef.current.scrollLeft += e.deltaY
                  }}
                  style={{
                    display: 'flex',
                    gap: 15,
                    marginTop: 10,
                    width: 390,
                    overflow: 'auto clip',
                  }}
                >
                  {blobUrlForPreview?.map((item, i) => (
                    <figure
                      key={i}
                      className={styles['image-preview-container']}
                    >
                      <img src={item} className={styles['preview-images']} />
                      <figcaption
                        onClick={() => {
                          setImages(
                            images.filter(
                              img => item !== imageToUrlPreviewMap.get(img),
                            ),
                          )
                          setBlobUrlForPreview(
                            blobUrlForPreview.filter(
                              itemUrl => itemUrl !== item,
                            ),
                          )
                        }}
                        className={styles['bottom-label-delete-image']}
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
                  data-section={'discount'}
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.963)' }}
                  className={styles['input-containers']}
                >
                  <FaRupeeSign />
                  <input
                    value={discount}
                    onChange={e => {
                      if (isNaN(Number(e.target.value))) {
                        toast.error('Only numbers are accepted!')
                        return
                      }
                      if (Number(e.target.value) < 0) {
                        toast.error('Discount cannot be < 0%!')
                        return
                      }
                      if (Number(e.target.value) > 100) {
                        toast.error('Discount cannot be > 100%!')
                        return
                      }
                      if (e.target.value[0] === '0')
                        e.target.value = e.target.value.slice(1)

                      setDiscount(Number(e.target.value))
                    }}
                    name={'discount'}
                    placeholder={'discount (%)'}
                    type='number'
                  />
                </div>
              </div>
            </section>
            <section>
              <label>Discount :</label>
              <div>
                <div
                  data-section={'product-description'}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.963)',
                    height: 'max-content',
                  }}
                  className={styles['input-containers']}
                >
                  <textarea
                    style={{
                      border: 'none',
                      width: '100%',
                      outline: 'none',
                      resize: 'none',
                      height: 150,
                    }}
                    value={productDescription}
                    onChange={e => {
                      setProductDescription(e.target.value)
                    }}
                    name={'productDescription'}
                    placeholder={'Give a brief about the product (optional)'}
                  />
                </div>
              </div>
            </section>
          </fieldset>
        </section>
      </div>
      <section style={{ display: 'flex', justifyContent: 'flex-end', gap: 15 }}>
        <button
          style={{
            padding: 0,
            borderStyle: 'none',
            margin: 0,
            outline: 'none',
          }}
          type='submit'
        >
          <IoIosPersonAdd
            color='white'
            cursor={'pointer'}
            style={{
              backgroundColor: 'rgb(52, 48, 105)',
              borderRadius: 5,
              padding: '5px 10px',
            }}
            size={25}
          />
        </button>
      </section>
    </form>
  )
}

export default AddProduct
