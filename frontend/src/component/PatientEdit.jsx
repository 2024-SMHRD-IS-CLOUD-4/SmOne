import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import "./PatientEdit.css";
import Menu from "./Menu";

function PatientEdit() {
  const { pIdx } = useParams();
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

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_DB_URL}/patients`)
      .then((res) => {
        const found = res.data.find((p) => p.pIdx === parseInt(pIdx, 10));
        if (!found) {
          alert("해당 환자를 찾을 수 없습니다.");
          navigate("/main");
          return;
        }

        let [birthFront, birthBack] = ["", ""];
        if (found.birth && found.birth.includes("-")) {
          [birthFront, birthBack] = found.birth.split("-");
        }

        let [phone1, phone2, phone3] = ["", "", ""];
        if (found.tel && found.tel.includes("-")) {
          [phone1, phone2, phone3] = found.tel.split("-");
        }

        let post = "";
        let addr = "";
        let detail = "";
        const splitted = found.pAdd.trim().split(/\s+/);

        if (splitted[0] && /^\d{5}$/.test(splitted[0])) {
          post = splitted[0];
          splitted.shift();
        }

        const lastToken = splitted[splitted.length - 1];
        if (lastToken && /\d+(층|호)$/.test(lastToken)) {
          detail = lastToken;
          splitted.pop();
        }

        addr = splitted.join(" ");

        setFormData({
          pName: found.pName,
          gender: found.gender,
          birthPart1: birthFront,
          birthPart2: birthBack,
          phonePart1: phone1,
          phonePart2: phone2,
          phonePart3: phone3,
          postcode: post,
          address: addr,
          detailAddress: detail,
          pAdd: found.pAdd,
        });
      })
      .catch((err) => {
        console.error("환자 정보 로드 오류:", err);
        alert("오류가 발생했습니다.");
        navigate("/main");
      });
  }, [pIdx, navigate]);

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
        const addr = data.address;
        const zonecode = data.zonecode;

        setFormData(prev => ({
          ...prev,
          postcode: zonecode,
          address: addr,
          pAdd: `${zonecode} ${addr} ${prev.detailAddress}`.trim()
        }));

        const geocoder = new window.daum.maps.services.Geocoder();
        geocoder.addressSearch(addr, (result, status) => {
          if (status === window.daum.maps.services.Status.OK) {
            const { x, y } = result[0];
            console.log("브라우저측 좌표 변환 결과:", x, y);

            setFormData(prev => ({
              ...prev,
              pLat: y,
              pLng: x
            }));
          } else {
            console.warn("주소->좌표 변환 실패");
            setFormData(prev => ({
              ...prev,
              pLat: null,
              pLng: null
            }));
          }
        });
      },
    }).open();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { birthPart1, birthPart2, phonePart1, phonePart2, phonePart3 } = formData;

    const newBirth = `${birthPart1}-${birthPart2}`;
    const newTel   = `${phonePart1}-${phonePart2}-${phonePart3}`;
    const newPAdd  = `${formData.postcode} ${formData.address} ${formData.detailAddress}`.trim();

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
      await axios.put(`${process.env.REACT_APP_DB_URL}/patients/update/${pIdx}`, sendData);
      alert("환자 정보가 수정되었습니다.");
      navigate("/main");
    } catch (err) {
      console.error("환자 수정 오류:", err);
      alert("환자 정보 수정 중 오류가 발생했습니다.");
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <Menu />
        <div className='Patientedit-container'>
          <button
            className="back-btn"
            onClick={(e) => {
              e.preventDefault();
              navigate("/main");
            }}
          >
            X
          </button>

          <div className="form-wrapper">
            <h1 className="patient-title1">환자 정보 수정</h1>
            <div className="name-and-gender-group">
              <div className="name-group">
                <label>이름</label>
                <input
                  type="text"
                  name="pName"
                  className="patient-name"
                  placeholder="환자 이름"
                  value={formData.pName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
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
              <div className="resident-number-container" style={{ display: "flex", gap: "5px" }}>
                <input
                  type="text"
                  name="birthPart1"
                  className="resident-number-box"
                  placeholder="앞 6자리"
                  maxLength={6}
                  value={formData.birthPart1}
                  onChange={handleChange}
                  onInput={(e) => handleNextFocus(e, "birthPart2")}
                  required
                />
                <span className="resident-number-dash">-</span>
                <input
                  type="text"
                  name="birthPart2"
                  className="resident-number-box"
                  placeholder="뒤 7자리"
                  maxLength={7}
                  value={formData.birthPart2}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="phone-number-group">
              <label>전화번호</label>
              <div style={{ display: "flex", gap: "5px" }}>
                <input
                  type="text"
                  name="phonePart1"
                  className="phone-number-box"
                  placeholder="010"
                  maxLength={3}
                  value={formData.phonePart1}
                  onChange={handleChange}
                  onInput={(e) => handleNextFocus(e, "phonePart2")}
                  required
                />
                <span className="phone-number-dash1">-</span>
                <input
                  type="text"
                  name="phonePart2"
                  className="phone-number-box"
                  placeholder="0000"
                  maxLength={4}
                  value={formData.phonePart2}
                  onChange={handleChange}
                  onInput={(e) => handleNextFocus(e, "phonePart3")}
                  required
                />
                <span className="phone-number-dash1">-</span>
                <input
                  type="text"
                  name="phonePart3"
                  className="phone-number-box"
                  placeholder="0000"
                  maxLength={4}
                  value={formData.phonePart3}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="address-group1">
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
                <button type="button"
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
                onChange={handleChange}
              />
            </div>

            <button type="submit" className="submit-button" >
              환자 정보 수정
            </button>
          </div>
        </div>
      </form>
    </>
  );
}

export default PatientEdit