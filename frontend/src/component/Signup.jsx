import React, { useState, useEffect } from "react";
import { KakaoMapContext } from "../App"; // 🔥 App.js의 Context 가져오기
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Signup.css";
import visibleIcon from './png/001.png';
import hiddenIcon from './png/002.png';

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
  const [shake, setShake] = useState(false);
  const [idCheckMessage, setIdCheckMessage] = useState("");

  // 기관 검색 모달 상태
  const [places, setPlaces] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");

  // 지도/마커를 제어하기 위한 ref/state
  const [map, setMap] = useState(null);               // 지도 객체 보관
  const [markers, setMarkers] = useState([]);         // 만들어진 마커들

  // 사용자가 최종으로 선택한 장소 (리스트 클릭 시 세팅)
  const [selectedPlace, setSelectedPlace] = useState(null);

  // 👁 비밀번호 표시 상태 추가
  const [showPassword, setShowPassword] = useState(false);

  // 👁 비밀번호 표시 버튼 클릭 시 상태 변경
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };


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
    if (!formData.userId.trim()) {
      alert("아이디를 입력하세요.");
      return;
    }
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_DB_URL}/users/check-duplicate/${formData.userId}`
      );
      setIsDuplicate(res.data); // true면 중복, false면 사용 가능
      if (res.data) {
        setIsDuplicate(true);  // ✅ 중복이면 상태 변경
        setShake(true);  // 🚨 흔들림 효과 추가해야 하지만 누락됨!
        setIdCheckMessage("중복된 아이디입니다람쥐.");
        setTimeout(() => setShake(false), 500); // 0.5초 후 초기화
      } else {
        setIsDuplicate(false);
        setIdCheckMessage(""); // ✅ 메시지 초기화
        alert("사용 가능한 아이디 입니다.");
      }
    } catch (error) {
      console.error("중복 체크 에러:", error);
      alert("서버 오류로 중복 체크에 실패했습니다.");
    }
  };

  // 비밀번호 유효성 검사 함수
  const validatePassword = (password) => {
    const hasLetter = /[a-zA-Z]/.test(password); // 영문 포함 여부
    const isLongEnough = password.length >= 5; // 5글자 이상

    if (!hasLetter || !isLongEnough) {
      setPasswordError(true);
      setShake(true); // 🚨 흔들림 효과 추가
      setPasswordMessage("비밀번호는 5자 이상이며 영문을 1글자 이상 포함해야 합니다.");
      return false;
    } else {
      setPasswordError(false);
      setShake(false);
      setPasswordMessage("");
      return true;
    }
  };

  // 비밀번호 입력 변경 핸들러
  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setFormData({ ...formData, userPw: newPassword });
    validatePassword(newPassword); // 입력 시마다 검증
  };

  // 회원가입 제출
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validatePassword(formData.userPw)) {
      return;
    }

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

  // 모달 열릴 때 / places 바뀔 때 => 지도 생성 & 마커 표시
  useEffect(() => {
    // 모달이 열렸고, 검색 결과가 있을 때만 지도 생성
    if (showModal && places.length > 0) {
      const container = document.getElementById("map");
      if (!container) return;

      // 지도 생성: 첫 검색 결과를 기준으로 초기 center 설정
      const mapOptions = {
        center: new window.kakao.maps.LatLng(places[0].y, places[0].x),
        level: 5
      };
      const createdMap = new window.kakao.maps.Map(container, mapOptions);
      setMap(createdMap);

      // 마커들 생성
      const bounds = new window.kakao.maps.LatLngBounds();
      const tempMarkers = [];

      places.forEach((place) => {
        const position = new window.kakao.maps.LatLng(place.y, place.x);
        const marker = new window.kakao.maps.Marker({
          position,
        });
        marker.setMap(createdMap);
        bounds.extend(position);

        // InfoWindow (마우스오버 시 표시)
        const infowindow = new window.kakao.maps.InfoWindow({
          content: `
          <div style="padding:4px;font-size:13px;color:#000;font-weight:bold;">
            ${place.place_name}
          </div>
        `,
        });

        // 마커 호버 이벤트
        window.kakao.maps.event.addListener(marker, "mouseover", () => {
          infowindow.open(createdMap, marker);
        });
        window.kakao.maps.event.addListener(marker, "mouseout", () => {
          infowindow.close();
        });

        // marker 배열에 push
        tempMarkers.push({ marker, infowindow, place });
      });

      // 모든 마커가 보이도록 지도 범위 설정
      createdMap.setBounds(bounds);

      // state에 저장 (나중에 리스트 클릭 시 참조)
      setMarkers(tempMarkers);
    }
  }, [showModal, places]);

  // 모달 닫기
  const closeModal = () => {
    setShowModal(false);
    setPlaces([]);
    setMarkers([]);
    setMap(null);
    setSelectedPlace(null);
  };

  // 목록에서 특정 장소를 클릭하면 => 지도 이동 & 마커 InfoWindow 열기
  const handleListClick = (place) => {
    if (!map || !markers.length) return;

    // 선택된 place 저장(완료시 사용)
    setSelectedPlace(place);

    map.setLevel(3);
    // 지도 이동 (더 확대해서 보여주고 싶다면 level 조정)
    const moveLatLng = new window.kakao.maps.LatLng(place.y, place.x);
    panToWithOffset(map, moveLatLng, -150, 0);


    // 해당 place의 마커를 찾아서 infowindow 열기
    markers.forEach(({ marker, infowindow, place: p }) => {
      if (p.id === place.id) {
        // 해당 마커의 infowindow 열기
        infowindow.open(map, marker);
      } else {
        // 나머지 마커 infowindow는 닫기
        infowindow.close();
      }
    });
  };

  function panToWithOffset(map, latlng, offsetX, offsetY) {
    // (1) Projection 객체: 위/경도 → 화면 픽셀 좌표 변환
    const projection = map.getProjection();

    // (2) 현재 latlng를 지도 픽셀 좌표로 변환
    const point = projection.pointFromCoords(latlng);

    // (3) point에 오프셋 적용 (x·y 각각 더하기)
    const adjustedPoint = new window.kakao.maps.Point(
      point.x + offsetX,
      point.y + offsetY
    );

    // (4) 다시 지도 좌표(latlng)로 역변환
    const newLatLng = projection.coordsFromPoint(adjustedPoint);

    // (5) 지도 중심 이동
    map.setCenter(newLatLng);
  }

  // “완료” 버튼 => 실제로 formData에 주소 반영 + 모달 닫기
  const handleComplete = () => {
    if (!selectedPlace) {
      alert("목록에서 장소를 먼저 선택하세요.");
      return;
    }

    // 선택된 place로 기관명, address 업데이트
    setFormData((prev) => ({
      ...prev,
      centerId: selectedPlace.place_name,
      address: selectedPlace.address_name
    }));

    alert(`선택된 주소: ${selectedPlace.address_name}`);
    closeModal();
  };

  return (
    <div className="signup-container">
      {/* X 버튼을 컨테이너 안쪽 상단 오른쪽에 배치 */}
      <h1 className="signup-title">회원가입</h1>
      <button className="signup-close-btn" onClick={() => navigate("/")}>X</button>

      <form className="signup-form" onSubmit={handleSubmit}>

        {/* 아이디 + 중복 버튼 */}
        <label>아이디</label>
        <div className="id-duplicate-group">
          <input
            type="text"
            name="userId"
            className={`userid_join ${shake ? "shake" : ""} ${isDuplicate ? "error-border1" : ""}`}
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

        {/* ✅ 중복 체크 결과 메시지 추가 */}
        {idCheckMessage && (
          <p className={isDuplicate ? "error-message1" : ""}>
            {idCheckMessage}
          </p>
        )}

        {/* 비밀번호 */}
        <label>비밀번호</label>
        <div className={`pw-duplicate-group ${passwordError ? "shake" : ""}`}>
          <input
            type={showPassword ? "text" : "password"} // 👁 클릭 시 보이기/숨기기
            name="userPw"
            className={`userpw_join ${passwordError ? "error-border1" : ""}`}
            placeholder="비밀번호"
            value={formData.userPw}
            onChange={handlePasswordChange}
            required
          />
          {/* 👁 비밀번호 보기 버튼 */}
          <button type="button" className="toggle-password-btn5" onClick={togglePasswordVisibility}>
            <img
              src={showPassword ? visibleIcon : hiddenIcon} // 상태에 따라 아이콘 변경
              alt={showPassword ? "비밀번호 보임" : "비밀번호 숨김"}
              className="password-icon5"
            />
          </button>
        </div>
        {passwordMessage && <p className="password-error-message">{passwordMessage}</p>}

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
            placeholder="예 : gmail.com"
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
        <div className="search-modal1">
          <div className="modal-header">
            <h2>검색 결과</h2>
            <button className="close-btn9" onClick={closeModal}>닫기</button>
            <button
              className="complete-btn"
              style={{ marginLeft: "10px" }}
              onClick={handleComplete}
            >
              완료
            </button>
          </div>
          <div className="modal-body">
            <div id="map" className="map-area"></div>
            <div className="list-area">
              <ul>
                {places.map((place, index) => (
                  <li
                    key={index}
                    onClick={() => handleListClick(place)}
                    style={{
                      background:
                        selectedPlace && selectedPlace.id === place.id
                          ? "#e0f7fa"
                          : "transparent"
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