import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import "./ProfilePage.css";

function ProfilePage() {

  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  useEffect(() => {
    if (!storedUser) {
      navigate("/", { replace: true });
    }
  }, [navigate, storedUser]);

  const [error, setError] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);      
  const [user, setUser] = useState(storedUser);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: storedUser?.name || "",
    phone: storedUser?.phone || "",
    address: storedUser?.address || ""
  });

  const [originalData, setOriginalData] = useState({
  name: storedUser?.name || "",
  phone: storedUser?.phone || "",
  address: storedUser?.address || ""
  });

  if (!user) {
    return null;
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdate = (e) => {

  e.preventDefault();

  setError("");

  if(formData.name.trim() === ""){
    setError("Name cannot be empty.");
    return;
  }

  if(formData.phone !== ""){

    if(!/^[0-9]+$/.test(formData.phone)){
      setError("Phone number must contain digits only.");
      return;
    }


    if(formData.phone.length !== 11){
      setError("Phone number must be exactly 11 digits.");
      return;
    }

  }

  const hasChanged =
  formData.name.trim() !== originalData.name.trim() ||
  formData.phone !== originalData.phone ||
  formData.address.trim() !== originalData.address.trim();


  if(!hasChanged){

    setError(
      "No changes detected. Please modify your information before updating."
    );

    return;

  }

  setShowConfirmModal(true);

};

const confirmUpdate = async () => {

  setShowConfirmModal(false);


  try {

    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/update_profile.php`,
      {
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify({

          role:user.role,
          reference_id:user.reference_id,
          name:formData.name.trim(),
          phone:formData.phone,
          address:formData.address

        })
      }
    );


    const data = await response.json();


    if(data.success){

      const updatedUser = {
        ...user,
        name:formData.name,
        phone:formData.phone,
        address:formData.address
      };


      localStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );


      setUser(updatedUser);

      setOriginalData({
        name:formData.name,
        phone:formData.phone,
        address:formData.address
      });

      setShowSuccessModal(true);
    }
    else{

      setShowModal(true);

      setError(
        data.message || "Profile update failed."
      );

    }


  }
  catch(error){

    setError(
      "Server error. Please try again later."
    );

  }

};

  return (
    <div className="app-wrapper">
      <Navbar />

      <div className="content-wrapper">
        <div className="profile-container">
          <div className="profile-card">
            <h2>My Profile</h2>

            <div className="profile-info">
              <p><strong>Name:</strong> <span>{user.name}</span></p>
              <p><strong>Email:</strong> <span>{user.email}</span></p>
              <p><strong>Phone:</strong> <span>{user.phone || "Not Provided"}</span></p>
              <p><strong>Address:</strong> <span>{user.address || "Not Provided"}</span></p>
              <p><strong>Role:</strong> <span>{user.role}</span></p>
            </div>

            <button 
              className="edit-btn" 
              onClick={() => {

                setError("");

                setFormData({
                  name:user.name || "",
                  phone:user.phone || "",
                  address:user.address || ""
                });

                setOriginalData({
                  name:user.name || "",
                  phone:user.phone || "",
                  address:user.address || ""
                });

                setShowModal(true);

              }}
              >
              Update Profile
              </button>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Edit Profile</h3>

            <form onSubmit={handleUpdate}>
              {
                error && 
                <div className="error-message">
                    {error}
                </div>
                }

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Name"
                required
              />

              <input

                type="text"

                name="phone"

                value={formData.phone}

                maxLength="11"

                onChange={(e)=>{

                  const value=e.target.value;

                  if(/^\d*$/.test(value)){
                      setFormData({
                        ...formData,
                        phone:value
                      });
                  }

                }}

                placeholder="Phone"

                />

              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Address"
              />

              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit">
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {
        showConfirmModal && (

        <div className="modal-overlay">

        <div className="confirm-modal">

        <h3>
        Confirm Update
        </h3>


        <p>
        Are you sure you want to update your profile?
        <br/>
        Please make sure all information is correct.
        </p>


        <div className="modal-actions">

        <button
        onClick={()=>setShowConfirmModal(false)}
        >
        Cancel
        </button>


        <button
        className="confirm-btn"
        onClick={confirmUpdate}
        >
        Yes, Update
        </button>


        </div>

        </div>

        </div>

        )
        }

        {
          showSuccessModal && (

          <div className="modal-overlay">

          <div className="success-modal">


          <div className="success-icon">
          ✓
          </div>


          <h3>
          Profile Updated!
          </h3>


          <p>
          Your profile information has been updated successfully.
          </p>


          <button
          onClick={()=>{

          setShowSuccessModal(false);
          setShowModal(false);

          }}
          >
          OK
          </button>


          </div>

          </div>

          )
          }

      <Footer />
    </div>
  );
}

export default ProfilePage;