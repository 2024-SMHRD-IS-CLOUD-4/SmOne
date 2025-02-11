import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Findid.css";

const Findid = () => {
  const [formData, setFormData] = useState({
    centerId: "",
    userName: "",
    role: "의사",
    emailId: "",
    emailDomain: "",
  });
  const [foundUserId, setFoundUserId] = useState("");
  const [errorField, setErrorField] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrorField("");
  };

  const handleFindId = async () => {
    setErrorField("");
    setErrorMessage("");

    if (!formData.centerId.trim()) {
      setErrorField("centerId");
      setErrorMessage("기관명을 입력해주세요.");
      return;
    }
    if (!formData.userName.trim()) {
      setErrorField("userName");
      setErrorMessage("관리자명을 입력해주세요.");
      return;
    }
    if (!formData.emailId.trim() || !formData.emailDomain.trim()) {
      setErrorField("email");
      setErrorMessage("이메일을 입력해주세요.");
      return;
    }

    const finalEmail = `${formData.emailId}@${formData.emailDomain}`;
    const sendData = {
      centerId: formData.centerId,
      userName: formData.userName,
      role: formData.role,
      email: finalEmail
    };

    console.log("전송 데이터:", sendData);

    try {
      const response = await axios.post(`${process.env.REACT_APP_DB_URL}/users/findid`, sendData);
      if (response && response.data) {
        setFoundUserId(response.data);
      } else {
        setErrorField("findid-btn");
        setErrorMessage("알 수 없는 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("아이디 찾기 오류:", error);
      if (error.response && error.response.status === 404) {
        setErrorField("findid-btn");
        setErrorMessage("입력하신 정보와 일치하는 아이디가 없습니다.");
      } else {
        setErrorField("findid-btn");
        setErrorMessage("아이디를 찾는 중 오류가 발생했습니다.");
      }
    }
  };

  const handleConfirm = () => {
    navigate("/");
  };

  return (
    <div className={`findid-container ${foundUserId ? "expanded" : ""}`}>
      <div className="findid_header">
        <h1 className="findid-title">아이디 찾기</h1>
        <button className="findid-close-btn" onClick={() => navigate("/")}>X</button>
      </div>
      
      <div className="findid-form">
        <label>기관명 / 직책</label>
        <div className="flex-row">
          <input
            type="text"
            name="centerId"
            placeholder="기관명을 입력하세요"
            value={formData.centerId}
            onChange={handleChange}
            className={`long-input ${errorField === "centerId" ? "error" : ""}`}
            required
          />
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="role-select"
          >
            <option value="의사">의사</option>
            <option value="관리자">관리자</option>
          </select>
        </div>

        <label>관리자명</label>
        <input
          type="text"
          name="userName"
          className={`findid_name ${errorField === "userName" ? "error" : ""}`}
          placeholder="관리자명을 입력하세요"
          value={formData.userName}
          onChange={handleChange}
          required
        />

        <label>이메일 입력</label>
        <div className="flex-row">
          <input
            type="text"
            name="emailId"
            className={`email-input ${errorField === "email" ? "error" : ""}`}
            placeholder="이메일 아이디"
            value={formData.emailId}
            onChange={handleChange}
            required
          />
          <span className="at-symbol">@</span>
          <input
            type="text"
            name="emailDomain"
            placeholder="직접입력"
            value={formData.emailDomain}
            onChange={handleChange}
            className={`email-input ${errorField === "email" ? "error" : ""}`}
            required
          />
        </div>

        <button className={`findid-btn ${errorField === "findid-btn" ? "error" : ""}`} onClick={handleFindId}>
          아이디 찾기
        </button>

        {errorMessage && <p className="error-message">{errorMessage}</p>}

        {foundUserId && (
          <div className="result-box">
            <p>찾은 아이디: <strong>{foundUserId}</strong></p>
            <button onClick={handleConfirm}>확인</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Findid;
