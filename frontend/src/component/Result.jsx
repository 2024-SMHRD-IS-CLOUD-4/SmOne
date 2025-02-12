// src/component/Result.jsx
import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import DateList from "./Xray/DateList";
import "./Result.css";
import Menu from "./Menu";
import printerIcon from "./png/printerimg.png";
import warningIcon from "./png/yellowwarning.png";
import checkmarkIcon from "./png/checkmark.png";

function Result() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showHospitalWarningModal, setShowHospitalWarningModal] = useState(false); // ✅ 병원 선택 요청 모달 상태 추가
  const [hideHospitalWarningModal, setHideHospitalWarningModal] = useState(false); // ✅ 숨김 애니메이션 상태 추가
  const [hideSaveWarningModal, setHideSaveWarningModal] = useState(false);
  const [showSaveWarningModal, setShowSaveWarningModal] = useState(false); // ✅ 진단 저장 요청 모달 상태 추가
  const [showDiagnosisSuccessModal, setShowDiagnosisSuccessModal] = useState(false); // ✅ 진단 저장 완료 모달 상태 추가
  const [hideDiagnosisSuccessModal, setHideDiagnosisSuccessModal] = useState(false); // ✅ 숨김 애니메이션 상태 추가

  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

  // X-ray 목록
  const [xrayList, setXrayList] = useState([]);
  const [selectedXray, setSelectedXray] = useState(null);

  const [selectedImage, setSelectedImage] = useState(null);
  const [aiResult, setAiResult] = useState([{ diagnosis: "TB" }]);
  const formattedAiResult = Array.isArray(aiResult) ? aiResult : [aiResult];

  const handleImageClick = (image) => {
    setSelectedImage(image);
  }

  // 그리기 상태
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#FF0000");
  const [lineWidth, setLineWidth] = useState(3);

  // 넘어온 state
  const patient = location.state?.patient || null;

  useEffect(() => {
    setAiResult([{ diagnosis: "TB" }]);
    if (xrayList.length > 0) {
      setSelectedXray(xrayList[0]); // 첫 번째 X-ray 선택
      setBigPreview(correctImageUrl(xrayList[0].imgPath));
      const firstDiagnosis = location.state.aiResult.find(
        (result) => String(result.img_idx) === String(xrayList[0].imgIdx)
      );
      setSelectedDiagnosis(firstDiagnosis || null);
    }
  }, [location.state?.aiResult]);

  const { state } = location;
  const { newlyUploaded } = state || { newlyUploaded: [] };
  // const bigFilename = location.state?.bigFilename || null;
  const fromHistory = location.state?.fromHistory || false;
  const preSelectedDate = location.state?.selectedDate || null;

  // 큰 이미지 미리보기 + 확대/이동
  const [bigPreview, setBigPreview] = useState(null);
  const bigImgRef = useRef(null);
  const [baseScale, setBaseScale] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);

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

  // 로그인 사용자 정보
  const [loginUser, setLoginUser] = useState(null);

  // 새 진단 모드에서 "진단 결과 저장 완료" 여부
  const [hasSaved, setHasSaved] = useState(false);
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = bigImgRef.current?.offsetWidth || 500;
      canvas.height = bigImgRef.current?.offsetHeight || 500;
      const ctx = canvas.getContext("2d");

      const prevImage = ctx.getImageData(0, 0, canvas.width, canvas.height);

      ctx.lineJoin = "round";
      ctx.lineCap = "round";

      ctxRef.current = ctx;

      ctx.putImageData(prevImage, 0, 0);
      ctxRef.current.strokeStyle = "red";
      ctxRef.current.lineWidth = 3;
    }
  }, [bigPreview]);

  useEffect(() => {
    if (ctxRef.current) {
      ctxRef.current.strokeStyle = color;
      ctxRef.current.lineWidth = lineWidth;
    }
  }, [color, lineWidth]);

  // 마우스 이벤트 핸들러
  const startDrawing = (e) => {
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    ctxRef.current.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctxRef.current.stroke();
  };

  const stopDrawing = () => {
    ctxRef.current.closePath();
    setIsDrawing(false);
  };

  // 캔버스 지우기
  const clearCanvas = () => {
    ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  const correctImageUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    return `https://kr.object.ncloudstorage.com/ilungview-bucket/${url}`;
  };
  const [selectedDiagnosis, setSelectedDiagnosis] = useState(null);
  
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
        .get(`${process.env.REACT_APP_DB_URL}/users/mypage?userId=${storedUserId}`, { withCredentials: true })
        .then(res => {
          setLoginUser(res.data)
        })
        .catch(err => console.error("유저 정보 불러오기 실패:", err));
    }

    // C. 환자 X-ray 날짜 목록
    axios
      .get(`${process.env.REACT_APP_DB_URL}/xray/dates?pIdx=${patient.pIdx}`)
      .then((res) => {
        setDiagDates(res.data);
        if (!fromHistory && !selectedDate && res.data.length > 0) {
          setSelectedDate(res.data[0]);
        }
      })
      .catch(err => console.error(err));
  }, [patient, navigate, fromHistory, selectedDate]);

  // ---------------- 2) 날짜 선택 => X-ray 목록, 과거결과(병원/진단) ----------------
  useEffect(() => {
    if (!selectedDate || !patient) return;
    axios
      .get(`${process.env.REACT_APP_DB_URL}/xray/byDate?pIdx=${patient.pIdx}&date=${selectedDate}`)
      .then((res) => {
        setXrayList(res.data);
        if (res.data.length > 0) {
          const firstXray = res.data[0];
          setSelectedXray(firstXray);
          setBigPreview(correctImageUrl(firstXray.imgPath));
        }
      })
      .catch((err) => console.error("❌ X-ray 목록 불러오기 실패:", err));
  }, [selectedDate, patient]);

  useEffect(() => {
    if (!fromHistory || !selectedDate || !patient) return;

    console.log("📌 API 요청 시작: 과거 진단 결과 불러오기...");
    console.log(`📌 요청 URL: ${process.env.REACT_APP_DB_URL}/diagnosis-result/byDate?pIdx=${patient.pIdx}&date=${selectedDate}`);

    axios
    .get(`${process.env.REACT_APP_DB_URL}/diagnosis-result/byDate?pIdx=${patient.pIdx}&date=${selectedDate}`)
    .then((res) => {
      console.log("✅ 과거 진단 결과 API 응답:", res); // << 전체 응답 확인
      console.log("📌 diagnosisResults:", res.data.diagnosisResults); // << diagnosisResults 값 확인

      if (res.data && res.data.diagnosisResults) {
        setAiResult(res.data.diagnosisResults);
        console.log("📌 불러온 과거 AI 진단 결과:", res.data.diagnosisResults);
      } else {
        console.warn("⚠️ 과거 진단 결과 없음!");
      }
    })
    .catch((err) => console.error("❌ 과거 진단 결과 불러오기 실패:", err));
}, [fromHistory, selectedDate, patient]);

  // ---------------- 3) 병원 안내 (새 진단 모드) ----------------
  useEffect(() => {
    if (!patient || fromHistory) return;
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
    axios.get(url)
      .then(res => setHospitals(res.data))
      .catch(err => console.error(err));
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
    Object.values(markerRefs.current).forEach((obj) => {
      obj.marker.setMap(null);
    });
    markerRefs.current = {};

    const { kakao } = window;
    if (fromHistory) {
      if (!selectedHospital) return;
      createSingleMarker(selectedHospital);
    } else {
      hospitals.forEach((h, i) => {
        if (!h.lat || !h.lng) return;
        const pos = new kakao.maps.LatLng(h.lat, h.lng);
        const marker = new kakao.maps.Marker({ map, position: pos });

        const infoHtml = `
          <div style="padding:5px; background:#fff; border:1px solid #ccc; color: black">
            <strong>${i + 1}. ${h.hosName}</strong><br/>
            <span style="font-size:13px;">${h.hosAdd}</span>
          </div>
        `;
        const info = new kakao.maps.InfoWindow({ content: infoHtml });
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
    const infoHtml = `
      <div style="padding:5px; background:#fff; border:1px solid #ccc;">
        <strong>${h.hosName}</strong><br/>
        <span style="font-size:13px;">${h.hosAdd}</span>
      </div>
    `;
    const info = new kakao.maps.InfoWindow({ content: infoHtml });
    kakao.maps.event.addListener(marker, "click", () => info.open(map, marker));
    markerRefs.current[h.hosIdx] = { marker, info };
    map.setCenter(pos);
  }

  // 병원 라디오 선택(새 진단)
  useEffect(() => {
    if (!map || fromHistory || !selectedHospital) return;
    const refObj = markerRefs.current[selectedHospital.hosIdx];
    if (refObj) {
      map.setCenter(refObj.marker.getPosition());
      refObj.info.open(map, refObj.marker);
    }
  }, [map, fromHistory, selectedHospital]);

  // 썸네일 클릭
  function handleThumbClick(imgPath) {
    console.log("🟢 aiResult:", aiResult);
    if (!imgPath) return;
    const clickedXray = xrayList.find(
      (xray) => correctImageUrl(xray.imgPath) === correctImageUrl(imgPath)
    );
  
    if (!clickedXray) {
      console.warn("⚠️ 선택한 X-ray를 찾을 수 없음!");
      return;
    }
    setBigPreview(correctImageUrl(imgPath));
    setSelectedXray(clickedXray);
    const matchedDiagnosis = aiResult.find(
      (result) => String(result.img_idx) === String(clickedXray.imgIdx)
    );
    setSelectedDiagnosis(matchedDiagnosis || null);
    setBaseScale(1);
    setZoom(1);
    setOffsetX(0);
    setOffsetY(0);
  }

  useEffect(() => {
    if (!selectedXray) return;
    const matchedDiagnosis = aiResult.find((result) => String(result.img_idx) === String(selectedXray.imgIdx));
    setSelectedDiagnosis(matchedDiagnosis || null);
    if (JSON.stringify(selectedDiagnosis) !== JSON.stringify(matchedDiagnosis)) {
      setSelectedDiagnosis(matchedDiagnosis || null);
    }
  }, [selectedXray, aiResult]);

  // 날짜 클릭
  function handleDateClick(d) {
    setSelectedDate(d);
  }

  // 병원 클릭
  function handleHospitalClick(h) {
    setSelectedHospital(h);
  }

  // 새 진단 결과 저장
  async function handleSaveDiagnosis() {
    if (!selectedHospital) {
      setShowHospitalWarningModal(true);
      setTimeout(() => {
        setHideHospitalWarningModal(true);
        setTimeout(() => {
          setShowHospitalWarningModal(false);
          setHideHospitalWarningModal(false);
        }, 300);
      }, 1500);
      return;
    }

    if (!aiResult || aiResult.length === 0) {
      alert("저장할 진단 결과가 없습니다.");
      return;
    }
  
    const userId = sessionStorage.getItem("userId") || "testDoctor";
    try {
      const matched = xrayList.filter(x =>
        newlyUploaded.some(orig => x.imgPath.includes(orig))
      );

      for (const img of aiResult) { 
        const body = {
          imgIdx: img.img_idx,
          hosIdx: selectedHospital.hosIdx
        };

        await axios.post(`${process.env.REACT_APP_DB_URL}/diagnosis-result/update_hospital_info`, body, { 
          headers: { "Content-Type": "application/json" },
        });
      }
  
    } catch (err) {
      console.error(err);
      alert("저장 중 오류 발생");
    }
  }
  
  // 뒤로가기
  function handleGoBack() {
    navigate("/main");
  }

  function handlePrint() {
    if (fromHistory) {
      navigate("/print", {
        state: {
          patient,
          aiResult,
          bigPreview,
          selectedHospital,
          centerId: loginUser?.centerId,
          userName: loginUser?.userName,
          userEmail: loginUser?.email,
          userAddress: loginUser?.address,
          diagDate: selectedDate,
        },
      });
      return;
    }

    if (!hasSaved) {
      setShowSaveWarningModal(true);
      setTimeout(() => {
        setHideSaveWarningModal(true);
        setTimeout(() => {
          setShowSaveWarningModal(false);
          setHideSaveWarningModal(false);
        }, 300);
      }, 1500);
      return;
    }

    if (!loginUser) {
      alert("로그인 사용자 정보를 가져오지 못했습니다.");
      return;
    }

    navigate("/print", {
      state: {
        patient,
        aiResult: Array.isArray(aiResult) ? aiResult : [aiResult],
        bigPreview,
        selectedHospital,
        centerId: loginUser?.centerId || "(기관 없음)",
        userName: loginUser?.userName || "(이름 없음)",
        userEmail: loginUser?.email || "(이메일 없음)",
        userAddress: loginUser?.address || "(주소 없음)",
        diagDate: selectedDate,
      },
    });
  }

  // 이미지 확대/이동 핸들러
  function handleImageLoad(e) {
    const boxWidth = 480;
    const boxHeight = 380;
    const img = e.currentTarget;
    const natW = img.naturalWidth;
    const natH = img.naturalHeight;
    const scaleW = boxWidth / natW;
    const scaleH = boxHeight / natH;
    setBaseScale(Math.min(scaleW, scaleH));
  }

  function handleWheelCapture(e) {
    if (e.nativeEvent.cancelable) {
      e.nativeEvent.preventDefault();
    }
    const delta = e.deltaY < 0 ? 0.1 : -0.1;
    let newZ = zoom + delta;
    if (newZ < 0.5) newZ = 0.5;
    if (newZ > 4.0) newZ = 4.0;
    setZoom(newZ);
  }
  function handleMouseDown(e) {
    e.preventDefault();
    setDragging(true);
    setStartX(e.clientX - offsetX);
    setStartY(e.clientY - offsetY);
  }
  function handleMouseMove(e) {
    if (!dragging) return;
    e.preventDefault();
    setOffsetX(e.clientX - startX);
    setOffsetY(e.clientY - startY);
  }
  function handleMouseUp(e) {
    e.preventDefault();
    setDragging(false);
  }
  function handleMouseLeave(e) {
    e.preventDefault();
    setDragging(false);
  }
  function handleDragStart(e) {
    e.preventDefault();
  }

  const totalScale = baseScale * zoom;
  const bigImgStyle = {
    position: "absolute",
    left: "50%",
    top: "50%",
    transform: `
      translate(-50%, -50%)
      translate(${offsetX}px, ${offsetY}px)
      scale(${totalScale})
    `,
    transformOrigin: "center center",
    cursor: dragging ? "grabbing" : "grab",
    maxWidth: "none",
    userSelect: "none"
  };

  async function handleSaveDiagnosis() {
    const userId = sessionStorage.getItem("userId") || "testDoctor";
    try {
      const matched = xrayList.filter(x =>
        newlyUploaded.some(orig => x.imgPath.includes(orig))
      );

      for (const img of matched) {
        await axios.put(`${process.env.REACT_APP_DB_URL}/xray/updateResult`, {
          imgIdx: img.imgIdx,
          result: JSON.stringify(aiResult),
        });
      }

      for (const img of matched) {
        const diagnosisData = aiResult.find((res) => res.img_idx === img.imgIdx);
        if (!diagnosisData) {
          console.error(`❌ 진단 결과를 찾을 수 없음: IMG_IDX=${img.imgIdx}`);
          continue;
      }
        const body = {
          pIdx: patient.pIdx,
          imgIdx: img.imgIdx,
          diagnosis: diagnosisData.diagnosis,
          doctorId: userId,
          hosIdx: selectedHospital?.hosIdx
        };
        try {
          await axios.post(`${process.env.REACT_APP_DB_URL}/diagnosis-result`, body, { 
              headers: { "Content-Type": "application/json" },
          });
        } catch (error) {
          console.error(`❌ IMG_IDX=${img.imgIdx} 저장 실패:`, error);
        }
      }
      setShowDiagnosisSuccessModal(true);
      setHasSaved(true);
      setTimeout(() => {
        setHideDiagnosisSuccessModal(true);
        setTimeout(() => {
          setShowDiagnosisSuccessModal(false);
          setHideDiagnosisSuccessModal(false);
        }, 300);
      }, 1500);
    } catch (err) {
      console.error(err);
      alert("저장 중 오류 발생");
    }
  }

  const closeDiagnosisSuccessModal = () => {
    setHideDiagnosisSuccessModal(true);
    setTimeout(() => {
      setShowDiagnosisSuccessModal(false);
      setHideDiagnosisSuccessModal(false);
    }, 300);
  };
  const closeHospitalWarningModal = () => {
    setHideHospitalWarningModal(true);
    setTimeout(() => {
      setShowHospitalWarningModal(false);
      setHideHospitalWarningModal(false);
    }, 300);
  };
  const closeSaveWarningModal = () => {
    setHideSaveWarningModal(true);
    setTimeout(() => {
      setShowSaveWarningModal(false);
      setHideSaveWarningModal(false);
    }, 300);
  };

  return (
    <div className="result-container">
      <Menu />
      <div className="result-topbar">
        <h2> </h2>
        <div>
        <button className="result_btn2"
          onClick={() => {
            navigate("/print", {
              state: {
                patient,
                aiResult,
                bigPreview,
                selectedHospital,
                centerId: loginUser?.centerId || "(기관 없음)",
                userName: loginUser?.userName || "(이름 없음)",
                userEmail: loginUser?.email || "(이메일 없음)",
                userAddress: loginUser?.address || "(주소 없음)",
                diagDate: selectedDate,
              }
            });
          }}
          style={{ marginLeft: "10px" }}
        >
        <img src={printerIcon} alt="프린터 아이콘" className="print-icon" /> 출력하기
        </button>
      </div>
    </div>
      {showSaveWarningModal && (
        <div className="save-warning-modal-overlay" onClick={closeSaveWarningModal}>
          <div className={`save-warning-modal ${hideSaveWarningModal ? "hide" : ""}`}>
            <img src={warningIcon} alt="경고" className="save-warning-icon" />
            <p>진단 결과를 먼저 저장해주세요</p>
          </div>
        </div>
      )}

      <div className="result-main">
        {/* 왼쪽 패널 */}
        <div className="result-left-panel">
          <div className="patient-info-box">
            <h2 style={{ marginLeft: 10 }}>환자 정보</h2>
            <table className="patient-detail-table">
              <tbody>
                <tr>
                  <th>환자 번호</th>
                  <td>{patient.pIdx}</td>
                </tr>
                <tr>
                  <th>환자 이름</th>
                  <td>{patient.pName}</td>
                </tr>
                <tr>
                  <th>생년월일</th>
                  <td>{patient.birth}</td>
                </tr>
                <tr>
                  <th>연락처</th>
                  <td>{patient.tel}</td>
                </tr>
                <tr>
                  <th>주소</th>
                  <td>
                    <div className="patient-address">{patient.pAdd}</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 진단 날짜 텍스트를 panel-block 밖으로 이동 */}
          {patient && (
            <div className="diagnosis-date-title">
              진단 날짜
            </div>
          )}
          <div className="date-list-box">
            <video autoPlay loop muted playsInline className="date-list-video">
              <source src="/video2.mp4" type="video/mp4" />
            </video>
            <DateList
              diagDates={diagDates}
              currentPage={datePage}
              setCurrentPage={setDatePage}
              datesPerPage={datesPerPage}
              onDateClick={handleDateClick}
            />
          </div>

          <h2 style={{ marginLeft: 10 }}>AI 진단 결과</h2>
          <div className="ai-result-box">
              <div className="video-container">
                <video autoPlay loop muted playsInline className="ai-result-video">
                  <source src="/video1.mp4" type="video/mp4" />
                  브라우저가 동영상을 지원하지 않습니다.
                </video>
                <p className="ai-result-text">
                  {selectedDiagnosis?.diagnosis || (Array.isArray(aiResult) && aiResult.length > 0 ? aiResult[0].diagnosis : "TB")}
                </p>
              </div>
          </div>
        </div>

        {/* 중앙 패널 */}
        <div className="result-center-panel">
          {/* ✅ 그림판 도구 박스 */}
          <div className="drawing-tools-container">
            <div className="drawing-tools">
              <input
                type="color"
                className="color-picker"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
              <input
                type="range"
                className="line-width-slider"
                min="1"
                max="10"
                value={lineWidth}
                onChange={(e) => setLineWidth(e.target.value)}
              />
              <button className="erase-button" onClick={clearCanvas}></button>
            </div>
          </div>
           
          <div className="big-preview-box" style={{ position: "relative" }}
            onWheelCapture={handleWheelCapture}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
          >

          {/* 이미지 크게 보기 */}
          <div className="big-preview-box" style={{ position: "relative" }}>
            {bigPreview ? (
              <>
                <img ref={bigImgRef} 
                src={bigPreview} 
                alt="bigXray" 
                className="big-xray-image" 
                onError={() => console.log("⚠️ 이미지 로드 실패:", bigPreview)}
                />
                <canvas
                  ref={canvasRef}
                  className="drawing-canvas"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                />
              </>
            ) : (
              <div style={{ color: "#ccc" }}>X-ray가 없습니다.</div>
            )}
            </div>
            <div className="thumb-list">
              {fromHistory
                ? xrayList.map((xray, index) => (
                    <div
                      key={index}
                      className="thumb-item"
                      onClick={() => handleThumbClick(xray.imgPath)}
                    >
                      <img
                        src={correctImageUrl(xray.imgPath)}
                        alt={`X-ray ${index + 1}`}
                        onError={() => console.log(`⚠️ X-ray 로드 실패: ${xray.imgPath}`)}
                      />
                    </div>
                  ))
                : newlyUploaded.map((imgPath, index) => (
                    <div
                      key={index}
                      className="thumb-item"
                      onClick={() => handleThumbClick(imgPath)}
                    >
                      <img
                        src={correctImageUrl(imgPath)}
                        alt={`Uploaded ${index + 1}`}
                        onError={() => console.log(`⚠️ Uploaded 이미지 로드 실패: ${imgPath}`)}
                      />
                    </div>
                  ))}
            </div>
          </div>
        </div>

        {/* 오른쪽 패널 */}
        <div className="result-right-panel">
          {fromHistory ? (
            <>
              <h2>과거 선택 병원</h2>
              {selectedHospital ? (
                <div className="result-right-panel2">
                  <p><b>▫ {selectedHospital.hosName}</b></p>
                  <p>{selectedHospital.hosAdd}</p>
                </div>
              ) : (
                <p className="result-right-panel3">저장된 병원 정보가 없습니다.</p>
              )}
              <h2>위치 확인</h2>
              <div ref={mapRef} className="hospital-map1" />
            </>
          ) : (
            <>
              {/* 병원 안내 제목과 버튼을 한 줄로 정렬 */}
              <div className="hospital-header">
                <h2>거리순 병원 찾기</h2>
                <button className="save-diagnosis-btn" onClick={handleSaveDiagnosis}>
                  진단 저장
                </button>
              </div>
              {showHospitalWarningModal && (
                <div className="hospital-warning-modal-overlay" onClick={closeHospitalWarningModal}>
                  <div className={`hospital-warning-modal ${hideHospitalWarningModal ? "hide" : ""}`}>
                    <img src={warningIcon} alt="경고" className="hospital-warning-icon" /> {/* ✅ 경고 아이콘 추가 */}
                    <p>가까운 병원 중 하나를 선택해주세요</p>
                  </div>
                </div>
              )}
              {showDiagnosisSuccessModal && (
                <div className="diagnosis-success-modal-overlay" onClick={closeDiagnosisSuccessModal}>
                  <div className={`diagnosis-success-modal ${hideDiagnosisSuccessModal ? "hide" : ""}`}>
                    <img src={checkmarkIcon} alt="완료" className="diagnosis-success-icon" /> {/* ✅ 체크 아이콘 추가 */}
                    <p>진단 결과 저장 완료!</p>
                  </div>
                </div>
              )}

              <div className="result_hospital">
                {(!patient?.pLat || !patient?.pLng) ? (
                  <p>※ 환자 좌표가 없어 안내 불가</p>
                ) : (
                  <>
                    {hospitals.length > 0 ? (
                      <div style={{ padding: "10px" }}>
                        {hospitals.map((h, i) => (
                          <div
                            key={h.hosIdx}
                            onClick={() => handleHospitalClick(h)}
                          >
                            <input
                              type="radio"
                              name="hospitalSelect"
                              value={h.hosIdx}
                              checked={selectedHospital?.hosIdx === h.hosIdx}
                              onChange={() => setSelectedHospital(h)}
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
                  </>
                )}
              </div>
              <h2 className="map-check">위치 확인</h2>
              <div ref={mapRef} className="hospital-map2" />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Result;