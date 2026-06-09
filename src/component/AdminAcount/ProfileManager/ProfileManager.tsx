import { useEffect, useRef, useState } from "react";
import styles from "./ProfileManager.module.css";
import { MdEdit, MdKeyboardArrowUp, MdKeyboardArrowDown } from "react-icons/md";
import { FaPhone, FaUser } from "react-icons/fa6";
import { IoIosPersonAdd } from "react-icons/io";
import { MdMyLocation } from "react-icons/md";
import { useUser, useAuth } from "@clerk/clerk-react";
import { MdOutlineMarkEmailUnread, MdSignpost } from "react-icons/md";
import axios from "axios";
import toast from "react-hot-toast";
import OTPModal from "./OTPModal";
import { FaCity, FaFileInvoiceDollar } from "react-icons/fa";
import { SiFreelancermap } from "react-icons/si";
import { RiLandscapeFill } from "react-icons/ri";
import { useAdminStateContext } from "../AdminStateContext";

interface ProfileManagerProps {
  onboarding?: boolean;
}

const ProfileManager = ({ onboarding }: ProfileManagerProps) => {
  const { admin, setAdmin } = useAdminStateContext();
  const { user } = useUser();
  const { getToken } = useAuth();

  console.log("admin ", admin);

  const [disable, setDisable] = useState<boolean>(!onboarding);
  const [toggleCountryCode, setToggleCountryCode] = useState<boolean>(false);
  const [gstin, setGstin] = useState<string>(admin?.gstin ?? "");
  const [username, setUsername] = useState<string>(admin?.username ?? "");
  const [pincode, setpinCode] = useState<string>(admin?.address?.pincode ?? "");
  const [country, setCountry] = useState<string>(admin?.address?.country ?? "");
  const [state, setState] = useState<string>(admin?.address?.state ?? "");
  const [county, setCounty] = useState<string>(admin?.address?.county ?? "");
  const [email, setEmail] = useState<string>(admin?.email ?? user?.emailAddresses[0]?.emailAddress ?? "");
  const [phone, setPhone] = useState<string>(admin?.phone != null ? String(admin.phone) : "");
  const [geoPrefilled, setGeoPrefilled] = useState(false);
  const [fetchingAddress, setFetchingAddress] = useState(false);

  // Sync form fields when admin or user data loads asynchronously
  useEffect(() => {
    setUsername(prev => admin?.username ?? user?.firstName ?? prev);
    setGstin(prev => admin?.gstin ?? prev);
    setpinCode(prev => admin?.address?.pincode ?? prev);
    setCounty(prev => admin?.address?.county ?? prev);
    setState(prev => admin?.address?.state ?? prev);
    setCountry(prev => admin?.address?.country ?? prev);
    setEmail(prev => admin?.email ?? user?.emailAddresses[0]?.emailAddress ?? prev);
    setPhone(prev => admin?.phone != null ? String(admin.phone) : prev);
  }, [admin, user]);

  // Derive whether all required fields are filled
  const isFormValid =
    username.trim().length > 0 &&
    gstin.length === 15 &&
    phone.length === 10 &&
    email.trim().length > 0 &&
    pincode.trim().length > 0 &&
    county.trim().length > 0 &&
    country.trim().length > 0 &&
    state.trim().length > 0;
  const [OTP, setOTP] = useState<number>(0);
  const modalRef = useRef<HTMLDialogElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Reusable function: fetch current location via geolocation, then reverse-geocode via Geoapify
  async function fetchAddressFromGeolocation() {
    if (fetchingAddress) return;

    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported on this device or browser.");
      return;
    }

    setFetchingAddress(true);

    try {
      // Wrap getCurrentPosition in a Promise for unified error handling
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 60000,
        });
      });

      const { latitude, longitude } = position.coords;

      const response = await fetch(
        `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=${import.meta.env.VITE_GEOAPIFY_API}`,
        { headers: { "Accept": "application/json" } }
      );

      if (!response.ok) {
        throw new Error(`Geoapify returned ${response.status}`);
      }

      const { features } = await response.json();

      if (!features?.length) {
        toast.error("No address found for your current location. Please enter it manually.");
        return;
      }

      const props = features[0].properties;
      setpinCode(props.postcode ?? "");
      setCounty(props.county ?? "");
      setState(props.state ?? "");
      setCountry(props.country ?? "");
      setGeoPrefilled(true);
      toast.success("Address fields filled from your location!");

    } catch (err: any) {
      // Differentiate geolocation errors from API / network errors
      if (err instanceof GeolocationPositionError) {
        switch (err.code) {
          case GeolocationPositionError.PERMISSION_DENIED:
            toast.error(
              "Location access was denied. Please enable location permissions in your browser settings."
            );
            break;
          case GeolocationPositionError.TIMEOUT:
            toast.error("Location request timed out. Please try again.");
            break;
          case GeolocationPositionError.POSITION_UNAVAILABLE:
            toast.error(
              "Your location could not be determined. Ensure GPS/Wi-Fi is enabled."
            );
            break;
          default:
            toast.error("Failed to get your location. Please try again.");
        }
      } else if (err instanceof TypeError || err.message?.includes("fetch")) {
        toast.error("Failed to fetch address details. Check your internet connection.");
      } else {
        console.log("[ProfileManager] reverse geocoding failed:", err);
        toast.error("Could not fetch address details. Please enter them manually.");
      }
    } finally {
      setFetchingAddress(false);
    }
  }

  // On mount (onboarding mode), try geolocation to prefill address fields
  useEffect(() => {
    if (!onboarding || geoPrefilled) return;
    fetchAddressFromGeolocation();
  }, [onboarding]);

  async function onClickPhoneVerify() {
    try {
      const { data }: { data: { OTP: number } } = await axios.post(
        "http://localhost:5000/fetch-phone-otp",
        {
          recipient: phone,
        }
      );
      if (data.OTP === -1) throw new Error("Resend!");
      setOTP(data.OTP);
      toast("OTP sent");
    } catch (e: Error | any) {
      toast.error(e.message);
    }
  }

  async function handleUpdate() {
    // e.preventDefault();
    // FormEvent is not prevented default behaviour here because toast.promise() cant access the event object.
    if (phone.length !== 10 && gstin.length !== 14) {
      toast.error("Phone & GSTIN wrong!")
      return Promise.reject();
    }

    if (phone.length !== 10) {
      toast.error('invalid phone-number');
      return Promise.reject();
    }
    if (gstin.length !== 15) {
      toast.error('invalid GSTIN!');
      return Promise.reject();
    }
    if (phone.length !== 10 || gstin.length !== 15) {
      toast.error("Form not submitted!")
      return Promise.reject();
    }
    try {
      const token = await getToken();
      const sellerId = admin?._id ?? user?.id;

      // Single upsert call — backend creates if new, updates if existing
      const response = await fetch("http://localhost:5003/update-admin-info", {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          _id: sellerId,
          username: user?.firstName,
          gstin,
          address: {
            pincode,
            county,
            country,
            state,
          },
          email,
          phone: Number(phone),
        }),
      });
      console.log("update response ", response);
      if (response.ok) {
        setDisable(true);
        // Use prefixed ID for context to match what the DB has (seller-{ClerkID})
        // This ensures subsequent saves find the record and route to update-topic
        const contextId = admin?._id ?? `seller-${user?.id}`;
        setAdmin?.((prev: any) => ({
          ...prev,
          _id: contextId,
          _type: "admin",
          username: user?.firstName,
          gstin,
          phone: Number(phone),
          email,
          address: {
            pincode,
            county,
            country,
            state,
          },
        }));
      }
      return Promise.resolve();
    } catch (err) {
      console.log(err);
      return Promise.reject();
    }
  }

  const scrollUp = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollAmount = container.clientHeight * 0.8;
      container.scrollBy({ top: -scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollDown = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollAmount = container.clientHeight * 0.8;
      container.scrollBy({ top: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleUpdate();
      }}
      id={styles["form-container"]}
    >
      {onboarding && (
        <div className={styles["onboarding-banner"]}>
          <h2>Complete Your Profile</h2>
          <p>Please fill in your address, phone number, and GSTIN before you can access the dashboard.</p>
        </div>
      )}
      <div className={styles["scroll-container"]}>
        <div id={styles["form-input-field-container"]} ref={scrollContainerRef}>
          <div
            style={{
              backgroundColor: disable
                ? "rgba(255, 255, 255, 0.563)"
                : "rgba(255, 255, 255, 0.963)",
            }}
            id={styles["username-input"]}
          >
            <FaUser />
            <input
              name={"username"}
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
              }}
              placeholder={user?.firstName ?? ""}
              disabled={disable}
            />
          </div>
          <section>
            <div
              style={{
                backgroundColor: disable
                  ? "rgba(255, 255, 255, 0.563)"
                  : "rgba(255, 255, 255, 0.963)",
              }}
              id={styles["phone-input"]}
            >
              <FaFileInvoiceDollar />
              <input
                name={"gstin"}
                value={gstin}
                onChange={(e) => {
                  setGstin(e.target.value);
                }}
                placeholder={"GSTIN"}
                type="text"
                maxLength={15}
                minLength={15}
                disabled={disable}
              />
            </div>
          </section>
          <section>
            <OTPModal OTP={OTP} ref={modalRef} />
            <div
              style={{
                backgroundColor: disable
                  ? "rgba(255, 255, 255, 0.563)"
                  : "rgba(255, 255, 255, 0.963)",
              }}
              id={styles["phone-input"]}
            >
              <div id={styles["phone-country-code"]}>
                <FaPhone
                  cursor={"pointer"}
                  onClick={() => {
                    if (!disable) setToggleCountryCode((prev) => !prev);
                  }}
                />
                {!disable && (
                  <section
                    className={`${toggleCountryCode ? "" : styles["country-code-list"]
                      }`}
                  >
                    <dl
                      onClick={() => {
                        setToggleCountryCode(false);
                      }}
                    >
                      (+91)IN
                    </dl>
                    <dl
                      onClick={() => {
                        setToggleCountryCode(false);
                      }}
                    >
                      (+144)US
                    </dl>
                    <dl
                      onClick={() => {
                        setToggleCountryCode(false);
                      }}
                    >
                      (+92)PAK
                    </dl>
                  </section>
                )}
              </div>
              <input
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                }}
                name={"phone"}
                placeholder={admin?.phone as unknown as string ?? "xxx-xxx-xxxx"}
                type="tel"
                maxLength={10}
                minLength={10}
                disabled={disable}
                required
              />
            </div>
            <div id={styles["verify-span-btn"]}>
              <span
                onClick={() => {
                  if (!disable) {
                    onClickPhoneVerify();
                    modalRef?.current?.showModal();
                  }
                }}
              >
                Verify
              </span>
            </div>
          </section>
          <section>
            <div
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.563)",
              }}
              id={styles["mail-input"]}
            >
              <MdOutlineMarkEmailUnread />
              <input
                value={email}
                name={"email"}
                placeholder={admin?.email ?? user?.emailAddresses[0]?.emailAddress ?? "example@domain.com"}
                readOnly
              />
            </div>
          </section>
          <section data-label="address">
            <fieldset
              style={{ display: "flex", flexDirection: "column", gap: "15px" }}
            >
              <legend>Address</legend>
              {!disable && (
                <button
                  type="button"
                  className={styles["fetch-address-btn"]}
                  onClick={fetchAddressFromGeolocation}
                  disabled={fetchingAddress}
                >
                  <MdMyLocation size={16} />
                  {fetchingAddress ? "Fetching..." : "Fetch Address Details"}
                </button>
              )}
              <section>
                <div
                  style={{
                    backgroundColor: disable
                      ? "rgba(255, 255, 255, 0.563)"
                      : "rgba(255, 255, 255, 0.963)",
                  }}
                  id={styles["phone-input"]}
                >
                  <MdSignpost />
                  <input
                    value={pincode}
                    onChange={(e) => setpinCode(e.target.value)}
                    name={"pincode"}
                    placeholder={admin?.address?.pincode ?? "PIN code"}
                    maxLength={6}
                    minLength={6}
                    type="text"
                    disabled={disable}
                  />
                </div>
              </section>
              <section>
                <div
                  style={{
                    backgroundColor: disable
                      ? "rgba(255, 255, 255, 0.563)"
                      : "rgba(255, 255, 255, 0.963)",
                  }}
                  id={styles["phone-input"]}
                >
                  <FaCity />
                  <input
                    value={county}
                    onChange={(e) => {
                      setCounty(e.target.value);
                    }}
                    name={"county"}
                    placeholder={admin?.address?.county ?? "county"}
                    type="text"
                    disabled={disable}
                  />
                </div>
              </section>
              <section>
                <div
                  style={{
                    backgroundColor: disable
                      ? "rgba(255, 255, 255, 0.563)"
                      : "rgba(255, 255, 255, 0.963)",
                  }}
                  id={styles["phone-input"]}
                >
                  <SiFreelancermap />
                  <input
                    value={country}
                    onChange={(e) => {
                      setCountry(e.target.value);
                    }}
                    name={"country"}
                    placeholder={admin?.address?.country ?? "country"}
                    type="text"
                    disabled={disable}
                  />
                </div>
              </section>
              <section>
                <div
                  style={{
                    backgroundColor: disable
                      ? "rgba(255, 255, 255, 0.563)"
                      : "rgba(255, 255, 255, 0.963)",
                  }}
                  id={styles["phone-input"]}
                >
                  <RiLandscapeFill />
                  <input
                    value={state}
                    onChange={(e) => {
                      setState(e.target.value);
                    }}
                    name={"state"}
                    placeholder={admin?.address?.state ?? "state"}
                    type="text"
                    disabled={disable}
                  />
                </div>
              </section>
            </fieldset>
          </section>
        </div>
      </div>
      <button
        type="button"
        className={`${styles["scroll-button"]} ${styles["scroll-up"]}`}
        onClick={scrollUp}
      >
        <MdKeyboardArrowUp size={16} />
      </button>
      <button
        type="button"
        className={`${styles["scroll-button"]} ${styles["scroll-down"]}`}
        onClick={scrollDown}
      >
        <MdKeyboardArrowDown size={16} />
      </button>
      <section className={styles["action-buttons"]}>
        <button
          type="button"
          className={styles["action-button"]}
          onClick={() => {
            setDisable((prev) => !prev);
          }}
        >
          <MdEdit size={18} />
        </button>
        <button
          type="button"
          className={styles["action-button"]}
          disabled={disable || !isFormValid}
          onClick={async () => {
            if (!disable && isFormValid)
              toast.promise(handleUpdate(), {
                loading: "updating...",
                success: "Profile Updated!",
                error: "Updation failed!",
              });
          }}
        >
          <IoIosPersonAdd size={18} />
        </button>
      </section>
    </form>
  );
};

export default ProfileManager;
