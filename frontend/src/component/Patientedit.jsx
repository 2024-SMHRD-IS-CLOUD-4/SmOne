import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./PatientJoin.css";
import "./Main.css";

function Patientedit() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    pName: "",
    gender: "남",
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
    const onlyNumbers = value.replace(/\D/g, "");
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
        setFormData({
          ...formData,
          postcode: data.zonecode,
          address: data.address,
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

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_DB_URL}/patients/update`,
        updatedFormData,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      if (response.status === 200) {
        alert("환자 정보가 수정되었습니다.");
        navigate("/Patientedit");
      }
    } catch (error) {
      alert("환자 정보 수정 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="main-container">
      {/* 배경 영상 */}
      <video className="video-background" autoPlay loop muted>
        <source src="/path-to-video.mp4" type="video/mp4" />
      </video>

      {/* 검색 바 */}
      <div className="search-bar">
        <input
          type="text"
          className="search-input1"
          placeholder="이름을 입력하세요"
        />
        <input
          type="text"
          className="search-input2"
          placeholder="생년월일 6자리를 입력하세요"
        />
        <button className="search-button">검색</button>
      </div>

      {/* 왼쪽 사이드바 */}
      <div className="left-sidebar">
        <div className="logo">
          <h1>I LUNG VIEW</h1>
          <p>스마트인재개발원</p>
        </div>
        <div className="patient-list-container">
          <h3 className="patient-list-title">환자 리스트</h3>
          <ul className="patient-list">
            <li className="patient-item">김철수 | 900101 | 010-1234-5678</li>
            <li className="patient-item">이영희 | 900102 | 010-5678-1234</li>
            <li className="patient-item">박민수 | 900103 | 010-4321-8765</li>
          </ul>
        </div>
        <div className="patient-info-container">
          <h3>환자 정보</h3>
          <p>환자 번호: 001</p>
          <p>환자 성명: 김지수</p>
          <p>생년월일: 920208</p>
          <p>연락처: 010-2188-7111</p>
          <p>주소: 광주광역시 동구 중앙로 196</p>
          <button className="edit-patient-button">환자 수정</button>
        </div>
      </div>

      {/* 중앙 콘텐츠 */}
      <div className="form-wrapper">
        <h1 className="patient-title">환자 수정</h1>
        <div className="form-content">
          <div className="name-and-gender-group">
            <input
              type="text"
              name="pName"
              className="patient-name"
              placeholder="환자 이름"
              value={formData.pName}
              onChange={(e) => setFormData({ ...formData, pName: e.target.value })}
            />
            <div className="gender-group">
              <button
                className={`gender-button ${formData.gender === "남" ? "active" : ""}`}
                onClick={() => setFormData({ ...formData, gender: "남" })}
              >
                남
              </button>
              <button
                className={`gender-button ${formData.gender === "여" ? "active" : ""}`}
                onClick={() => setFormData({ ...formData, gender: "여" })}
              >
                여
              </button>
            </div>
          </div>
          <div className="resident-number-group">
            <input
              type="text"
              name="birthPart1"
              className="resident-number-box"
              placeholder="앞 6자리"
              value={formData.birthPart1}
              onChange={handleChange}
              maxLength="6"
              onInput={(e) => handleNextFocus(e, "birthPart2")}
            />
            -
            <input
              type="text"
              name="birthPart2"
              className="resident-number-box"
              placeholder="뒤 7자리"
              value={formData.birthPart2}
              onChange={handleChange}
              maxLength="7"
            />
          </div>
          <div className="phone-number-group">
            <input
              type="text"
              name="phonePart1"
              className="phone-number-box"
              placeholder="010"
              value={formData.phonePart1}
              onChange={handleChange}
              maxLength="3"
              onInput={(e) => handleNextFocus(e, "phonePart2")}
            />
            -
            <input
              type="text"
              name="phonePart2"
              className="phone-number-box"
              placeholder="0000"
              value={formData.phonePart2}
              onChange={handleChange}
              maxLength="4"
              onInput={(e) => handleNextFocus(e, "phonePart3")}
            />
            -
            <input
              type="text"
              name="phonePart3"
              className="phone-number-box"
              placeholder="0000"
              value={formData.phonePart3}
              onChange={handleChange}
              maxLength="4"
            />
          </div>
          <div className="address-group">
            <input
              type="text"
              name="postcode"
              className="postcode-field"
              placeholder="우편번호"
              value={formData.postcode}
              readOnly
            />
            <button
              type="button"
              className="postcode-search-button"
              onClick={handleAddressSearch}
            >
              검색
            </button>
            <input
              type="text"
              name="address"
              className="address-field"
              placeholder="주소"
              value={formData.address}
              readOnly
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
          <button className="submit-button" onClick={handleSubmit}>수정 완료</button>
        </div>
      </div>
    </div>
  );
}

export default Patientedit;
