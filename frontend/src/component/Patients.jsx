import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Patients.css";
import Menu from "./Menu";
import checkmarkIcon from "./png/checkmark.png";

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
    pAdd: "",

    pLat: null,
    pLng: null,
  });

  const handleChange = (e) => {
    const { name, value, maxLength } = e.target;
    if (
      ["birthPart1", "birthPart2", "phonePart1", "phonePart2", "phonePart3"].includes(name)
    ) {
      const onlyNums = value.replace(/\D/g, "");
      setFormData(prev => ({
        ...prev,
        [name]: onlyNums.slice(0, maxLength),
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
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
        const zonecode = data.zonecode;
        const baseAddr = data.address;

        setFormData(prev => ({
          ...prev,
          postcode: zonecode,
          address: baseAddr,
          pAdd: `${zonecode} ${baseAddr} ${prev.detailAddress}`.trim(),
        }));

        const geocoder = new window.daum.maps.services.Geocoder();
        geocoder.addressSearch(baseAddr, (result, status) => {
          if (status === window.daum.maps.services.Status.OK) {
            const { x, y } = result[0];
            console.log("브라우저 지오코딩:", { x, y });

            setFormData(prev => ({
              ...prev,
              pLat: y,
              pLng: x,
            }));
          } else {
            console.warn("주소→좌표 변환 실패");
            setFormData(prev => ({
              ...prev,
              pLat: null,
              pLng: null
            }));
          }
        });
      }
    }).open();
  };

  const [showSuccessModal, setShowSuccessModal] = useState(false); // ✅ 환자 등록 완료 모달 상태 추가
  const [hideSuccessModal, setHideSuccessModal] = useState(false); // ✅ 숨김 애니메이션 상태 추가
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newBirth = `${formData.birthPart1}-${formData.birthPart2}`;
    const newTel = `${formData.phonePart1}-${formData.phonePart2}-${formData.phonePart3}`;
    const newPAdd = `${formData.postcode} ${formData.address} ${formData.detailAddress}`.trim();

    const sendData = {
      pName: formData.pName,
      gender: formData.gender,
      birth: newBirth,
      tel: newTel,
      pAdd: newPAdd,
      pLat: formData.pLat,
      pLng: formData.pLng,
    };

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_DB_URL}/patients/register`,
        sendData
      );
      if (res.status === 200) {
        setShowSuccessModal(true); // ✅ 모달 표시

        setTimeout(() => {
          setHideSuccessModal(true); // ✅ 숨김 애니메이션 적용
          setTimeout(() => {
            navigate("/main"); // ✅ 모달이 사라진 후 페이지 이동
            setShowSuccessModal(false);
            setHideSuccessModal(false);
          }, 300); // ✅ 애니메이션 지속 시간 후 제거
        }, 1500); // ✅ 1.5초 후 모달 숨김 시작
      }
    } catch (err) {
      console.error(err);
      alert("등록 실패");
    }
  };

  // ✅ 모달 수동 닫기 함수
  const closeSuccessModal = () => {
    setHideSuccessModal(true); // ✅ 숨김 애니메이션 적용
    setTimeout(() => {
      navigate("/main"); // ✅ 모달이 사라진 후 페이지 이동
      setShowSuccessModal(false);
      setHideSuccessModal(false);
    }, 300);
  };
  return (
    <form onSubmit={handleSubmit}>
      <Menu />
      <div className="Patient-container">
        <button className="patients-close-btn" onClick={() => navigate("/main")}>X</button>
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
                className="patient-postcode-search-button"
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
      {showSuccessModal && (
        <div className="patient-success-modal-overlay" onClick={closeSuccessModal}>
          <div className={`patient-success-modal ${hideSuccessModal ? "hide" : ""}`}>
            <img src={checkmarkIcon} alt="완료" className="patient-success-icon" /> {/* ✅ 체크마크 아이콘 추가 */}
            <p>환자 등록이 완료되었습니다.</p>
          </div>
        </div>
      )}


    </form>

  );
}

export default Patients;