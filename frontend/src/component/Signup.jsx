import React, { useState, useEffect } from "react";
import { KakaoMapContext } from "../App"; // 🔥 App.js의 Context 가져오기
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Signup.css";

function Signup() {
  const navigate = useNavigate(KakaoMapContext);

  // 폼 입력 상태
  const [formData, setFormData] = useState({
    userId: "",
    userPw: "",
    userName: "",
    role: "의사",
    emailId: "",
    emailDomain: "",
    centerId: "",
    address: ""
  });

  // 아이디 중복 여부
  const [isDuplicate, setIsDuplicate] = useState(false);

  // 기관 검색 모달 상태
  const [places, setPlaces] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // 입력 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 아이디 중복 체크
  const handleDuplicateCheck = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_DB_URL}/users/check-duplicate/${formData.userId}`
      );
      setIsDuplicate(res.data); // true면 중복, false면 사용 가능
      if (res.data) {
        alert("중복된 아이디 입니다.");
      } else {
        alert("사용 가능한 아이디 입니다.");
      }
    } catch (error) {
      console.error("중복 체크 에러:", error);
      alert("서버 오류로 중복 체크에 실패했습니다.");
    }
  };

  // 회원가입 제출
  const handleSubmit = async (e) => {
    e.preventDefault();

    // (1) 아이디 중복 여부
    if (isDuplicate) {
      // 중복 아이디이면 가입 불가
      alert("중복된 아이디는 사용할 수 없습니다.");
      return;
    }

    // (2) 각 필드가 비었는지 체크
    if (!formData.userId.trim()) {
      alert("아이디를 입력하세요.");
      return;
    }
    if (!formData.userPw.trim()) {
      alert("비밀번호를 입력하세요.");
      return;
    }
    if (!formData.userName.trim()) {
      alert("관리자명을 입력하세요.");
      return;
    }
    if (!formData.emailId.trim()) {
      alert("이메일 아이디를 입력하세요.");
      return;
    }
    if (!formData.emailDomain.trim()) {
      alert("이메일 도메인을 입력하세요.");
      return;
    }
    if (!formData.centerId.trim()) {
      alert("기관명을 입력하세요.");
      return;
    }
    if (!formData.address.trim()) {
      alert("주소를 선택하세요.");
      return;
    }

    // (3) 이메일 합치기
    const finalEmail = `${formData.emailId}@${formData.emailDomain}`;

    // 서버로 전송할 객체
    const sendData = {
      ...formData,
      email: finalEmail // 이메일 최종 문자열
    };

    console.log("회원가입 데이터:", sendData);

    try {
      await axios.post(`${process.env.REACT_APP_DB_URL}/users/register`, sendData, {
        headers: { "Content-Type": "application/json" }
      });
      alert("회원가입 성공!");
      navigate("/");
    } catch (err) {
      console.error("회원가입 에러:", err);
      alert("회원가입 실패!");
    }
  };

  // 기관명 검색 (카카오 지도)
  const handleSearchCenter = () => {
    if (!formData.centerId.trim()) {
      alert("기관명을 입력해주세요.");
      return;
    }
    const ps = new window.kakao.maps.services.Places();
    ps.keywordSearch(formData.centerId, (data, status) => {
      if (status === window.kakao.maps.services.Status.OK) {
        setPlaces(data);
        setShowModal(true);
      } else {
        alert("검색 결과가 없습니다.");
      }
    });
  };

  // 모달 열릴 때 지도 생성
  useEffect(() => {
    if (showModal) {
      const container = document.getElementById("map");
      if (container) {
        const options = {
          center: new window.kakao.maps.LatLng(37.5665, 126.978),
          level: 3
        };
        new window.kakao.maps.Map(container, options);
      }
    }
  }, [showModal]);

  // 모달 닫기
  const closeModal = () => {
    setShowModal(false);
    setPlaces([]);
  };

  return (
    <div className="signup-container">
      <h1 className="signup-title">회원가입</h1>

      <form className="signup-form" onSubmit={handleSubmit}>

        {/* 아이디 + 중복 버튼 */}
        <label>아이디</label>
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
          <button type="button"
            className="duplicate-check-btn0"
            onClick={handleDuplicateCheck}>
            중복 체크
          </button>
        </div>

        {/* 비밀번호 */}
        <label>비밀번호</label>
        <div className="pw-duplicate-group">
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
        {/* 관리자명 */}
        <label>관리자명</label>
        <div className="my-duplicate-group">
          <input
            type="text"
            name="userName"
            className="Join_name"
            placeholder="관리자명"
            value={formData.userName}
            onChange={handleChange}
            required
          />

          {/* 직업: 의사 / 관리자 */}

          <label>
            <select name="role"
            value={formData.role}
            className="signup_role"
            onChange={handleChange}>
              <option value="의사">의사</option>
              <option value="관리자">관리자</option>
            </select>
          </label>
        </div>
        {/* 이메일: (이메일 아이디 + @ + 도메인) */}
        <label>이메일</label>
        <div className="flex-row">
          <input
            type="text"
            name="emailId"
            className="email-local-part"
            placeholder="이메일 아이디"
            value={formData.emailId}
            onChange={handleChange}
            style={{ flex: 1 }}
            required
          />
          <span style={{ margin: "0 8px", color: "#ccc", fontWeight: "bold" }}>
            @
          </span>
          <input
            type="text"
            name="emailDomain"
            className="email-domain-part"
            placeholder="(예 : gmail.com)"
            value={formData.emailDomain}
            onChange={handleChange}
            style={{ flex: 1 }}
            required
          />
        </div>

        {/* 기관명 + 검색 버튼 */}
        <label>기관명</label>
        <div className="flex-row">
          <input
            type="text"
            name="centerId"
            className="join_centerid"
            placeholder="기관명을 입력하세요"
            value={formData.centerId}
            onChange={handleChange}
            required
          />
          <button type="button"
          className="search-btn1"
          onClick={handleSearchCenter}
          >
            검 색
          </button>
        </div>

        {/* 주소 */}
        <div className="input-group">
          <label></label>
          <input
            type="text"
            name="address"
            className="join_address"
            placeholder="주소"
            value={formData.address}
            readOnly
          />
          </div>

        {/* 제출 버튼 */}
        <button type="submit" className="submit-btn">
          회원가입
        </button>
      </form>

      {/* 모달 */}
      {showModal && (
        <div className="search-modal">
          <div className="modal-header">
            <h2>검색 결과</h2>
            <button className="close-btn" onClick={closeModal}>닫기</button>
          </div>
          <div className="modal-body">
            <div id="map" className="map-area"></div>
            <div className="list-area">
              <ul>
                {places.map((place, index) => (
                  <li
                    key={index}
                    onClick={() => {
                      // 장소 클릭 시 => 기관명, 주소 업데이트
                      setFormData({
                        ...formData,
                        centerId: place.place_name,
                        address: place.address_name
                      });
                      alert(`선택된 주소: ${place.address_name}`);
                      closeModal();
                    }}
                  >
                    <strong>{place.place_name}</strong>
                    <p>{place.address_name}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Signup;