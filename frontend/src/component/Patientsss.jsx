import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./PatientJoin.css";

function Patients() {
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
    pAdd: "",
  });

  // 입력값 변경 핸들러
  const handleChange = (e) => {
    const { name, value, maxLength } = e.target;
    const onlyNumbers = value.replace(/\D/g, ""); // 숫자 이외의 문자 제거
    setFormData({ ...formData, [name]: onlyNumbers.slice(0, maxLength) });
  };

  // 입력 완료 시 다음 필드로 포커스 이동
  const handleNextFocus = (e, nextField) => {
    const { value, maxLength } = e.target;
    if (value.length === maxLength && nextField) {
      document.getElementsByName(nextField)[0].focus();
    }
  };

  // 주소 검색 핸들러
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

  // 환자 등록 요청 핸들러
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
        "http://localhost:8090/SmOne/api/patients/register",
        updatedFormData,
        {
          headers: {
            "Content-Type": "application/json",
          },
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
    <div className="Patients-container">
      <form onSubmit={handleSubmit}>
          <h2>환자 등록</h2>
          <div>
            <label>이름</label>
            <input
              type="text"
              name="pName"
              className="patient-name"
              placeholder="환자 이름"
              value={formData.pName}
              onChange={(e) => setFormData({ ...formData, pName: e.target.value })}
            />
            <div>
              <label>성별</label>
              <input
                type="radio"
                name="gender"
                value="남"
                checked={formData.gender === "남"}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              />
              남
              <input
                type="radio"
                name="gender"
                value="여"
                checked={formData.gender === "여"}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              />
              여
            </div>
            <div>
              <label>주민번호</label>
              <div style={{ display: "flex", gap: "5px" }}>
                <input
                  type="text"
                  name="birthPart1"
                  placeholder="앞 6자리"
                  value={formData.birthPart1}
                  onChange={handleChange}
                  onInput={(e) => handleNextFocus(e, "birthPart2")}
                  maxLength="6"
                  required
                />
                <span>-</span>
                <input
                  type="text"
                  name="birthPart2"
                  placeholder="뒤 7자리"
                  value={formData.birthPart2}
                  onChange={handleChange}
                  maxLength="7"
                  required
                />
              </div>
            </div>
            <div>
              <label>전화번호</label>
              <div style={{ display: "flex", gap: "5px" }}>
                <input
                  type="text"
                  name="phonePart1"
                  placeholder="000"
                  value={formData.phonePart1}
                  onChange={handleChange}
                  onInput={(e) => handleNextFocus(e, "phonePart2")}
                  maxLength="3"
                  required
                />
                <span>-</span>
                <input
                  type="text"
                  name="phonePart2"
                  placeholder="0000"
                  value={formData.phonePart2}
                  onChange={handleChange}
                  onInput={(e) => handleNextFocus(e, "phonePart3")}
                  maxLength="4"
                  required
                />
                <span>-</span>
                <input
                  type="text"
                  name="phonePart3"
                  placeholder="0000"
                  value={formData.phonePart3}
                  onChange={handleChange}
                  maxLength="4"
                  required
                />
              </div>
            </div>
            <div>
              <label>우편번호</label>
              <input
                type="text"
                name="postcode"
                placeholder="우편번호"
                value={formData.postcode}
                readOnly
                required
              />
              <button type="button" onClick={handleAddressSearch}>
                검색
              </button>
            </div>
            <div>
              <label>주소</label>
              <input
                type="text"
                name="address"
                placeholder="주소"
                value={formData.address}
                readOnly
                required
              />
            </div>
            <div>
              <label>상세주소</label>
              <input
                type="text"
                name="detailAddress"
                placeholder="상세주소"
                value={formData.detailAddress}
                onChange={(e) =>
                  setFormData({ ...formData, detailAddress: e.target.value })
                }
                required
              />
            </div>
            <button type="submit">환자 등록</button>
          </div>
      </form>
    </div>
  );
}

export default Patients;