// src/component/PrintPage.jsx
import React, { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./PrintPage.css";
import printerImg from "./png/printerimg.png";

function generateDocNo() {
  const now = new Date();
  const yyyy = now.getFullYear().toString();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  // 예: 20250203
  const datePart = `${yyyy}${mm}${dd}`;
  // 4자리 임의번호
  const randPart = String(Math.floor(1000 + Math.random() * 9000));
  return `${datePart}-${randPart}`;
}

function PrintPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    patient,
    aiResult,
    bigPreview,
    selectedHospital,

    centerId,      // 로그인 사용자의 CENTER_ID
    userName,      // 로그인 사용자의 USER_NAME
    userEmail,     // 로그인 사용자의 EMAIL
    userAddress,   // 로그인 사용자의 ADDRESS

    diagDate       // 우리가 표시할 "진단 날짜"
  } = location.state || {};

  // 교부년월일 + 번호
  const docNo = useMemo(() => generateDocNo(), []);
  // 발행일자(오늘)
  const printDateStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}.`;
  }, []);

  function handleBack() {
    navigate("/main");
  }
  function handlePrint() {
    window.print();
  }

  return (
    <div className="print-container">
      <div className="print-topbar">
        {/* 상단 제목: (기관명) 소견서 */}
        <h2> </h2>
        <div className="print_header">
          <button className="print_btn1" onClick={handleBack}>메인 페이지로</button>
          <button className="print_btn2" onClick={handlePrint}>
            <img src={printerImg} alt="프린터 아이콘" className="printer-icon" />
            인쇄하기
          </button>
        </div>
      </div>

      <div className="report-content">
        <div className="report-header">
          <h2>{centerId || "(기관명)"} 소견서</h2>
          <button className="printpage-close-btn" onClick={() => navigate(-1)}>X</button>
          <p style={{ textAlign: "right", marginTop: "20px", marginBottom: "-15px", color: "gray" }}>
            발행일자: {printDateStr}
          </p>

        </div>

        <table className="grid-table">
          {/* ✅ 첫 번째 테이블: 연번호, 의료기관, 이메일 */}
          <tbody>
            <tr>
              <th className="highlight-cell" colSpan="2">교부년월일 및 번호</th>
              <td colSpan="3">{docNo}</td>
            </tr>
            <tr>
              <th className="highlight-cell" rowSpan="2">의료기관</th>
              <th>명칭</th>
              <td colSpan="3">{centerId || "(기관명)"}</td>
            </tr>
            <tr>
              <th>이메일</th>
              <td colSpan="3">{userEmail || "(기관 이메일)"}</td>
            </tr>
          </tbody>
        </table>

        <table className="grid-table">
          {/* ✅ 두 번째 테이블: 환자 정보 */}
          <tbody>
            <tr>
              <th className="highlight-cell" rowSpan="2">환자</th>
              <th>성명</th>
              <td>{patient?.pName || "N/A"}</td>
              <th>주민번호</th>
              <td>{patient?.birth || "N/A"}</td>
            </tr>
            <tr>
              <th>주소</th>
              <td colSpan="3" className="long-text">{patient?.pAdd || "N/A"}</td>
            </tr>
          </tbody>
        </table>

        <table className="grid-table">
          {/* ✅ 세 번째 테이블: 질병분류, 처방인 성명, 근처병원, 치료소견 */}
          <tbody>
            <tr>
              <th rowSpan="2" className="highlight-cell">치료소견</th>
              <td colSpan="6" className="xray-cell">
                {bigPreview ? (
                  <img
                    src={bigPreview}
                    alt="X-ray"
                    style={{ width: "300px", height: "auto", display: "block", margin: "10px 0" }}
                  />
                ) : (
                  <p>(X-ray 미리보기 없음)</p>
                )}
              </td>
            </tr>
          </tbody>
        </table>

      </div>
    </div>
  );
}

export default PrintPage;
