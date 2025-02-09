// src/component/Result.jsx
import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import DateList from "./Xray/DateList";
import "./Result.css";
import Menu from "./Menu";
import printerIcon from "./png/printerimg.png";

function Result() {
  const location = useLocation();
  const navigate = useNavigate();

  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

  // 그리기 상태
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#FF0000");
  const [lineWidth, setLineWidth] = useState(3);

  // 넘어온 state
  const patient = location.state?.patient || null;
  const [aiResult, setAiResult] = useState(location.state?.aiResult || "진단 결과 없음");
  

    // 🔽🔽🔽 여기에 useEffect 추가 🔽🔽🔽
    useEffect(() => {
      console.log("📌 Result 페이지에서 location.state.aiResult:", location.state?.aiResult);
      
      if (location.state?.aiResult) {
        console.log("📌 AI 진단 결과 업데이트됨:", location.state.aiResult);
        setAiResult(location.state.aiResult);
      } else {
        console.warn("⚠️ AI 진단 결과가 undefined로 들어옴!");
      }
    }, [location.state?.aiResult]);

  
  console.log("📌 FastAPI에서 받아온 AI 진단 결과:", location.state?.aiResult);
  console.log("📌 Result 페이지에서 초기 aiResult 상태값:", aiResult);

  const { state } = location;
  const { newlyUploaded } = state || { newlyUploaded: [] };
  // const bigFilename = location.state?.bigFilename || null;
  const fromHistory = location.state?.fromHistory || false;
  const preSelectedDate = location.state?.selectedDate || null;

  // X-ray 목록
  const [xrayList, setXrayList] = useState([]);
  const [selectedXray, setSelectedXray] = useState(null);

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

      // ✅ 기존에 그린 그림 유지하도록 변경
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctxRef.current = ctx;

      // ✅ 초기 색상 및 굵기 적용
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
    }
  }, [color, bigPreview]);

  

  // ✅ 색상 및 굵기 변경 시 기존 그림을 유지하며 새로운 설정 적용
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
    if (!url) return "";  // url이 없을 경우 빈 값 반환
  
    // URL이 이미 절대 경로일 경우 그대로 반환
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
  
    // URL이 상대경로(h0027.png)일 경우, 클라우드 스토리지 주소를 붙여서 반환
    return `https://kr.object.ncloudstorage.com/ilungview-bucket/${url}`;
  };
  


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
        .then(res => setLoginUser(res.data))
        .catch(err => console.error("유저 정보 불러오기 실패:", err));
    }

    // C. 환자 X-ray 날짜 목록
    axios
      .get(`${process.env.REACT_APP_DB_URL}/xray/dates?pIdx=${patient.pIdx}`)
      .then((res) => {
        setDiagDates(res.data);
        if (!fromHistory && !selectedDate && res.data.length > 0) {
          setSelectedDate(res.data[0]); // 최신 날짜
        }
      })
      .catch(err => console.error(err));
  }, [patient, navigate, fromHistory, selectedDate]);

  // ---------------- 2) 날짜 선택 => X-ray 목록, 과거결과(병원/진단) ----------------
  useEffect(() => {
    if (!selectedDate) return;

    // (A) X-ray 목록
    axios
      .get(`${process.env.REACT_APP_DB_URL}/xray/byDate?pIdx=${patient.pIdx}&date=${selectedDate}`)
      .then((res) => {
        console.log("✅ 불러온 X-ray 목록:", res.data); // 확인용 로그 추가
        setXrayList(res.data);
        
        if (res.data.length > 0) {

          const bigOne = res.data.find((x) => x.bigXray != null);
          if (bigOne) {
            setSelectedXray(bigOne || res.data[0]);
            setBigPreview(correctImageUrl((bigOne || res.data[0]).imgPath));
          } else {
            setSelectedXray(res.data[0]);
            setBigPreview(correctImageUrl(res.data[0].imgPath));
          }
        } else {
          setXrayList([]);
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
        .then(hosRes => setSelectedHospital(hosRes.data))
        .catch(err => {
          console.log("과거 병원 정보 없음 =>", err.message);
          setSelectedHospital(null);
        });
    } else {
      // 새 진단 => 병원 선택 초기화
      setSelectedHospital(null);
      setHasSaved(false);
    }
  }, [selectedDate, fromHistory, patient]);

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

    // 이전 마커 제거
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
    setBigPreview(correctImageUrl(imgPath)); // 올바른 경로 변환 후 적용
    setSelectedXray(imgPath);
    setBaseScale(1);
    setZoom(1);
    setOffsetX(0);
    setOffsetY(0);
    console.log("✅ bigPreview 이미지 경로:", bigPreview);
  }




  // 날짜 클릭
  function handleDateClick(d) {
    setSelectedDate(d);
  }

  // 병원 클릭
  function handleHospitalClick(h) {
    setSelectedHospital(h); // 병원 전체 객체
  }

  // 새 진단 결과 저장
  async function handleSaveDiagnosis() {
    if (!selectedHospital) {
      alert("가까운 병원 중 하나를 선택해주세요!");
      return;
    }
    const userId = sessionStorage.getItem("userId") || "testDoctor";
    try {
      // 새로 업로드된 X-ray와 매칭
      const matched = xrayList.filter(x =>
        newlyUploaded.some(orig => x.imgPath.includes(orig))
      );
      if (matched.length === 0) {
        alert("업로드된 X-ray와 매칭된 이미지가 없습니다.");
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
          hosIdx: selectedHospital.hosIdx
        };
        await axios.post(`${process.env.REACT_APP_DB_URL}/diagnosis-result`, body, {
          headers: { "Content-Type": "application/json" },
        });
      }
      alert("진단 결과 저장 완료!");
      setHasSaved(true);

    } catch (err) {
      console.error(err);
      alert("저장 중 오류 발생");
    }
  }

  // 뒤로가기
  function handleGoBack() {
    navigate("/main");
  }

  // [★] 출력하기: PrintPage.jsx로 데이터 전달
  function handlePrint() {
    if (!fromHistory && !hasSaved) {
      alert("먼저 [진단 결과 저장하기]를 완료해야 출력 가능합니다!");
      return;
    }
    if (!loginUser) {
      alert("로그인 사용자 정보를 가져오지 못했습니다.");
      return;
    }

    // 병원 객체
    const hospitalToSend = fromHistory
      ? selectedHospital // 과거 모드: 이미 DB조회한 병원
      : selectedHospital || null;

    navigate("/print", {
      state: {
        patient,
        aiResult,
        bigPreview,
        selectedHospital: hospitalToSend, // 병원객체
        centerId: loginUser.centerId,
        userName: loginUser.userName,
        userEmail: loginUser.email,
        userAddress: loginUser.address,
        diagDate: selectedDate
      }
    });
  }
  //------------------------------------------------
  // 이미지 확대/이동 핸들러
  //------------------------------------------------
  function handleImageLoad(e) {
    // 미리보기 영역 크기
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

  // 최종 스케일 적용
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


  return (
    <div className="result-container">
      <Menu />
      <div className="result-topbar">
        <h2> </h2>
        <div>
          <button className="result_btn2" onClick={handlePrint} style={{ marginLeft: "10px" }}>
            <img src={printerIcon} alt="프린터 아이콘" className="print-icon" /> 출력하기
          </button>
        </div>
      </div>

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
              <video
                autoPlay
                loop
                muted
                playsInline
                className="ai-result-video"
              >
                <source src="/video1.mp4" type="video/mp4" />
                브라우저가 동영상을 지원하지 않습니다.
              </video>
              <p className="ai-result-text">{aiResult}</p>
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
                onError={() => console.log("⚠️ 이미지 로드 실패:", bigPreview)}/>
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
            {newlyUploaded.map((imgPath, index) => (
              <div
                key={index}
                className="thumb-item"
                onClick={() => handleThumbClick(imgPath)} // 클릭 시 해당 이미지를 bigPreview로 설정
              >
              <img src={imgPath} alt={`Uploaded ${index + 1}`} />
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
