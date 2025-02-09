import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { KakaoMapContext } from "../App";
import axios from "axios";
import "./Mypage.css";
import Menu from "./Menu";
import warningIcon from "./png/warning.png";
import checkmarkIcon from "./png/checkmark.png";

function Mypage() {
  const navigate = useNavigate();
  const kakaoMaps = useContext(KakaoMapContext);
  const [userData, setUserData] = useState({
    userId: "",
    userName: "",
    role: "",
    emailLocal: "",
    emailDomain: "",
    centerId: "",
    address: ""
  });

  const [places, setPlaces] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [myShowDeleteModal, setMyShowDeleteModal] = useState(false);
  const [myDeletePassword, setMyDeletePassword] = useState("");
  const [myModalClosing, setMyModalClosing] = useState(false); // ✅ 모달 닫기 애니메이션 상태 추가
  const [showSuccessModal, setShowSuccessModal] = useState(false); // ✅ 수정 완료 모달 상태 추가

  const closeMyDeleteModal = () => {
    setMyModalClosing(true); // ✅ 애니메이션 적용
    setTimeout(() => {
      setMyShowDeleteModal(false);
      setMyModalClosing(false);
      setMyDeletePassword("");
    }, 300); // ✅ 애니메이션 지속 시간 (0.3s) 후 상태 변경
  };
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

  const handleUpdate = async () => {
    if (!validateInputs()) return;

    const fullEmail = `${userData.emailLocal}@${userData.emailDomain}`;
    const sendData = {
      ...userData,
      email: fullEmail
    };

    try {
      await axios.put(`${process.env.REACT_APP_DB_URL}/users/update`, sendData, {
        headers: { "Content-Type": "application/json" }
      });

      setShowSuccessModal(true); // ✅ 모달 표시
      setTimeout(() => {
        setShowSuccessModal(false); // ✅ 3초 후 자동 닫힘
        navigate("/main");
      }, 3000);
    } catch (err) {
      console.error(err);
      alert("정보 수정에 실패했습니다.");
    }
  };

  // ✅ 모달 수동 닫기 함수
  const closeSuccessModal = () => {
    setShowSuccessModal(false);
    navigate("/main");
  };

  {
    showSuccessModal && (
      <div className="my-success-modal-overlay" onClick={closeSuccessModal}>
        <div className="my-success-modal">
          <p>정보가 수정되었습니다.</p>
          <button onClick={closeSuccessModal}>확인</button>
        </div>
      </div>
    )
  }

  const handleBackToMain = () => {
    navigate("/main");
  };

  const handlePasswordChangePage = () => {
    navigate("/findpw");
  };

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

  const handleSearchCenter = () => {
    if (!userData.centerId.trim()) {
      alert("기관명을 입력하세요!");
      return;
    }

    if (kakaoMaps) {
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
      <Menu />
      <div className="mypage-container">
        <button className="back-btn" onClick={handleBackToMain}>X</button>
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

        {showDeleteModal && (
          <>
            <div className="my-modal-overlay" onClick={closeDeleteModal}></div>
            <div className="my-delete-modal">
              <div className="my-modal-header">

              </div>
              <div className="my-modal-body">
                <img src={warningIcon} alt="경고" className="my-warning-icon" /> {/* ✅ 경고 아이콘 추가 */}
                <p>탈퇴하시려면 비밀번호를 입력해주세요</p>
                <input
                  type="password"
                  placeholder="비밀번호"
                  value={deletePassword}
                  onChange={e => setDeletePassword(e.target.value)}
                />
                <div>
                  <button className="my-small-btn my-delete-confirm" onClick={handleDelete}>
                    탈퇴하기
                  </button>
                  <button className="my-small-btn my-cancel-btn" onClick={closeDeleteModal}>
                    취소
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ✅ 수정 완료 모달 */}
        {showSuccessModal && (
          <div className="my-success-modal-overlay" onClick={closeSuccessModal}>
            <div className="my-success-modal">
              <img src={checkmarkIcon} alt="완료" className="my-success-icon" /> {/* ✅ 아이콘 추가 */}
              <p>회원정보가 수정되었습니다.</p>
              <button onClick={closeSuccessModal}>확인</button>
            </div>
          </div>
        )}

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
                        setUserData(prev => ({
                          ...prev,
                          centerId: place.place_name,
                          address: place.address_name
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
