import React, { useState, useEffect } from "react";
import { KakaoMapContext } from "../App";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Signup.css";
import hiddenIcon from './png/001.png';
import visibleIcon from './png/002.png';

function Signup() {
  const navigate = useNavigate(KakaoMapContext);

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

  const [isDuplicate, setIsDuplicate] = useState(false);
  const [shake, setShake] = useState(false);
  const [idCheckMessage, setIdCheckMessage] = useState("");
  const [places, setPlaces] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDuplicateCheck = async () => {
    if (!formData.userId.trim()) {
      alert("아이디를 입력하세요.");
      return;
    }
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_DB_URL}/users/check-duplicate/${formData.userId}`
      );
      setIsDuplicate(res.data);
      if (res.data) {
        setIsDuplicate(true);
        setShake(true);
        setIdCheckMessage("중복된 아이디입니다람쥐.");
        setTimeout(() => setShake(false), 500);
      } else {
        setIsDuplicate(false);
        setIdCheckMessage("");
        alert("사용 가능한 아이디 입니다.");
      }
    } catch (error) {
      console.error("중복 체크 에러:", error);
      alert("서버 오류로 중복 체크에 실패했습니다.");
    }
  };

  const validatePassword = (password) => {
    const hasLetter = /[a-zA-Z]/.test(password);
    const isLongEnough = password.length >= 5;

    if (!hasLetter || !isLongEnough) {
      setPasswordError(true);
      setShake(true);
      setPasswordMessage("비밀번호는 5자 이상이며 영문을 1글자 이상 포함해야 합니다.");
      return false;
    } else {
      setPasswordError(false);
      setShake(false);
      setPasswordMessage("");
      return true;
    }
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setFormData({ ...formData, userPw: newPassword });
    validatePassword(newPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validatePassword(formData.userPw)) {
      return;
    }

    if (isDuplicate) {
      alert("중복된 아이디는 사용할 수 없습니다.");
      return;
    }

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

    const finalEmail = `${formData.emailId}@${formData.emailDomain}`;

    const sendData = {
      ...formData,
      email: finalEmail
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

  useEffect(() => {
    if (showModal && places.length > 0) {
      const container = document.getElementById("map");
      if (!container) return;

      const mapOptions = {
        center: new window.kakao.maps.LatLng(places[0].y, places[0].x),
        level: 5
      };
      const createdMap = new window.kakao.maps.Map(container, mapOptions);
      setMap(createdMap);

      const bounds = new window.kakao.maps.LatLngBounds();
      const tempMarkers = [];

      places.forEach((place) => {
        const position = new window.kakao.maps.LatLng(place.y, place.x);
        const marker = new window.kakao.maps.Marker({
          position,
        });
        marker.setMap(createdMap);
        bounds.extend(position);

        const infowindow = new window.kakao.maps.InfoWindow({
          content: `
          <div style="padding:4px;font-size:13px;color:#000;font-weight:bold;">
            ${place.place_name}
          </div>
        `,
        });

        window.kakao.maps.event.addListener(marker, "mouseover", () => {
          infowindow.open(createdMap, marker);
        });
        window.kakao.maps.event.addListener(marker, "mouseout", () => {
          infowindow.close();
        });

        tempMarkers.push({ marker, infowindow, place });
      });

      createdMap.setBounds(bounds);

      setMarkers(tempMarkers);
    }
  }, [showModal, places]);

  const closeModal = () => {
    setShowModal(false);
    setPlaces([]);
    setMarkers([]);
    setMap(null);
    setSelectedPlace(null);
  };

  const handleListClick = (place) => {
    if (!map || !markers.length) return;

    setSelectedPlace(place);

    map.setLevel(3);
    const moveLatLng = new window.kakao.maps.LatLng(place.y, place.x);
    panToWithOffset(map, moveLatLng, -150, 0);


    markers.forEach(({ marker, infowindow, place: p }) => {
      if (p.id === place.id) {
        infowindow.open(map, marker);
      } else {
        infowindow.close();
      }
    });
  };

  function panToWithOffset(map, latlng, offsetX, offsetY) {
    const projection = map.getProjection();
    const point = projection.pointFromCoords(latlng);
    const adjustedPoint = new window.kakao.maps.Point(
      point.x + offsetX,
      point.y + offsetY
    );

    const newLatLng = projection.coordsFromPoint(adjustedPoint);

    map.setCenter(newLatLng);
  }

  const handleComplete = () => {
    if (!selectedPlace) {
      alert("목록에서 장소를 먼저 선택하세요.");
      return;
    }

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
      <h1 className="signup-title">회원가입</h1>
      <button className="signup-close-btn" onClick={() => navigate("/")}>X</button>

      <form className="signup-form" onSubmit={handleSubmit}>

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

        {idCheckMessage && (
          <p className={isDuplicate ? "error-message1" : ""}>
            {idCheckMessage}
          </p>
        )}

        <label>비밀번호</label>
        <div className={`pw-duplicate-group ${passwordError ? "shake" : ""}`}>
          <input
            type={showPassword ? "text" : "password"}
            name="userPw"
            className={`userpw_join ${passwordError ? "error-border1" : ""}`}
            placeholder="비밀번호"
            value={formData.userPw}
            onChange={handlePasswordChange}
            required
          />
          <button type="button" className="toggle-password-btn5" onClick={togglePasswordVisibility}>
            <img
              src={showPassword ? visibleIcon : hiddenIcon}
              alt={showPassword ? "비밀번호 보임" : "비밀번호 숨김"}
              className="password-icon5"
            />
          </button>
        </div>
        {passwordMessage && <p className="password-error-message">{passwordMessage}</p>}

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

        <button type="submit" className="submit-btn">
          회원가입
        </button>
      </form>

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