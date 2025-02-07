import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { KakaoMapContext } from "../App";
import axios from "axios";
import "./Mypage.css";
import Menu from "./Menu"; // Menu.jsx 추가

function Mypage() {
  const navigate = useNavigate();
  const kakaoMaps = useContext(KakaoMapContext); // ✅ Context에서 API 가져오기
  // 이메일을 아이디/도메인으로 분리 예시
  const [userData, setUserData] = useState({
    userId: "",
    userName: "",
    role: "",
    emailLocal: "",
    emailDomain: "",
    centerId: "",  // 검색어(기관명)로도 사용
    address: ""
  });

  const [places, setPlaces] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");

  useEffect(() => {

    const storedUserId = sessionStorage.getItem("userId");
    if (!storedUserId) {
      alert("로그인이 필요합니다.");
      navigate("/");
      return;
    }

    axios.get(`/users/mypage?userId=${storedUserId}`)
      .then(res => {
        const data = res.data;

        const [emailLocal = "", emailDomain = ""] = data.email.split("@");

        setUserData({
          userId: data.userId,
          userName: data.userName,
          role: data.role,
          emailLocal,
          emailDomain,
          centerId: data.centerId,
          address: data.address ?? ""
        });
      })
      .catch(err => {
        console.error(err);
        alert("마이페이지 로드 중 오류가 발생했습니다.");
        navigate("/");
      });
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  // 입력값 검증 (간단 예시)
  const validateInputs = () => {
    const { userName, role, emailLocal, emailDomain, centerId, address } = userData;
    if (!userName.trim() || !role.trim() || !emailLocal.trim() || !emailDomain.trim() || !centerId.trim() || !address.trim()) {
      alert("모든 필드를 입력해주세요.");
      return false;
    }
    const fullEmail = `${emailLocal}@${emailDomain}`;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(fullEmail)) {
      alert("유효한 이메일 아이디/도메인을 입력하세요.");
      return false;
    }
    return true;
  };

  // 정보 수정
  const handleUpdate = async () => {
    if (!validateInputs()) return;

    const fullEmail = `${userData.emailLocal}@${userData.emailDomain}`;

    const sendData = {
      ...userData,
      email: fullEmail  // 최종 email만 합쳐서 백엔드 전달
    };
    try {
      await axios.put("http://localhost:8090/SmOne/api/users/update", sendData, {
        headers: { "Content-Type": "application/json" }
      });
      alert("정보가 수정되었습니다.");
      navigate("/main");
    } catch (err) {
      console.error(err);
      alert("정보 수정에 실패했습니다.");
    }
  };

  // 비밀번호 변경 페이지로 이동
  const handlePasswordChangePage = () => {
    navigate("/findpw");
  };

  // 회원 탈퇴
  const handleDelete = async () => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_DB_URL}/users/delete`, {
        userId: userData.userId,
        password: deletePassword
      });
      if (response.status === 200) {
        alert("회원 탈퇴 성공!");
        sessionStorage.clear();
        navigate("/");
      }
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        alert("비밀번호가 일치하지 않습니다.");
      } else {
        alert("회원 탈퇴에 실패했습니다.");
      }
    }
  };

  // 기관명 검색
  const handleSearchCenter = () => {
    if (!userData.centerId.trim()) {
      alert("기관명을 입력하세요!");
      return;
    }

    if (kakaoMaps) { // ✅ undefined 방지
      const ps = new kakaoMaps.services.Places();
      ps.keywordSearch(userData.centerId, (data, status) => {
        if (status === kakaoMaps.services.Status.OK) {
          setPlaces(data);
          setShowModal(true);
        } else {
          alert("검색 결과가 없습니다.");
        }
      });
    } else {
      console.error("카카오 지도 API가 로드되지 않았습니다.");
    }
  };

  // 모달 뜨면 지도 초기화
  useEffect(() => {
    if (showModal) {
      const mapContainer = document.getElementById("map");
      const mapOption = {
        center: new window.kakao.maps.LatLng(37.5665, 126.978),
        level: 3
      };
      const map = new window.kakao.maps.Map(mapContainer, mapOption);
      if (places.length > 0) {
        const bounds = new window.kakao.maps.LatLngBounds();
        places.forEach(p => {
          const markerPosition = new window.kakao.maps.LatLng(p.y, p.x);
          bounds.extend(markerPosition);
          new window.kakao.maps.Marker({ map, position: markerPosition });
        });
        map.setBounds(bounds);
      }
    }
  }, [showModal, places]);

  const closeModal = () => {
    setShowModal(false);
    setPlaces([]);
  };
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeletePassword("");
  };

  return (
    <>
      <Menu /> {/* Menu 추가 */}
      <div className="mypage-container">
        <button className="back-btn" onClick={() => navigate("/main")}>X</button> {/* ✅ X 버튼 추가 */}
        <h2 className="mypage-title">마이페이지</h2>

        <form className="mypage-form">
          <label>* 사용자 ID</label>
          <div className="userid-box">{userData.userId}</div>

          <div className="flex-container">
            <div className="input-group">
              <label>관리자명</label>
              <input
                type="text"
                name="userName"
                className="Mp_Uname"
                value={userData.userName}
                placeholder="관리자명을 입력하세요"
                onChange={handleChange}
              />
            </div>
            <div className="role-group">
              <label style={{ marginBottom: "15px" }}> </label>
              <div className="flex-row5" style={{ gap: "20px" }}>
                <select name="role" value={userData.role} onChange={handleChange}>
                  <option value="의사">의사</option>
                  <option value="관리자">관리자</option>
                </select>

              </div>
            </div>
          </div>

          <label>이메일</label>
          <div className="flex-row" style={{ gap: "5px" }}>
            <input
              type="text"
              name="emailLocal"
              className="Mp_email1"
              value={userData.emailLocal}
              placeholder="이메일 아이디"
              onChange={handleChange}
            />
            <span>@</span>
            <input
              type="text"
              name="emailDomain"
              className="Mp_email2"
              value={userData.emailDomain}
              placeholder="도메인"
              onChange={handleChange}
            />
          </div>

          <label>기관명</label>
          <div className="flex-row">
            <input
              type="text"
              name="centerId"
              value={userData.centerId}
              className="Mp_centerId"
              placeholder="기관명을 입력하세요"
              onChange={handleChange}
            />
            <button type="button" className="search-btn" onClick={handleSearchCenter}>
              검색
            </button>
          </div>


          <input
            type="text"
            name="address"
            value={userData.address}
            className="Mp_add"
            placeholder="주소를 입력하세요"
            onChange={handleChange}
          />
          <button type="button" className="action-btn" onClick={handleUpdate}>
            수정 완료
          </button>
          <div className="mypage-btn-row">
            <button type="button" className="password-btn" onClick={handlePasswordChangePage}>
              비밀번호 변경
            </button>
            <button type="button" className="delete-btn" onClick={() => setShowDeleteModal(true)}>
              회원탈퇴
            </button>
          </div>
        </form>

        {/* 탈퇴 모달 */}
        {showDeleteModal && (
          <>
            <div className="modal-overlay"></div> {/* ✅ 배경 어둡게 */}
            <div className="delete-modal">
              <div className="modal-content">
                <div className="modal-header">
                  <h2>회원 탈퇴</h2>
                </div>
                <div className="modal-body" style={{ flexDirection: "column", padding: "20px" }}>
                  <p>비밀번호를 입력해주세요</p>
                  <input
                    type="password"
                    placeholder="비밀번호"
                    value={deletePassword}
                    onChange={e => setDeletePassword(e.target.value)}
                    style={{ width: "100%", marginBottom: "10px" }}
                  />
                  <div style={{ textAlign: "right" }}>
                    <button className="small-btn delete-confirm" onClick={handleDelete} style={{ marginRight: "10px" }}>
                      탈퇴하기
                    </button>
                    <button className="small-btn" onClick={closeDeleteModal}>
                      취소
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}



        {/* 지도/검색 모달 */}
        {showModal && (
          <div className="search-modal">
            <div className="modal-header">
              <h2>지도 및 검색 결과</h2>
              <button className="close-btn" onClick={closeModal}>닫기</button>
            </div>
            <div className="modal-body">
              <div className="map-area" id="map"></div>
              <div className="list-area">
                <ul>
                  {places.map((place, i) => (
                    <li
                      key={i}
                      onClick={() => {
                        // ▼ place_name => centerId / address_name => address
                        setUserData(prev => ({
                          ...prev,
                          centerId: place.place_name,    // 클릭 시 기관명에 결과명 반영
                          address: place.address_name    // 주소 필드도 세팅
                        }));
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
    </>
  );
}

export default Mypage;
