import { useEffect, useRef, useState } from "react";
import styles from "./ProfileManager.module.css";
import { MdEdit } from "react-icons/md";
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
  onSave?: () => void;
}

const ProfileManager = ({ onboarding, onSave }: ProfileManagerProps) => {
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

  // Derived: the effective username — prefer admin's stored name, but never show 'Unknown'
  // (SubscriptionConsumers may create a placeholder row with username='Unknown' before
  //  CreateAdminConsumer has processed the full profile, so fall back to Clerk's firstName).
  const effectiveUsername = (admin?.username && admin.username !== 'Unknown')
    ? admin.username
    : (user?.firstName ?? '');

  // Sync form fields when admin or user data loads asynchronously
  useEffect(() => {
    setUsername(prev => effectiveUsername || prev);
    setGstin(prev => admin?.gstin ?? prev);
    setpinCode(prev => admin?.address?.pincode ?? prev);
    setCounty(prev => admin?.address?.county ?? prev);
    setState(prev => admin?.address?.state ?? prev);
    setCountry(prev => admin?.address?.country ?? prev);
    setEmail(prev => user?.emailAddresses[0]?.emailAddress ?? admin?.email ?? prev);
    setPhone(prev => admin?.phone != null ? String(admin.phone) : prev);
  }, [admin, user, effectiveUsername]);

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
          email: user?.emailAddresses[0]?.emailAddress ?? email,
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
          email: user?.emailAddresses[0]?.emailAddress ?? email,
          address: {
            pincode,
            county,
            country,
            state,
          },
        }));
        // Notify parent (AdminAccount) that profile was saved successfully
        onSave?.();
      }
      return Promise.resolve();
    } catch (err) {
      console.log(err);
      return Promise.reject();
    }
  }
  return (
    <div className={styles.card}>
      {onboarding && (
        <div className={styles["onboarding-banner"]}>
          <h2>Complete Your Profile</h2>
          <p>Please fill in your address, phone number, and GSTIN before you can access the dashboard.</p>
        </div>
      )}

      {!onboarding && (
        <div className={styles["card-header"]}>
          <h2>Profile Settings</h2>
          <p>Manage your account details and address information.</p>
        </div>
      )}

      <div className={styles["card-body"]}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleUpdate();
          }}
          id={styles["form-container"]}
        >
          {/* Username */}
          <div className={styles["field-group"]}>
            <label className={styles["field-label"]}>Full Name</label>
            <div className={`${styles["input-wrapper"]} ${disable ? styles.disabled : ""}`}>
              <FaUser className={styles["input-icon"]} />
              <input
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={user?.firstName ?? ""}
                disabled={disable}
              />
            </div>
          </div>

          {/* GSTIN */}
          <div className={styles["field-group"]}>
            <label className={styles["field-label"]}>GSTIN</label>
            <div className={`${styles["input-wrapper"]} ${disable ? styles.disabled : ""}`}>
              <FaFileInvoiceDollar className={styles["input-icon"]} />
              <input
                name="gstin"
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                placeholder="GSTIN"
                type="text"
                maxLength={15}
                minLength={15}
                disabled={disable}
              />
            </div>
          </div>

          {/* Phone */}
          <div className={styles["field-group"]}>
            <label className={styles["field-label"]}>Phone Number</label>
            <div className={`${styles["input-wrapper"]} ${disable ? styles.disabled : ""}`}>
              <div className={styles["phone-country-code"]}>
                <FaPhone
                  className={styles["input-icon"]}
                  cursor="pointer"
                  onClick={() => {
                    if (!disable) setToggleCountryCode((prev) => !prev);
                  }}
                />
                {!disable && (
                  <div className={`${styles["country-dropdown"]} ${toggleCountryCode ? "" : styles.hidden}`}>
                    <dl onClick={() => setToggleCountryCode(false)}>(+91)IN</dl>
                    <dl onClick={() => setToggleCountryCode(false)}>(+144)US</dl>
                    <dl onClick={() => setToggleCountryCode(false)}>(+92)PAK</dl>
                  </div>
                )}
              </div>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                name="phone"
                placeholder={admin?.phone as unknown as string ?? "xxx-xxx-xxxx"}
                type="tel"
                maxLength={10}
                minLength={10}
                disabled={disable}
                required
              />
            </div>
            <div className={styles["verify-btn-row"]}>
              <span
                className={styles["verify-btn"]}
                onClick={() => {
                  if (!disable) {
                    onClickPhoneVerify();
                    modalRef?.current?.showModal();
                  }
                }}
              >
                Verify Phone
              </span>
            </div>
            <OTPModal OTP={OTP} ref={modalRef} />
          </div>

          {/* Email */}
          <div className={styles["field-group"]}>
            <label className={styles["field-label"]}>Email</label>
            <div className={`${styles["input-wrapper"]} ${styles.disabled}`}>
              <MdOutlineMarkEmailUnread className={styles["input-icon"]} />
              <input
                value={email}
                name="email"
                placeholder={admin?.email ?? user?.emailAddresses[0]?.emailAddress ?? "example@domain.com"}
                readOnly
              />
            </div>
          </div>

          {/* Address */}
          <div className={styles["address-section"]}>
            <h3 className={styles["address-title"]}>Address</h3>

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

            <div className={styles["address-grid"]}>
              <div className={styles["field-group"]}>
                <label className={styles["field-label"]}>PIN Code</label>
                <div className={`${styles["input-wrapper"]} ${disable ? styles.disabled : ""}`}>
                  <MdSignpost className={styles["input-icon"]} />
                  <input
                    value={pincode}
                    onChange={(e) => setpinCode(e.target.value)}
                    name="pincode"
                    placeholder={admin?.address?.pincode ?? "PIN code"}
                    maxLength={6}
                    type="text"
                    disabled={disable}
                  />
                </div>
              </div>

              <div className={styles["field-group"]}>
                <label className={styles["field-label"]}>County / District</label>
                <div className={`${styles["input-wrapper"]} ${disable ? styles.disabled : ""}`}>
                  <FaCity className={styles["input-icon"]} />
                  <input
                    value={county}
                    onChange={(e) => setCounty(e.target.value)}
                    name="county"
                    placeholder={admin?.address?.county ?? "county"}
                    type="text"
                    disabled={disable}
                  />
                </div>
              </div>

              <div className={styles["field-group"]}>
                <label className={styles["field-label"]}>Country</label>
                <div className={`${styles["input-wrapper"]} ${disable ? styles.disabled : ""}`}>
                  <SiFreelancermap className={styles["input-icon"]} />
                  <input
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    name="country"
                    placeholder={admin?.address?.country ?? "country"}
                    type="text"
                    disabled={disable}
                  />
                </div>
              </div>

              <div className={styles["field-group"]}>
                <label className={styles["field-label"]}>State</label>
                <div className={`${styles["input-wrapper"]} ${disable ? styles.disabled : ""}`}>
                  <RiLandscapeFill className={styles["input-icon"]} />
                  <input
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    name="state"
                    placeholder={admin?.address?.state ?? "state"}
                    type="text"
                    disabled={disable}
                  />
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      <div className={styles["card-footer"]}>
        <button
          type="button"
          className={`${styles["action-btn"]} ${styles["edit-btn"]}`}
          onClick={() => setDisable((prev) => !prev)}
        >
          <MdEdit size={16} />
          {disable ? "Edit" : "Cancel"}
        </button>
        <button
          type="button"
          className={`${styles["action-btn"]} ${styles["save-btn"]}`}
          disabled={disable || !isFormValid}
          onClick={async () => {
            if (!disable && isFormValid)
              toast.promise(handleUpdate(), {
                loading: "Updating...",
                success: "Profile Updated!",
                error: "Update failed!",
              });
          }}
        >
          <IoIosPersonAdd size={16} />
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default ProfileManager;
