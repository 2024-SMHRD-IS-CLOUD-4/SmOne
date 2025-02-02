// src/component/Result.jsx

import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Result.css";

import teamLogo from "./png/teamlogo.png";
import Menu from "./Menu"; // 추가
import DateList from "./Xray/DateList"; // 날짜 리스트 재사용
// (만약 필요없다면 제거 가능)

function Result() {
  const location = useLocation();
  const navigate = useNavigate();

  // Main에서 넘어온 데이터
  const [patient, setPatient] = useState(location.state?.patient || null);
  const [newlyUploaded, setNewlyUploaded] = useState(location.state?.newlyUploaded || []);
  const [aiResult, setAiResult] = useState(location.state?.aiResult || "");

  // DB에서 가져오는 X-ray, 날짜
  const [diagDates, setDiagDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [oldImages, setOldImages] = useState([]);
  const [selectedOldImage, setSelectedOldImage] = useState(null);
  const [oldBigPreview, setOldBigPreview] = useState(null);

  // 페이지네이션(날짜)
  const [datePage, setDatePage] = useState(1);
  const datesPerPage = 5;

  useEffect(() => {
    if (!patient) {
      alert("잘못된 접근입니다. 메인으로 이동합니다.");
      navigate("/main");
      return;
    }
    // 1) 환자 pIdx로 진단 날짜 목록 조회
    axios.get(`http://localhost:8090/SmOne/api/xray/dates?pIdx=${patient.pIdx}`)
      .then(res => {
        const list = res.data;
        setDiagDates(list);

        // 가장 최신 날짜를 자동 선택
        if (list.length > 0) {
          setSelectedDate(list[0]);
        }
      })
      .catch(e => console.error(e));
  }, [patient, navigate]);

  // selectedDate 바뀌면 X-ray 목록 로드
  useEffect(() => {
    if (selectedDate && patient) {
      axios.get(`http://localhost:8090/SmOne/api/xray/byDate?pIdx=${patient.pIdx}&date=${selectedDate}`)
        .then(res => {
          setOldImages(res.data);
          // BIG_XRAY가 있으면 우선 확대
          const foundBig = res.data.find(x => x.bigXray !== null);
          if (foundBig) {
            setSelectedOldImage(foundBig);
            setOldBigPreview(`http://localhost:8090/SmOne/images/${foundBig.bigXray}`);
          } else {
            // 첫 이미지로 확대
            if (res.data.length > 0) {
              setSelectedOldImage(res.data[0]);
              setOldBigPreview(`http://localhost:8090/SmOne/images/${res.data[0].imgPath}`);
            }
          }
        })
        .catch(e => console.error(e));
    }
  }, [selectedDate, patient]);

  // 썸네일 클릭
  function handleOldThumbClick(item) {
    setSelectedOldImage(item);
    setOldBigPreview(`http://localhost:8090/SmOne/images/${item.imgPath}`);
  }

  // 날짜 클릭
  function handleDateClick(dateStr) {
    setSelectedDate(dateStr);
  }

  // 뒤로가기 => 메인
  function handleGoBack() {
    navigate("/main");
  }
  // 출력하기 => /print
  function handlePrint() {
    navigate("/print", {
      state: {
        patient,
        aiResult,
        newlyUploaded
      }
    });
  }

  return (
    <div className="result-container">
      {/* 왼쪽 사이드 메뉴 추가 */}
      <Menu />
      <div className="result-topbar">
        <button className="team-logo-button">
          <img src={teamLogo} alt="Team Logo" className="team-logo-img" />
        </button>
        <div>
          <button onClick={handleGoBack}>뒤로가기</button>
          <button onClick={handlePrint} style={{ marginLeft: "10px" }}>출력하기</button>
        </div>
      </div>

      {/* 메인 레이아웃 */}
      <div className="result-main">
        {/* 왼쪽 패널: 환자 정보 + 진단 날짜 */}
        <div className="result-left-panel">
          <div className="result-patient-detail">
            <h2>환자 정보</h2>
            {patient ? (
              <>
                <p>환자 번호 : {patient.pIdx}</p>
                <p>환자 이름 : {patient.pName}</p>
                <p>생년월일 : {patient.birth}</p>
                <p>연락처 : {patient.tel}</p>
                <p>주소 : {patient.pAdd}</p>
              </>
            ) : (
              <p>정보 없음</p>
            )}
          </div>

          <div className="result-date-list">
            <DateList
              diagDates={diagDates}
              currentPage={datePage}
              setCurrentPage={setDatePage}
              datesPerPage={datesPerPage}
              onDateClick={handleDateClick}
            />
          </div>
        </div>

        {/* 오른쪽 패널: X-ray (왼쪽), 진단 결과 (오른쪽) */}
        <div className="result-right-panel">
          <div className="result-xray-area">
            <div className="big-preview-box">
              {oldBigPreview ? (
                <img
                  src={oldBigPreview}
                  alt="old-big"
                  className="big-preview-img"
                />
              ) : (
                <div style={{ color: "#ccc" }}>X-ray가 없습니다.</div>
              )}
            </div>

            {/* 썸네일 목록 */}
            <div className="thumb-list" style={{ marginTop: "10px" }}>
              {oldImages.map((item) => (
                <div
                  key={item.imgIdx}
                  className="thumb-item"
                  onClick={() => handleOldThumbClick(item)}
                >
                  <img
                    src={`http://localhost:8090/SmOne/images/${item.imgPath}`}
                    alt="thumb"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="result-diagnosis-area">
            <h3>AI 진단 결과</h3>
            <p>{aiResult}</p>
            <hr style={{ margin: "20px 0" }} />
            <h4>이번에 업로드된 파일들</h4>
            {newlyUploaded && newlyUploaded.length > 0 ? (
              <ul>
                {newlyUploaded.map((fn, i) =>
                  <li key={i}>{fn}</li>
                )}
              </ul>
            ) : <p>(없음)</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Result;
