// src/component/Result.jsx
import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import DateList from "./Xray/DateList";
import "./Result.css";

function Result() {
  const location = useLocation();
  const navigate = useNavigate();

  // 넘어온 state
  const patient = location.state?.patient || null;
  const [aiResult, setAiResult] = useState(location.state?.aiResult || "정상"); 
  const newlyUploaded = location.state?.newlyUploaded || [];
  const bigFilename = location.state?.bigFilename || null;
  const fromHistory = location.state?.fromHistory || false;
  const preSelectedDate = location.state?.selectedDate || null;

  // X-ray 목록
  const [xrayList, setXrayList] = useState([]);
  const [selectedXray, setSelectedXray] = useState(null);
  const [bigPreview, setBigPreview] = useState(null);

  // 병원 안내(새 진단) or 과거 병원(이전 결과)
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const markerRefs = useRef({});

  // 날짜 목록
  const [diagDates, setDiagDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(preSelectedDate);
  const [datePage, setDatePage] = useState(1);
  const datesPerPage = 5;

  // [추가] 로그인 사용자 정보 (기관명/이메일/주소/의사이름 등)
  const [loginUser, setLoginUser] = useState(null);

  // ---------------- 1) 마운트 시 유저정보, X-ray 날짜목록 불러오기 ----------------
  useEffect(() => {
    // A. 환자 유효성 체크
    if (!patient) {
      alert("잘못된 접근입니다. 메인페이지로 이동");
      navigate("/main");
      return;
    }

    // B. 로그인 유저 정보 가져오기
    const storedUserId = sessionStorage.getItem("userId");
    if (storedUserId) {
      axios
        .get(`${process.env.REACT_APP_DB_URL}/users/mypage?userId=${storedUserId}`, { withCredentials:true })
        .then(res => setLoginUser(res.data))
        .catch(err => console.error("유저 정보 불러오기 실패:", err));
    }

    // C. 환자 X-ray 날짜 목록
    axios
      .get(`${process.env.REACT_APP_DB_URL}/xray/dates?pIdx=${patient.pIdx}`)
      .then((res) => {
        setDiagDates(res.data);
        // 새 진단 모드 && 아직 날짜 선택안됨 => 최신 날짜
        if (!fromHistory && !selectedDate && res.data.length > 0) {
          setSelectedDate(res.data[0]);
        }
      })
      .catch((err) => console.error(err));
  }, [patient, navigate, fromHistory, selectedDate]);

  // ---------------- 2) 날짜 선택 => X-ray 목록, 과거결과(병원/진단) ----------------
  useEffect(() => {
    if (!selectedDate) return;

    // (A) X-ray 목록
    axios
      .get(`${process.env.REACT_APP_DB_URL}/xray/byDate?pIdx=${patient.pIdx}&date=${selectedDate}`)
      .then((res) => {
        setXrayList(res.data);
        if (res.data.length > 0) {
          const bigOne = res.data.find((x) => x.bigXray != null);
          if (bigOne) {
            setSelectedXray(bigOne);
            setBigPreview(`${process.env.REACT_APP_DB_URL2}/images/${bigOne.bigXray}`);
          } else {
            setSelectedXray(res.data[0]);
            setBigPreview(`${process.env.REACT_APP_DB_URL2}/images/${res.data[0].imgPath}`);
          }
        } else {
          setSelectedXray(null);
          setBigPreview(null);
        }
      })
      .catch((e) => console.error(e));

    // (B) 이전결과 모드 => diagnosis_result + hospital
    if (fromHistory) {
      axios
        .get(`${process.env.REACT_APP_DB_URL}/diagnosis-result/byDate?pIdx=${patient.pIdx}&date=${selectedDate}`)
        .then((res) => {
          if (res.data && res.data.length > 0) {
            // 첫 번째 진단 결과
            const firstDiag = res.data[0];
            setAiResult(firstDiag.diagnosis);

            // 병원 상세
            const hosIdx = firstDiag.hosIdx;
            return axios.get(`${process.env.REACT_APP_DB_URL}/hospitals/${hosIdx}`);
          } else {
            throw new Error("No past diagnosis data");
          }
        })
        .then((hosRes) => {
          setSelectedHospital(hosRes.data); 
        })
        .catch((err) => {
          console.log("과거 병원 데이터 없음 => ", err.message);
          setSelectedHospital(null);
        });
    } else {
      // 새 진단 => 병원 선택 초기화
      setSelectedHospital(null);
    }
  }, [selectedDate, fromHistory, patient]);

  // ---------------- 3) 병원 안내 (새 진단 모드) ----------------
  useEffect(() => {
    if (!patient) return;
    if (fromHistory) return; 
    const latNum = parseFloat(patient.pLat);
    const lngNum = parseFloat(patient.pLng);
    if (!latNum || !lngNum) {
      console.log("좌표없음 => 병원 안내불가");
      return;
    }
    let url = `${process.env.REACT_APP_DB_URL}/hospitals/near?lat=${latNum}&lng=${lngNum}&limit=5`;
    if (aiResult === "결핵") {
      url = `${process.env.REACT_APP_DB_URL}/hospitals/near/disease?lat=${latNum}&lng=${lngNum}&disease=결핵&limit=5`;
    } else if (aiResult === "폐렴") {
      url = `${process.env.REACT_APP_DB_URL}/hospitals/near/disease?lat=${latNum}&lng=${lngNum}&disease=폐렴&limit=5`;
    }

    axios
      .get(url)
      .then((res) => {
        setHospitals(res.data);
      })
      .catch((err) => console.error(err));
  }, [patient, fromHistory, aiResult]);

  // ---------------- 4) 지도 생성 ----------------
  useEffect(() => {
    if (!mapRef.current) return;
    if (map) return;
    const { kakao } = window;
    if (!kakao) return;

    const latNum = parseFloat(patient?.pLat) || 37.5665;
    const lngNum = parseFloat(patient?.pLng) || 126.9780;
    const option = {
      center: new kakao.maps.LatLng(latNum, lngNum),
      level: 5,
    };
    const createdMap = new kakao.maps.Map(mapRef.current, option);
    setMap(createdMap);
  }, [mapRef, map, patient]);

  // ---------------- 5) 병원 마커 표시 ----------------
  useEffect(() => {
    if (!map) return;

    // 이전 마커 제거
    Object.values(markerRefs.current).forEach((obj) => {
      obj.marker.setMap(null);
    });
    markerRefs.current = {};

    if (fromHistory) {
      if (!selectedHospital) return;
      createSingleMarker(selectedHospital);
    } else {
      const { kakao } = window;
      hospitals.forEach((h) => {
        if (!h.lat || !h.lng) return;
        const pos = new kakao.maps.LatLng(h.lat, h.lng);
        const marker = new kakao.maps.Marker({ map, position: pos });
        const info = new kakao.maps.InfoWindow({
          content: `<div style="padding:5px; background:#fff; color:#000; border:1px solid #ccc;">${h.hosName}</div>`,
        });
        kakao.maps.event.addListener(marker, "click", () => info.open(map, marker));
        markerRefs.current[h.hosIdx] = { marker, info };
      });
    }
  }, [map, fromHistory, hospitals, selectedHospital]);

  function createSingleMarker(h) {
    const { kakao } = window;
    if (!map || !kakao) return;
    if (!h.lat || !h.lng) return;

    const pos = new kakao.maps.LatLng(h.lat, h.lng);
    const marker = new kakao.maps.Marker({ map, position: pos });
    const info = new kakao.maps.InfoWindow({
      content: `<div style="padding:5px; background:#fff; color:#000; border:1px solid #ccc;">${h.hosName}</div>`,
    });
    kakao.maps.event.addListener(marker, "click", () => info.open(map, marker));
    markerRefs.current[h.hosIdx] = { marker, info };
    map.setCenter(pos);
  }

  // 병원 라디오 선택(새 진단)
  useEffect(() => {
    if (!map || fromHistory || !selectedHospital) return;
    const refObj = markerRefs.current[selectedHospital];
    if (refObj) {
      map.setCenter(refObj.marker.getPosition());
      refObj.info.open(map, refObj.marker);
    }
  }, [map, fromHistory, selectedHospital]);

  // 썸네일 클릭
  function handleThumbClick(x) {
    setSelectedXray(x);
    if (x.bigXray) {
      setBigPreview(`${process.env.REACT_APP_DB_URL2}/images/${x.bigXray}`);
    } else {
      setBigPreview(`${process.env.REACT_APP_DB_URL2}/images/${x.imgPath}`);
    }
  }

  // 날짜 클릭
  function handleDateClick(d) {
    setSelectedDate(d);
  }

  // 병원 클릭
  function handleHospitalClick(h) {
    setSelectedHospital(h.hosIdx);
  }

  // 새 진단 결과 저장
  async function handleSaveDiagnosis() {
    if (!selectedHospital) {
      alert("가까운 병원 중 하나를 선택해주세요!");
      return;
    }
    const userId = sessionStorage.getItem("userId") || "testDoctor";

    try {
      const matched = xrayList.filter((x) =>
        newlyUploaded.some((orig) => x.imgPath.includes(orig))
      );
      if (matched.length === 0) {
        alert("업로드된 X-ray와 매칭이 없습니다.");
        return;
      }
      // XRAY 업데이트
      for (const img of matched) {
        await axios.put(`${process.env.REACT_APP_DB_URL}/xray/updateResult`, {
          imgIdx: img.imgIdx,
          result: aiResult,
        });
      }
      // diagnosis-result insert
      for (const img of matched) {
        const body = {
          pIdx: patient.pIdx,
          imgIdx: img.imgIdx,
          diagnosis: aiResult,
          doctorId: userId,
          hosIdx: selectedHospital,
        };
        await axios.post(`${process.env.REACT_APP_DB_URL}/diagnosis-result`, body, {
          headers: { "Content-Type": "application/json" },
        });
      }
      alert("진단 결과 저장 완료!");
    } catch (e) {
      console.error(e);
      alert("저장 중 오류 발생");
    }
  }

  // 뒤로가기
  function handleGoBack() {
    navigate("/main");
  }

  // [★] 출력하기: PrintPage.jsx로 데이터 전달
  function handlePrint() {
    if (!loginUser) {
      alert("로그인 사용자 정보를 불러오지 못했습니다.");
      return;
    }
    navigate("/print", {
      state: {
        // 환자
        patient,
        aiResult,
        // X-ray 미리보기
        bigPreview,
        // 과거 or 새 진단에서 선택된 병원
        selectedHospital,

        // 로그인 유저 정보
        centerId: loginUser.centerId,     // 기관명
        userName: loginUser.userName,     // 의사 이름
        userEmail: loginUser.email,       // 이메일
        userAddress: loginUser.address,   // 의료기관 주소

        // 진단 날짜(= X-ray 날짜)
        diagDate: selectedDate,
      },
    });
  }
  useEffect(() => {
    if (!window.kakao || !window.kakao.maps) {
      console.error("Kakao 지도 API가 로드되지 않았습니다.");
      return;
    }
  
    const latNum = parseFloat(patient?.pLat) || 37.5665;
    const lngNum = parseFloat(patient?.pLng) || 126.9780;
    console.log("지도 생성 - 위도:", latNum, "경도:", lngNum);
  
    const mapOption = {
      center: new window.kakao.maps.LatLng(latNum, lngNum),
      level: 5,
    };
  
    const newMap = new window.kakao.maps.Map(mapRef.current, mapOption);
    setMap(newMap);
  }, [mapRef, patient]);
  
  axios
  .get(`${process.env.REACT_APP_DB_URL}/xray/dates?pIdx=${patient.pIdx}`, {
    withCredentials: false, // ✅ 서드파티 쿠키 사용 방지
  })
  .then((res) => {
    setDiagDates(res.data);
    if (!fromHistory && !selectedDate && res.data.length > 0) {
      setSelectedDate(res.data[0]);
    }
  })
  .catch((err) => console.error(err));

  return (
    <div className="result-container">
      {/* 상단 바 */}
      <div className="result-topbar">
        <h2>진단 결과 페이지</h2>
        <div>
          <button onClick={handleGoBack}>뒤로가기</button>
          <button onClick={handlePrint} style={{ marginLeft: "10px" }}>
            출력하기
          </button>
        </div>
      </div>

      <div className="result-main">
        {/* 왼쪽 패널 */}
        <div className="result-left-panel">
          <div className="patient-info-box">
            <h3>환자 정보</h3>
            {patient && (
              <>
                <p>이름: {patient.pName}</p>
                <p>생년월일: {patient.birth}</p>
                <p>연락처: {patient.tel}</p>
                <p>주소: {patient.pAdd}</p>
              </>
            )}
          </div>

          <div className="date-list-box">
            <h3>진단 날짜</h3>
            <DateList
              diagDates={diagDates}
              currentPage={datePage}
              setCurrentPage={setDatePage}
              datesPerPage={datesPerPage}
              onDateClick={handleDateClick}
            />
          </div>

          <div className="ai-result-box">
            <h3>AI 진단 결과</h3>
            <p>{aiResult}</p>
          </div>
        </div>

        {/* 중앙 패널 */}
        <div className="result-center-panel">
          <div className="big-preview-box">
            {bigPreview ? (
              <img src={bigPreview} alt="bigXray" className="big-xray-image" />
            ) : (
              <div style={{ color: "#ccc" }}>X-ray가 없습니다.</div>
            )}
          </div>
          <div className="thumb-list">
            {xrayList.map((x) => (
              <div
                key={x.imgIdx}
                className="thumb-item"
                onClick={() => handleThumbClick(x)}
              >
                <img src={`${process.env.REACT_APP_DB_URL2}/images/${x.imgPath}`} alt="thumb" />
              </div>
            ))}
          </div>
        </div>

        {/* 오른쪽 패널 */}
        <div className="result-right-panel">
          {fromHistory ? (
            <>
              <h3>과거 선택 병원</h3>
              {selectedHospital ? (
                <div>
                  <p><b>{selectedHospital.hosName}</b></p>
                  <p>{selectedHospital.hosAdd}</p>
                </div>
              ) : (
                <p>저장된 병원 정보가 없습니다.</p>
              )}
              <div ref={mapRef} className="hospital-map" />
            </>
          ) : (
            <>
              <h3>가까운 병원 안내</h3>
              {(!patient?.pLat || !patient?.pLng) ? (
                <p>※ 환자 좌표가 없어 안내 불가</p>
              ) : (
                <>
                  {hospitals.length > 0 ? (
                    <div>
                      {hospitals.map((h, i) => (
                        <div
                          key={h.hosIdx}
                          style={{ marginBottom: "5px", cursor: "pointer" }}
                          onClick={() => handleHospitalClick(h)}
                        >
                          <input
                            type="radio"
                            name="hospitalSelect"
                            value={h.hosIdx}
                            checked={selectedHospital === h.hosIdx}
                            onChange={() => setSelectedHospital(h.hosIdx)}
                            style={{ marginRight: "5px" }}
                          />
                          <b>{i + 1}. {h.hosName}</b>
                          <br />
                          <span style={{ fontSize: "14px" }}>{h.hosAdd}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>병원 목록이 없습니다.</p>
                  )}
                  <div ref={mapRef} className="hospital-map" />
                  <button onClick={handleSaveDiagnosis} style={{ marginTop: "20px" }}>
                    진단 결과 저장하기
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Result;
