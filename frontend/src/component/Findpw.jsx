import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Findpw.css";

const Findpw = () => {
  const [formData, setFormData] = useState({
    userId: "",
    emailId: "",
    emailDomain: "",
    verificationCode: "",
  });

  const [isCodeVerified, setIsCodeVerified] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [sendMessage, setSendMessage] = useState(""); // 인증번호 전송 메시지 추가
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === "verificationCode") {
      setError(false);
      setMessage("");
    }
  };

  const handleSendCode = async () => {
    const finalEmail = `${formData.emailId}@${formData.emailDomain}`;
    if (!formData.userId.trim()) {
      alert("아이디를 입력하세요.");
      return;
    }
    if (!formData.emailId.trim() || !formData.emailDomain.trim()) {
      alert("이메일을 입력하세요.");
      return;
    }

    try {
      await axios.post(`${process.env.REACT_APP_DB_URL}/users/password/send-email`, {
        userId: formData.userId,
        email: finalEmail,
      });
      setSendMessage("인증번호가 전송되었습니다."); // 메시지 설정
    } catch (error) {
      setSendMessage("인증번호 전송 실패.");
    }
  };

  const handleVerifyCode = async () => {
    if (!formData.userId.trim()) {
      alert("아이디를 입력하세요.");
      return;
    }
    if (!formData.verificationCode.trim()) {
      setError(true);
      setMessage("인증번호를 입력하세요.");
      return;
    }

    try {
      await axios.post(`${process.env.REACT_APP_DB_URL}/users/password/verify-code`, {
        userId: formData.userId,
        verificationCode: formData.verificationCode,
      });
      setMessage("인증번호가 일치합니다.");
      setIsCodeVerified(true);
      setError(false);
    } catch (error) {
      setMessage("인증번호가 일치하지 않습니다.");
      setIsCodeVerified(false);
      setError(true);
    }
  };

  return (
    <div className={`findpw-container ${sendMessage ? "expanded" : ""} ${isCodeVerified ? "verified" : ""} ${error ? "error" : ""}`}>
      <button className="findpw-close-btn" onClick={() => navigate(-1)}>X</button>
      <h1 className="findpw-title">본인 인증</h1>

      <div className="findpw-form">
        <label>아이디</label>
        <input
          type="text"
          name="userId"
          placeholder="아이디를 입력하세요"
          value={formData.userId}
          onChange={handleChange}
        />

        <label>이메일</label>
        <div className="flex-row3">
          <input
            type="text"
            name="emailId"
            placeholder="이메일 아이디"
            value={formData.emailId}
            onChange={handleChange}
            style={{ flex: 1 }}
          />
          <span style={{ margin: "0 8px", color: "#ccc", fontWeight: "bold" }}>@</span>
          <input
            type="text"
            name="emailDomain"
            placeholder="예 : gmail.com"
            value={formData.emailDomain}
            onChange={handleChange}
            style={{ flex: 1 }}
          />
          <button className="send-btn" onClick={handleSendCode}>
            인증
          </button>
        </div>

        {sendMessage && <p className="info-message">{sendMessage}</p>} 

        <label>인증번호 입력</label>
        <div className="flex-row">
          <input
            type="text"
            name="verificationCode"
            placeholder="인증번호를 입력하세요"
            value={formData.verificationCode}
            onChange={handleChange}
            className={error ? "error" : ""}
            style={{ flex: 1 }}
          />
          <button className="verify-btn" onClick={handleVerifyCode}>
            확인
          </button>
        </div>

        {message && <p className="info-message" style={{ color: error ? "red" : "#ccc" }}>{message}</p>}

        <button
          className="findpw-btn"
          onClick={() => isCodeVerified && navigate("/changepw")}
          disabled={!isCodeVerified}
        >
          비밀번호 변경
        </button>
      </div>
    </div>
  );
};

export default Findpw;
