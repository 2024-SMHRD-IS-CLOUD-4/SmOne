import React, { useState } from "react";
import "./PatientJoin.css";
import DaumPostcode from "react-daum-postcode";

const PatientJoin = () => {
  const [formData, setFormData] = useState({
    name: "", // 이름 추가
    gender: "",
    residentNumber: "",
    phoneNumber: "",
    email: "",
    postalCode: "",
    address: "",
  });
  const [isPostcodeOpen, setIsPostcodeOpen] = useState(false);
  const [focusedField, setFocusedField] = useState("");

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleGenderSelect = (gender) => {
    setFormData((prev) => ({ ...prev, gender }));
  };

  const handlePostcodeComplete = (data) => {
    const fullAddress = data.address;
    const postalCode = data.zonecode;
    setFormData((prev) => ({
      ...prev,
      postalCode,
      address: fullAddress,
    }));
    setIsPostcodeOpen(false);
  };

  return (
    <div className="Patient-container">
      <div className="form-wrapper">
        <h1 className="title">PATIENT</h1>

        <div className="name-and-gender-group">
          <div className="name-group">
            <label>이름</label>
            <input
              type="text"
              className="patient-name"
              value={formData.name || ""}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="이름 입력"
            />
          </div>
          <div className="gender-group">
            <label>성별</label>
            <div className="radio-group">
              <span
                className={`radio ${formData.gender === "남" ? "selected" : ""}`}
                onClick={() => handleGenderSelect("남")}
              >
                남
              </span>
              <span
                className={`radio ${formData.gender === "여" ? "selected" : ""}`}
                onClick={() => handleGenderSelect("여")}
              >
                여
              </span>
            </div>
          </div>
        </div>

        <div className="resident-number-group">
  <label>주민번호</label>
  <div className="resident-number-container">
    <input
      type="text"
      className="resident-number-box"
      maxLength="6"
      value={formData.residentNumberPart1 || ""}
      onChange={(e) => handleInputChange("residentNumberPart1", e.target.value)}
    />
    <span className="resident-number-dash">-</span>
    <input
      type="text"
      className="resident-number-box"
      maxLength="7"
      value={formData.residentNumberPart2 || ""}
      onChange={(e) => handleInputChange("residentNumberPart2", e.target.value)}
    />
  </div>
</div>
        <div className="phone-number-group">
  <label>전화번호</label>
  <div className="phone-number-container">
    <input
      type="text"
      className="phone-number-box"
      maxLength="3"
      placeholder="010"
      value={formData.phoneNumberPart1 || ""}
      onChange={(e) => handleInputChange("phoneNumberPart1", e.target.value)}
    />
    <span className="phone-number-dash">-</span>
    <input
      type="text"
      className="phone-number-box"
      maxLength="4"
      value={formData.phoneNumberPart2 || ""}
      onChange={(e) => handleInputChange("phoneNumberPart2", e.target.value)}
    />
    <span className="phone-number-dash">-</span>
    <input
      type="text"
      className="phone-number-box"
      maxLength="4"
      value={formData.phoneNumberPart3 || ""}
      onChange={(e) => handleInputChange("phoneNumberPart3", e.target.value)}
    />
  </div>
</div>


        <div className="email-group">
          <label>이메일</label>
          <div
            className="field"
            contentEditable
            onFocus={() => setFocusedField("email")}
            onBlur={() => setFocusedField("")}
            onInput={(e) =>
              handleInputChange("email", e.currentTarget.textContent)
            }
          >
            {focusedField === "email" ? "" : formData.email || "이메일 입력"}
          </div>
        </div>

        <div className="address-group">
          <label>주소</label>
          <div className="postcode-wrapper">
            <input
              type="text"
              className="postcode-field"
              value={formData.postalCode}
              onChange={(e) => handleInputChange("postalCode", e.target.value)}
              placeholder="우편번호"
            />
            <button
              className="postcode-search-button"
              onClick={() => setIsPostcodeOpen((prev) => !prev)}
            >
              우편번호 검색
            </button>
          </div>
          {isPostcodeOpen && (
            <DaumPostcode
              onComplete={handlePostcodeComplete}
              autoClose={false}
              style={{ width: "100%", height: "400px" }}
            />
          )}
          <input
            type="text"
            className="address-field"
            value={formData.address}
            onChange={(e) => handleInputChange("address", e.target.value)}
            placeholder="상세주소 입력"
          />
        </div>

        <button
          className="submit-button"
          onClick={() => alert(JSON.stringify(formData, null, 2))}
        >
          환자 등록
        </button>
      </div>
    </div>
  );
};

export default PatientJoin;
