import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./MyPage.css";

function MyPage() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    userId: "", // 세션에서 가져올 사용자 ID
    userName: "",
    role: "",
    email: "",
    centerId: "",
    address: "",
  });

  const [places, setPlaces] = useState([]); // 카카오 API 검색 결과
  const [showModal, setShowModal] = useState(false); // 주소 검색 모달
  const [showDeleteModal, setShowDeleteModal] = useState(false); // 탈퇴 모달
  const [deletePassword, setDeletePassword] = useState(""); // 탈퇴 모달의 비밀번호

    // 카카오 맵 스크립트를 동적으로 로드
    useEffect(() => {
      const loadKakaoMaps = () => {
        const script = document.createElement("script");
        script.async = true;
        script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=YOUR_APP_KEY&autoload=false`;
        document.head.appendChild(script);
  
        script.onload = () => {
          window.kakao.maps.load(() => {
            console.log("Kakao Maps ready.");
          });
          
        };
      };
  
      loadKakaoMaps();
    }, []);
  
  // 세션에서 사용자 ID 가져오기
  useEffect(() => {
    const userId = sessionStorage.getItem("userId");
    
    setUserData((prev) => ({ ...prev, userId })); // 사용자 ID만 설정
  }, [navigate]);

  // 입력 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };

  // 입력 데이터 검증 함수
  const validateInputs = () => {
    const { userName, role, email, centerId, address } = userData;

    // 필수 입력값이 비어 있는지 확인
    if (!userName.trim() || !role.trim() || !email.trim() || !centerId.trim() || !address.trim()) {
        alert("모든 필드를 입력해주세요.");
        return false;
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert("유효한 이메일을 입력해주세요.");
        return false;
    }

    return true; // 모든 검증 통과
};

// 정보 수정
const handleUpdate = async () => {
    if (!validateInputs()) {
        return; // 입력 검증 실패 시 수정 중단
    }

    try {
        await axios.put(`${process.env.REACT_APP_DB_URL}/users/update`, userData, {
            headers: { "Content-Type": "application/json" },
        });
        alert("정보가 수정되었습니다.");
        navigate("/main");
    } catch (error) {
        console.error("정보 수정 실패:", error);
        alert("정보 수정에 실패했습니다.");
    }
};

  // 비밀번호 변경 페이지 이동
  const handlePasswordChangePage = () => {
    navigate("/findpw");
  };

  // 회원 탈퇴
  const handleDelete = async () => {
    try {
        const response = await axios.post(`${process.env.REACT_APP_DB_URL}/users/delete`, {
            userId: userData.userId,
            password: deletePassword,
        });

        if (response.status === 200) {
            alert("회원 탈퇴 성공!");
            sessionStorage.clear();
            navigate("/");
        }
    } catch (error) {
        console.error("회원 탈퇴 실패:", error);
        if (error.response?.status === 401) {
            alert("비밀번호가 일치하지 않습니다.");
        } else {
            alert("회원 탈퇴에 실패했습니다.");
        }
    }
};

  // 기관명 검색 (카카오 지도 API)
  const handleSearchCenter = () => {
    if (!userData.centerId.trim()) {
      alert("기관명을 입력해주세요.");
      return;
    }

    const ps = new window.kakao.maps.services.Places();
    ps.keywordSearch(userData.centerId, (data, status) => {
      if (status === window.kakao.maps.services.Status.OK) {
        setPlaces(data);
        setShowModal(true);
      } else {
        alert("검색 결과가 없습니다.");
      }
    });
  };

  // 지도 모달 초기화
  useEffect(() => {
    if (showModal) {
        const mapContainer = document.getElementById("map"); // 지도를 표시할 div
        const mapOption = {
            center: new window.kakao.maps.LatLng(37.5665, 126.978), // 지도의 초기 좌표
            level: 3, // 지도의 확대 레벨
        };
        const map = new window.kakao.maps.Map(mapContainer, mapOption);

        // 검색 결과가 있을 경우 첫 번째 결과로 지도 중심 이동
        if (places.length > 0) {
            const bounds = new window.kakao.maps.LatLngBounds();
            places.forEach((place) => {
                const markerPosition = new window.kakao.maps.LatLng(place.y, place.x);
                bounds.extend(markerPosition);

                // 마커 생성
                new window.kakao.maps.Marker({
                    map,
                    position: markerPosition,
                });
            });
            map.setBounds(bounds);
        }
    }
}, [showModal, places]);

  const closeModal = () => {
    setShowModal(false);
    setPlaces([]);
  };

  // 탈퇴 모달 닫기
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeletePassword("");
  };

  return (
    <div>
        <h1>MY PAGE</h1>
        <form>
            <div>
                <label>* 사용자 ID</label>
                <div>{userData.userId}</div>
            </div>

            <div>
                <label>관리자명</label>
                <input
                    type="text"
                    name="userName"
                    value={userData.userName}
                    placeholder="관리자명을 입력하세요"
                    onChange={handleChange}
                />
           

                <label>사용자 직업</label>
                <div>
                    <label>
                        <input
                            type="radio"
                            name="role"
                            value="의사"
                            checked={userData.role === "의사"}
                            onChange={handleChange}
                        />
                        의사
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="role"
                            value="관리자"
                            checked={userData.role === "관리자"}
                            onChange={handleChange}
                        />
                        관리자
                    </label>
                </div>
            </div>

            <div>
                <label>이메일</label>
                <input
                    type="email"
                    name="email"
                    value={userData.email}
                    placeholder="이메일을 입력하세요"
                    onChange={handleChange}
                />
            </div>

            <div>
                <label>기관명</label>
                <input
                    type="text"
                    name="centerId"
                    value={userData.centerId}
                    placeholder="기관명을 입력하세요"
                    onChange={handleChange}
                />
                <button type="button" onClick={handleSearchCenter}>
                    검색
                </button>
            </div>

            <div>
                <label>기관 주소</label>
                <input
                    type="text"
                    name="address"
                    value={userData.address}
                    placeholder="주소를 입력하세요"
                    onChange={handleChange}
                />
            </div>

            <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
                <button type="button" onClick={handleUpdate}>
                    정보 수정
                </button>
                <button type="button" onClick={handlePasswordChangePage}>
                    비밀번호 변경
                </button>
                <button type="button" onClick={() => setShowDeleteModal(true)}>
                    탈퇴하기
                </button>
            </div>
        </form>

        {/* 탈퇴 모달 */}
        {showDeleteModal && (
            <div style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                background: "white",
                padding: "20px",
                borderRadius: "10px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                zIndex: 1000,
            }}>
                <h2>회원 탈퇴</h2>
                <p>비밀번호를 입력하고 회원 탈퇴를 진행하세요.</p>
                <input
                    type="password"
                    placeholder="비밀번호 입력"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    style={{ width: "100%", padding: "5px" }}
                />
                <div style={{ marginTop: "10px", textAlign: "right" }}>
                    <button onClick={handleDelete} style={{ marginRight: "10px" }}>탈퇴하기</button>
                    <button onClick={closeDeleteModal}>취소</button>
                </div>
            </div>
        )}

        {/* 지도 모달 */}
        {showModal && (
            <div style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                background: "white",
                padding: "20px",
                borderRadius: "10px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                zIndex: 1000,
                width: "80%",
                height: "80%",
            }}>
                <h2>지도 및 검색 결과</h2>
                <button onClick={closeModal} style={{ float: "right", marginBottom: "10px" }}>
                    닫기
                </button>
                <div style={{ display: "flex", gap: "10px", height: "100%" }}>
                    {/* 지도 영역 */}
                    <div id="map" style={{ width: "60%", height: "100%" }}></div>

                    {/* 검색 결과 목록 */}
                    <div style={{
                        width: "40%",
                        height: "100%",
                        overflowY: "scroll",
                        border: "1px solid #ddd",
                        padding: "10px",
                    }}>
                        <ul>
                            {places.map((place, index) => (
                                <li
                                    key={index}
                                    style={{ cursor: "pointer", marginBottom: "10px" }}
                                    onClick={() => {
                                        setUserData({ ...userData, address: place.address_name });
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

export default MyPage;