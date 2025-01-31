import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Result.css";
import LogoImage from "./teamlogo.png";

function Result() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showMyPage, setShowMyPage] = useState(false);
  const [showPatientJoin, setShowPatientJoin] = useState(false);
  const [image] = useState(location.state?.uploadedImage || null);
  const [imagePanel] = useState(location.state?.uploadedImagePanel || null);
  const [searchInput] = useState("");
  const [searchInputbirth] = useState("");
  const [setSearchResults] = useState([]);
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const contextRef = useRef(null);
  const [color, setColor] = useState("black"); // 기본 색상은 빨간색
  // 색상 변경 핸들러 추가

  const patientList = [
    { name: "김철수", birth: "900101" },
    { name: "김지수", birth: "000101" },
    { name: "최승찬", birth: "880505" },
    { name: "박영희", birth: "850707" },
    { name: "양윤성", birth: "950312" },
    { name: "정현지", birth: "990102" },
  ];

  const handlePrintClick = () => {
    navigate("/Diagnosis"); // Diagnosis 화면으로 즉시 이동
  };

  const toggleMyPage = () => {
    setShowMyPage((prevState) => !prevState);
    setShowPatientJoin(false);
  };

  const handleSearchChange = () => {
    const nameQuery = searchInput.trim();
    const birthQuery = searchInputbirth.trim();

    if (!nameQuery && !birthQuery) {
      setSearchResults([]);
      return;
    }

    const filteredResults = patientList.filter((patient) => {
      const matchesName = nameQuery === "" || patient.name.includes(nameQuery);
      const matchesBirth = birthQuery === "" || patient.birth.includes(birthQuery);
      return matchesName && matchesBirth;
    });

    setSearchResults(filteredResults);
  };
  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const context = canvas.getContext("2d");
    context.lineWidth = 3; // 선 두께 설정
    context.strokeStyle = color;
    contextRef.current = context;
  }, []);

  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    isDrawingRef.current = true;
  };

  const draw = ({ nativeEvent }) => {
    if (!isDrawingRef.current) return;
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();
  };

  const finishDrawing = () => {
    isDrawingRef.current = false;
    contextRef.current.closePath();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    contextRef.current.clearRect(0, 0, canvas.width, canvas.height);
  };
  // 색상 변경 핸들러
  const handleColorChange = (event) => {
    const newColor = event.target.value;
    setColor(newColor);
    if (contextRef.current) {
      contextRef.current.strokeStyle = newColor; // 새로운 색상 적용
    }
  };

  return (
    <div>
      <video className="video-background" autoPlay muted loop>
        <source src="video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="container">
        <header className="header">
          <img
            src={LogoImage}
            alt="I Lung View Logo"
            className="logo"
            onClick={() => navigate("/Main")}
            style={{ cursor: "pointer" }}
          />
          {/* 색상 선택기 */}
          <label className="color-picker-label">
            <input
              type="color"
              value={color}
              onChange={handleColorChange}
              className="color-picker"
              title="Choose drawing color"
            />
          </label>
          <button onClick={clearCanvas} className="clear-button">
            <img src={require("./eraser.png")} alt="Eraser Icon" style={{ width: "24px", height: "24px" }} />
          </button>

          <button className="print-button" onClick={handlePrintClick}>
            <img src={require("./printerimg.png")} alt="Stethoscope Icon" />
            출력하기
          </button>
        </header>
        <div className="main">
          <div className="left-panel">
            <button className="smart-button" onClick={toggleMyPage}>
              스마트인재개발원
            </button>
            <div className="patient-info-header">
              <span className="patient-info-title">환자 정보</span>
            </div>
            <div className="patient-info-container">
              <div className="patient-info-row">환자 번호: 001</div>
              <div className="patient-info-row">환자 성명: 김지수</div>
              <div className="patient-info-row">생년월일: 000809</div>
              <div className="patient-info-row">연락처: 010-2188-7111</div>
              <div className="patient-info-row">주소: 광주광역시 동구 중앙로 196</div>
            </div>
            <div className="diagnosis-date-header">
              <span className="diagnosis-date-title">진단 날짜</span>
            </div>
            <div className="diagnosis-date-container">
              <div className="diagnosis-date-row">2025-01-13</div>
            </div>
          </div>
          <div
            className={`right-panel ${showMyPage || showPatientJoin ? "show-my-page" : ""
              }`}
          >

            {!showMyPage && !showPatientJoin && (
              <div className="upload-area">
                <div className="diagnosis">
                  <label htmlFor="image-upload" className="upload-box">
                    {image ? (
                      <img
                        src={image}
                        alt="Uploaded"
                        className="uploaded-image"
                      />
                    ) : (
                      <span>+</span>
                    )}
                  </label>
                  <div className="canvas-container">
                    <canvas
                      ref={canvasRef}
                      className="drawing-canvas"
                      style={{ cursor: "url('./signpen.png'), auto" }}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={finishDrawing}
                      onMouseLeave={finishDrawing}
                    ></canvas>
                  </div>
                </div>
                <div className="image-panel">
                  {imagePanel ? (
                    <div className="canvas-container">
                      <img
                        src={imagePanel}
                        alt="Uploaded to Panel"
                        className="uploaded-image"
                      />
                      <canvas
                        ref={canvasRef}
                        className="drawing-canvas"
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={finishDrawing}
                        onMouseLeave={finishDrawing}
                      ></canvas>
                    </div>
                  ) : (
                    <span>No Image Uploaded</span>
                  )}
                </div>

              </div>
            )}
            {!showMyPage && !showPatientJoin && (
              <div className="diagnosis-info">
                폐렴 확률 90% 이상 고위험 환자입니다. 빠른 시일내에 병원을 방문하기를 권장합니다.
              </div>
            )}
          </div>
        </div>
        <footer className="footer"></footer>
      </div>
    </div>
  );
}

export default Result;
