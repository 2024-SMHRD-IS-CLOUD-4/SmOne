import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Signup.css";

function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    userId: "",
    userPw: "",
    userName: "",
    role: "의사",
    email: "",
    centerId: "",
    postcode: "",
    address: "",
    detailAddress: "",
    uAdd: "", // 통합 주소 필드
  });
  const [isDuplicate, setIsDuplicate] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddressSearch = () => {
    new window.daum.Postcode({
      oncomplete: (data) => {
        const fullAddress = `${data.zonecode} ${data.address}`;
        setFormData({
          ...formData,
          postcode: data.zonecode,
          address: data.address,
          uAdd: `${fullAddress} ${formData.detailAddress}`,
        });
      },
    }).open();
  };

  const handleDuplicateCheck = async () => {
    try {
      const response = await axios.get(`http://localhost:8090/SmOne/api/users/check-duplicate/${formData.userId}`);
      setIsDuplicate(response.data);
      if (response.data) {
        alert("중복된 아이디 입니다.");
      } else {
        alert("사용 가능한 아이디 입니다.");
      }
    } catch (error) {
      console.error("중복 체크 에러:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isDuplicate) {
      alert("중복된 아이디는 사용할 수 없습니다.");
      return;
    }

    const updatedFormData = {
      ...formData,
      uAdd: `${formData.postcode} ${formData.address} ${formData.detailAddress}`,
    };

    try {
      await axios.post("http://localhost:8090/SmOne/api/users/register", updatedFormData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      alert("회원가입 성공!");
      navigate("/");
    } catch (error) {
      console.error("회원가입 에러:", error);
      alert("회원가입 실패!");
    }
  };

  return (
    <div>
      <video className="video-background" autoPlay muted loop>
        <source src="video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className="join-container">
        <div className="join-box">
          <h1>JOIN</h1>
          <form onSubmit={handleSubmit}>
            <div className="input-group" style={{ display: 'flex'}}>
              <input
                type="text"
                name="userId"
                placeholder="아이디"
                value={formData.userId}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="search-btn1"
                onClick={handleDuplicateCheck}
              >
                중복 확인
              </button>
            </div>

            <div className="input-group">
              <label></label>
              <input
                type="password"
                name="userPw"
                placeholder="비밀번호"
                value={formData.userPw}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <input
                type="text"
                name="userName"
                placeholder="관리자명"
                value={formData.userName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label></label>
              <select name="role" value={formData.role} onChange={handleChange} className="select-box1">
                <option value="의사">의사</option>
                <option value="관리자">관리자</option>
              </select>
            </div>

            <div className="input-group">
              <label></label>
              <input
                type="email"
                name="email"
                placeholder="이메일"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label></label>
              <input
                type="text"
                name="centerId"
                placeholder="기관명"
                value={formData.centerId}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label></label>
              <div className="input-search-group">
                <input
                  type="text"
                  name="postcode"
                  placeholder="우편번호"
                  value={formData.postcode}
                  readOnly
                  required
                />
                <button type="button" className="search-btn" onClick={handleAddressSearch}>
                  검색
                </button>
              </div>
            </div>

            <div className="input-group">
              <label></label>
              <input
                type="text"
                name="address"
                placeholder="주소"
                value={formData.address}
                readOnly
                required
              />
            </div>

            <div className="input-group">
              <label></label>
              <input
                type="text"
                name="detailAddress"
                placeholder="상세주소"
                value={formData.detailAddress}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="join-button">
              회원가입
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Signup;