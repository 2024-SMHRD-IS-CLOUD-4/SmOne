import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Patients.css";

function Patients() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    pName: "",
    gender: "",
    birthPart1: "",
    birthPart2: "",
    phonePart1: "",
    phonePart2: "",
    phonePart3: "",
    postcode: "",
    address: "",
    detailAddress: "",
  });

  const handleChange = (e) => {
    const { name, value, maxLength } = e.target;
    const onlyNumbers = value.replace(/\D/g, ""); // 숫자 이외의 문자 제거
    setFormData({ ...formData, [name]: onlyNumbers.slice(0, maxLength) });
  };

  const handleNextFocus = (e, nextField) => {
    const { value, maxLength } = e.target;
    if (value.length === maxLength && nextField) {
      document.getElementsByName(nextField)[0].focus();
    }
  };

  const handleAddressSearch = () => {
    new window.daum.Postcode({
      oncomplete: (data) => {
        const pAdd = `${data.zonecode} ${data.address}`;
        setFormData({
          ...formData,
          postcode: data.zonecode,
          address: data.address,
          pAdd: `${pAdd} ${formData.detailAddress}`,
        });
      },
    }).open();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updatedFormData = {
      pName: formData.pName,
      gender: formData.gender,
      birth: `${formData.birthPart1}-${formData.birthPart2}`,
      tel: `${formData.phonePart1}-${formData.phonePart2}-${formData.phonePart3}`,
      pAdd: `${formData.postcode} ${formData.address} ${formData.detailAddress}`,
    };

    console.log("제출 데이터:", updatedFormData); // 확인용 로그

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_DB_URL}/patients/register`,
        updatedFormData,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      if (response.status === 200) {
        alert("환자 등록이 완료되었습니다.");
        navigate("/main");
      }
    } catch (error) {
      console.error("환자 등록 에러:", error);
      alert("환자 등록 중 오류가 발생했습니다.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="Patient-container">
         {/* 🔙 뒤로가기 버튼 추가 */}
       <button className="back-btn" onClick={() => navigate(-1)}>X</button>
        <div className="form-wrapper">
          <h1 className="patient-title">환자 등록</h1>

          <div className="name-and-gender-group">
            <div className="name-group">
              <label>이름</label>
              <input
                type="text"
                name="pName"
                className="patient-name"
                placeholder="환자 이름"
                value={formData.pName}
                onChange={(e) => setFormData({ ...formData, pName: e.target.value })}
                required
              />
            </div>
            <div className="gender-group">
              <label></label>
              <div className="radio-group">
                <span
                  className={`radio ${formData.gender === "남" ? "selected" : ""}`}
                  onClick={() => setFormData({ ...formData, gender: "남" })}
                >
                  남
                </span>
                <span
                  className={`radio ${formData.gender === "여" ? "selected" : ""}`}
                  onClick={() => setFormData({ ...formData, gender: "여" })}
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
                name="birthPart1"
                className="resident-number-box"
                placeholder="앞 6자리"
                value={formData.birthPart1}
                onChange={handleChange}
                onInput={(e) => handleNextFocus(e, "birthPart2")}
                maxLength="6"
                required
              />
              <span className="resident-number-dash">-</span>
              <input
                type="text"
                name="birthPart2"
                className="resident-number-box"
                placeholder="뒤 7자리"
                value={formData.birthPart2}
                onChange={handleChange}
                maxLength="7"
                required
              />
            </div>
          </div>

          <div className="phone-number-group">
            <label>전화번호</label>
            <div className="phone-number-container">
              <input
                type="text"
                name="phonePart1"
                className="phone-number-box"
                placeholder="010"
                value={formData.phonePart1}
                onChange={handleChange}
                onInput={(e) => handleNextFocus(e, "phonePart2")}
                maxLength="3"
                required
              />
              <span className="phone-number-dash">-</span>
              <input
                type="text"
                name="phonePart2"
                className="phone-number-box"
                placeholder="0000"
                value={formData.phonePart2}
                onChange={handleChange}
                onInput={(e) => handleNextFocus(e, "phonePart3")}
                maxLength="4"
                required
              />
              <span className="phone-number-dash">-</span>
              <input
                type="text"
                name="phonePart3"
                className="phone-number-box"
                placeholder="0000"
                value={formData.phonePart3}
                onChange={handleChange}
                maxLength="4"
                required
              />
            </div>
          </div>

          <div className="address-group">
            <label>우편번호</label>
            <div className="postcode-wrapper">
              <input
                type="text"
                name="postcode"
                className="postcode-field"
                placeholder="우편번호"
                value={formData.postcode}
                readOnly
                required
              />
              <button
                type="button"
                className="postcode-search-button"
                onClick={handleAddressSearch}
              >
                검색
              </button>
            </div>
            <input
              type="text"
              name="address"
              className="address-field"
              placeholder="주소"
              value={formData.address}
              readOnly
              required
            />
            <input
              type="text"
              name="detailAddress"
              className="address-field"
              placeholder="상세주소"
              value={formData.detailAddress}
              onChange={(e) =>
                setFormData({ ...formData, detailAddress: e.target.value })
              }
            />
          </div>

          <button type="submit" className="submit-button">
            환자 등록
          </button>
        </div>
      </div>
    </form>
  );
}

export default Patients;
