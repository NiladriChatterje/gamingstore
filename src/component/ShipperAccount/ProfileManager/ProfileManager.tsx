import { useEffect, useRef, useState } from "react";
import styles from "./ProfileManager.module.css";
import { MdEdit, MdMyLocation } from "react-icons/md";
import { FaPhone, FaUser, FaCity } from "react-icons/fa6";
import { IoIosPersonAdd } from "react-icons/io";
import { MdOutlineMarkEmailUnread, MdSignpost } from "react-icons/md";
import { SiFreelancermap } from "react-icons/si";
import { RiLandscapeFill } from "react-icons/ri";
import { useUser, useAuth } from "@clerk/clerk-react";
import axios from "axios";
import toast from "react-hot-toast";
import OTPModal from "./OTPModal";

const ProfileManager = ({ onProfileSaved }: { onProfileSaved?: () => void }) => {
  const { user } = useUser();
  const { getToken } = useAuth();

  const [disable, setDisable] = useState<boolean>(true);
  const [shippername, setShippername] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [pincode, setpinCode] = useState<string>("");
  const [county, setCounty] = useState<string>("");
  const [country, setCountry] = useState<string>("");
  const [state, setState] = useState<string>("");
  const [toggleCountryCode, setToggleCountryCode] = useState(false);
  const [fetchingAddress, setFetchingAddress] = useState(false);
  const [geoPrefilled, setGeoPrefilled] = useState(false);
  const [hasExistingProfile, setHasExistingProfile] = useState(false);
  const [geoLat, setGeoLat] = useState<number | null>(null);
  const [geoLng, setGeoLng] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const [OTP, setOTP] = useState<number>(0);
  const modalRef = useRef<HTMLDialogElement>(null);

  const shipperId = `shipper-${user?.id}`;

  // Fetch existing shipper data on mount
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const token = await getToken();
        const response = await fetch(
          `http://localhost:5001/fetch-shipper-data/${shipperId}`,
          {
            headers: { Accept: "application/json", Authorization: `Bearer ${token}` }
          }
        );
        if (response.ok) {
          const data = await response.json();
          if (data) {
            setShippername(data.shippername || user.firstName || "");
            setPhone(data.phone != null && data.phone !== 0 ? String(data.phone) : "");
            setEmail(data.email || user.emailAddresses[0]?.emailAddress || "");
            setpinCode(data.address?.pincode || "");
            setCounty(data.address?.county || "");
            setCountry(data.address?.country || "");
            setState(data.address?.state || "");
            // Determine if a full profile already exists (no need for geolocation fetch)
            const profileExists =
              data.phone != null && data.phone !== 0 &&
              data.address != null &&
              data.address.pincode?.trim().length > 0 &&
              data.address.county?.trim().length > 0 &&
              data.address.country?.trim().length > 0 &&
              data.address.state?.trim().length > 0;
            setHasExistingProfile(profileExists);
          } else {
            // No profile yet — prefill from Clerk
            setShippername(user.firstName || "");
            setEmail(user.emailAddresses[0]?.emailAddress || "");
          }
        }
      } catch (err) {
        console.error("Error fetching shipper data:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const isFormValid =
    shippername.trim().length > 0 &&
    phone.length === 10 &&
    email.trim().length > 0 &&
    pincode.trim().length > 0 &&
    county.trim().length > 0 &&
    country.trim().length > 0 &&
    state.trim().length > 0;

  // Reusable function: fetch current location via geolocation, then reverse-geocode via Geoapify
  async function fetchAddressFromGeolocation() {
    if (fetchingAddress) return;

    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported on this device or browser.");
      return;
    }

    setFetchingAddress(true);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 60000,
        });
      });

      const { latitude, longitude } = position.coords;
      // Store the coordinates so they get sent with the profile update
      setGeoLat(latitude);
      setGeoLng(longitude);

      // Retry reverse geocoding up to 3 times on failure
      const MAX_RETRIES = 3;
      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
          const response = await fetch(
            `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=${import.meta.env.VITE_GEOAPIFY_API}`,
            { headers: { Accept: "application/json" } }
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
          return; // Success — exit the retry loop
        } catch (geoCatch: any) {
          if (attempt < MAX_RETRIES) {
            console.log(`[ShipperProfileManager] reverse geocoding attempt ${attempt}/${MAX_RETRIES} failed, retrying...`);
            // Wait 1.5s before the next retry
            await new Promise(resolve => setTimeout(resolve, 1500));
          } else {
            // All retries exhausted — throw so the outer catch handles it
            throw geoCatch;
          }
        }
      }
    } catch (err: any) {
      if (err instanceof GeolocationPositionError) {
        switch (err.code) {
          case GeolocationPositionError.PERMISSION_DENIED:
            toast.error("Location access was denied. Please enable location permissions in your browser settings.");
            break;
          case GeolocationPositionError.TIMEOUT:
            toast.error("Location request timed out. Please try again.");
            break;
          case GeolocationPositionError.POSITION_UNAVAILABLE:
            toast.error("Your location could not be determined. Ensure GPS/Wi-Fi is enabled.");
            break;
          default:
            toast.error("Failed to get your location. Please try again.");
        }
      } else if (err instanceof TypeError || err.message?.includes("fetch")) {
        toast.error("Failed to fetch address details. Check your internet connection.");
      } else {
        console.log("[ShipperProfileManager] reverse geocoding failed after 3 attempts:", err);
        toast.error("Could not fetch address details. Please enter them manually.");
      }
    } finally {
      setFetchingAddress(false);
    }
  }

  async function onClickPhoneVerify() {
    try {
      const { data }: { data: { OTP: number } } = await axios.post(
        "http://localhost:5000/fetch-phone-otp",
        { recipient: phone }
      );
      if (data.OTP === -1) throw new Error("Resend!");
      setOTP(data.OTP);
      toast("OTP sent");
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  async function handleUpdate() {
    if (phone.length !== 10) {
      toast.error("Invalid phone number!");
      return Promise.reject();
    }

    try {
      const token = await getToken();

      const response = await fetch("http://localhost:5004/update-shipper-info", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          _id: shipperId,
          shippername,
          email,
          phone: Number(phone),
          geoPoint: geoLat != null && geoLng != null ? { lat: geoLat, lng: geoLng } : undefined,
          address: {
            pincode,
            county,
            country,
            state,
          },
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setDisable(true);
        toast.success("Profile updated successfully!");
        onProfileSaved?.();
        return Promise.resolve();
      } else {
        toast.error(result.error || "Failed to update profile");
        return Promise.reject(result.error);
      }
    } catch (err: any) {
      console.error("Error updating shipper profile:", err);
      toast.error("Something went wrong. Please try again.");
      return Promise.reject(err);
    }
  }

  if (loading) {
    return (
      <div className={styles.card}>
        <div className={styles["card-body"]} style={{ textAlign: "center", padding: "40px" }}>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <div className={styles["card-header"]}>
        <h2>Profile Settings</h2>
        <p>Manage your account details and address information.</p>
      </div>

      <div className={styles["card-body"]}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!disable && isFormValid) {
              toast.promise(handleUpdate(), {
                loading: "Updating...",
                success: "Profile Updated!",
                error: "Update failed!",
              });
            }
          }}
          id={styles["form-container"]}
        >
          {/* Shipper Name */}
          <div className={styles["field-group"]}>
            <label className={styles["field-label"]}>Full Name</label>
            <div className={`${styles["input-wrapper"]} ${disable ? styles.disabled : ""}`}>
              <FaUser className={styles["input-icon"]} />
              <input
                name="shippername"
                value={shippername}
                onChange={(e) => setShippername(e.target.value)}
                placeholder={user?.firstName ?? "Shipper name"}
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
                placeholder="xxx-xxx-xxxx"
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
                placeholder="example@domain.com"
                readOnly
              />
            </div>
          </div>

          {/* Address */}
          <div className={styles["address-section"]}>
            <h3 className={styles["address-title"]}>Address</h3>

            {!disable && !hasExistingProfile && (
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
                    placeholder="PIN code"
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
                    placeholder="County / District"
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
                    placeholder="Country"
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
                    placeholder="State"
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
