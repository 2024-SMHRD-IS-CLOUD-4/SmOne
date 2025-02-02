import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./IdentityCheck.css";

const IdentityCheck = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    userId: "",
    emailLocalPart: "",
    emailDomainPart: "",
  });

  const [isCodeVerified, setIsCodeVerified] = useState(false);
  const [message, setMessage] = useState("");

  // 입력 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // 인증번호 전송
  const handleSendCode = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_DB_URL}/users/password/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: formData.userId,
          email: `${formData.emailLocalPart}@${formData.emailDomainPart}`,
        }),
      });

      if (response.ok) {
        alert("인증번호가 이메일로 전송되었습니다.");
      } else {
        alert("인증번호 전송 실패: 서버 오류.");
      }
    } catch (error) {
      alert("인증번호 전송 실패: " + error.message);
    }
  };

  // 인증번호 확인
  const handleVerifyCode = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_DB_URL}/users/password/verify-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: formData.userId,
          verificationCode: formData.verificationCode,
        }),
      });

      if (response.ok) {
        setMessage("인증번호가 일치합니다.");
        setIsCodeVerified(true);
      } else {
        setMessage("인증번호가 일치하지 않습니다.");
        setIsCodeVerified(false);
      }
    } catch (error) {
      setMessage("인증번호 확인 실패: " + error.message);
      setIsCodeVerified(false);
    }
  };

  // 비밀번호 변경 페이지로 이동
  const handleNavigateToChangePw = () => {
    if (isCodeVerified) {
      navigate("/changepw");
    } else {
      alert("인증번호 확인이 필요합니다.");
    }
  };

  return (
    <div>
      {/* Video Background */}
      <video className="video-background" autoPlay muted loop>
        <source src="video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="pass-container">
        <div className="pass-box">
          <h1>본인확인</h1>
          <form>
            <label htmlFor="userId">아이디</label>
            <input
              type="text"
              id="userId"
              name="userId"
              placeholder="아이디 입력"
              value={formData.userId}
              onChange={handleChange}
            />

            <label htmlFor="email">이메일 입력</label>
            <div className="input-row">
              <input
                type="text"
                id="emailLocalPart"
                name="emailLocalPart"
                placeholder="이메일 아이디"
                value={formData.emailLocalPart}
                onChange={handleChange}
              />
              <span>@</span>
              <input
                type="text"
                id="emailDomainPart"
                name="emailDomainPart"
                placeholder="직접입력"
                value={formData.emailDomainPart}
                onChange={handleChange}
              />
            </div>

            <button type="button" className="pass-button" onClick={handleSendCode}>
              인증번호 전송
            </button>

            <label htmlFor="verificationCode">인증번호</label>
            <input
              type="text"
              id="verificationCode"
              name="verificationCode"
              placeholder="인증번호 입력"
              value={formData.verificationCode}
              onChange={handleChange}
            />

            <button type="button" className="pass-button" onClick={handleVerifyCode}>
              인증번호 확인
            </button>

            {message && <p>{message}</p>}

            <button
              type="button"
              className="pass-button"
              onClick={handleNavigateToChangePw}
              disabled={!isCodeVerified}
            >
              비밀번호 변경
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default IdentityCheck;
