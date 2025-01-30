import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Signup.css";

function Signup() {
  const navigate = useNavigate();

  // 폼 입력 상태
  const [formData, setFormData] = useState({
    userId: "",
    userPw: "",
    userName: "",
    role: "의사",
    emailId: "",
    emailDomain: "",
    centerId: "",
    address: "",
  });

  // 아이디 중복 여부
  const [isDuplicate, setIsDuplicate] = useState(false);

  // 기관 검색 모달 상태
  const [showModal, setShowModal] = useState(false);
  const [places, setPlaces] = useState([]);

  // 입력 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 아이디 중복 체크 (지수 코드의 API URL 방식 적용)
  const handleDuplicateCheck = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_DB_URL}/users/check-duplicate/${formData.userId}`
      );
      setIsDuplicate(response.data);
      if (response.data) {
        alert("중복된 아이디 입니다.");
      } else {
        alert("사용 가능한 아이디 입니다.");
      }
    } catch (error) {
      console.error("중복 체크 에러:", error);
      alert("중복 체크 실패!");
    }
  };

  // 회원가입 제출 (이메일 처리 - 동빈 코드 유지, API URL - 지수 코드 방식)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isDuplicate) {
      alert("중복된 아이디는 사용할 수 없습니다.");
      return;
    }

    // 이메일 조합 (동빈 코드 방식 유지)
    const finalEmail = `${formData.emailId}@${formData.emailDomain}`;

    const sendData = {
      ...formData,
      email: finalEmail,
    };

    console.log("회원가입 데이터:", sendData);

    try {
      await axios.post(
        `${process.env.REACT_APP_DB_URL}/users/register`,
        sendData,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      alert("회원가입 성공!");
      navigate("/");
    } catch (err) {
      console.error("회원가입 에러:", err);
      alert("회원가입 실패!");
    }
  };

  // 기관명 검색
  const handleSearchCenter = () => {
    if (!formData.centerId.trim()) {
      alert("기관명을 입력해주세요.");
      return;
    }
  
 // ✅ API 로드 여부 확인
 if (!window.kakao || !window.kakao.maps || !window.kakao.maps.services) {
  alert("카카오 맵 API가 아직 완전히 로드되지 않았습니다. 잠시 후 다시 시도해주세요.");
  console.error("🚨 window.kakao.maps.services.Places is undefined");
  return;
}

console.log("✅ 카카오 맵 API 로드 확인 완료");

  // ✅ 검색 서비스 객체 생성
  const ps = new window.kakao.maps.services.Places();

  ps.keywordSearch(formData.centerId, (data, status) => {
    if (status === window.kakao.maps.services.Status.OK) {
      console.log("✅ 검색 성공", data);
      setPlaces(data);
      setShowModal(true);
    } else if (status === window.kakao.maps.services.Status.ZERO_RESULT) {
      alert("검색 결과가 없습니다.");
    } else if (status === window.kakao.maps.services.Status.ERROR) {
      alert("검색 중 오류가 발생했습니다.");
    }
  });
};

  useEffect(() => {
    if (showModal) {
      // ✅ API가 로드되지 않았다면 실행하지 않음
      if (!window.kakao || !window.kakao.maps) {
        console.log("카카오 맵 API가 아직 로드되지 않았음");
        return;
      }
  
      const container = document.getElementById("map");
      if (container) {
        const options = {
          center: new window.kakao.maps.LatLng(37.5665, 126.978),
          level: 3,
        };
        new window.kakao.maps.Map(container, options);
      }
    }
  }, [showModal]);
  

  const closeModal = () => {
    setShowModal(false);
    setPlaces([]);
  };

  return (
    <div>
      {/* UI 스타일 (지수 코드 반영) */}
      <video className="video-background" autoPlay muted loop>
        <source src="video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className="join-container">
        <div className="join-box">
          <h1>JOIN</h1>
          <form onSubmit={handleSubmit}>

            {/* 아이디 + 중복 체크 버튼 */}
            <div className="input-group">
              <div className="id-duplicate-group">
                <input
                  type="text"
                  name="userId"
                  className="userid_join"
                  placeholder="아이디"
                  value={formData.userId}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="duplicate-check-btn0"
                  onClick={handleDuplicateCheck}
                >
                  중복 확인
                </button>
              </div>
            </div>

            {/* 비밀번호 */}
            <div className="input-group">
              <input
                type="password"
                name="userPw"
                className="userpw_join"
                placeholder="비밀번호"
                value={formData.userPw}
                onChange={handleChange}
                required
              />
            </div>

            {/* 관리자명 & 역할 선택 */}
            <div className="input-group name-role-group">
              <input
                type="text"
                name="userName"
                className="user-name-input"
                placeholder="관리자명"
                value={formData.userName}
                onChange={handleChange}
                required
              />
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="role-select0"
              >
                <option value="의사">의사</option>
                <option value="관리자">관리자</option>
              </select>
            </div>

            {/* 이메일 (동빈 코드 방식) */}
            <div className="input-group email-input-group">
              <input
                type="text"
                name="emailId"
                className="email-local-part"
                placeholder="이메일 아이디"
                value={formData.emailId}
                onChange={handleChange}
                required
              />
              <span>@</span>
              <input
                type="text"
                name="emailDomain"
                className="email-domain-part"
                placeholder="직접입력"
                value={formData.emailDomain}
                onChange={handleChange}
                required
              />
            </div>

            {/* 기관명 + 검색 버튼 */}
            <div className="input-group">
              <div className="input-search-group">
                <input
                  type="text"
                  name="centerId"
                  className="join_centerid"
                  placeholder="기관명을 입력하세요"
                  value={formData.centerId}
                  onChange={handleChange}
                  required
                />
                <button type="button" className="search-btn" onClick={handleSearchCenter}>
                  검 색
                </button>
              </div>
            </div>

            {/* 주소 */}
            <div className="input-group">
              <input
                type="text"
                name="address"
                className="join_address"
                placeholder="주소"
                value={formData.address}
                readOnly
                required
              />
            </div>

            <button type="submit" className="join-button">회원가입</button>
          </form>

          {/* 기관 검색 모달 */}
          {showModal && (
            <div className="search-modal">
              <button onClick={closeModal} className="close-btn">닫기</button>
              <div id="map" className="map-area"></div>
              <ul>
                {places.map((place, index) => (
                  <li
                    key={index}
                    onClick={() => {
                      setFormData({ ...formData, address: place.address_name });
                      alert(`선택된 주소: ${place.address_name}`);
                      closeModal();
                    }}
                  >
                    {place.place_name} ({place.address_name})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Signup;
