// src/component/PrintPage.jsx
import React, { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./PrintPage.css";

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
    navigate("/result");
  }
  function handlePrint() {
    window.print();
  }

  return (
    <div className="print-container">
      <div className="print-topbar">
        {/* 상단 제목: (기관명) 소견서 */}
        <h2>({centerId}) 소견서</h2>
        <div>
          <button onClick={handleBack}>결과 페이지로</button>
          <button onClick={handlePrint} style={{ marginLeft: "10px" }}>
            브라우저 인쇄
          </button>
        </div>
      </div>

      <div className="report-content">
        <div className="report-header">
          <h2>{centerId || "(기관명)"} 소견서</h2>
          <p style={{ textAlign: "right", marginTop: "20px", marginBottom: "-15px" }}>
            발행일자: {printDateStr}
          </p>
        </div>

        <table className="grid-table">
          <tbody>
            {/* 첫 번째 줄 */}
            <tr>
              <th className="highlight-cell">교부년월일 및 번호</th>
              <td colSpan="2">{docNo}</td>
              <th className="merged-cell highlight-cell" rowSpan="3">환자</th>
              <th>성명</th>
              <td colSpan="2">{patient?.pName || "N/A"}</td>
            </tr>

            {/* 두 번째 줄 */}
            <tr>
              <td rowSpan="2" className="merged-cell highlight-cell">의료기관</td>
              <th>명칭</th>
              <td>{centerId || "(기관명)"}</td>
              <th>주민등록번호</th>
              <td colSpan="2">{patient?.birth || "N/A"}</td>
            </tr>

            {/* 세 번째 줄 */}
            <tr>
              <th>이메일</th>
              <td>{userEmail || "(기관 이메일)"}</td>
              <th>환자주소</th>
              <td colSpan="2">{patient?.pAdd || "N/A"}</td>
            </tr>

            {/* 네 번째 줄 */}
            <tr>
              <th className="highlight-cell">질병분류</th>
              <td colSpan="2">{aiResult || "(진단없음)"}</td>
              <th colSpan="2" className="highlight-cell">처방인 성명</th>
              <td colSpan="2">{userName || "(담당 의사)"}</td>
            </tr>

            {/* 다섯 번째 줄 (X-ray) */}
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

            {/* 여섯 번째 줄 (진단내용 및 진단 이유) */}
            <tr>
              <td colSpan="6" className="diagnosis-cell">
                진단내용 및 진단을 내린 대략적인 이유
              </td>
            </tr>

            {/* 일곱 번째 줄 */}
            <tr>
              <th rowSpan="2" className="highlight-cell">근처병원</th>
              <td colSpan="2">{selectedHospital
                ? `${selectedHospital.hosName}`
                : "(선택된 병원 없음)"}</td>
              <td colSpan="3">{selectedHospital
                ? `${selectedHospital.hosAdd}`
                : "(선택된 병원 없음)"}</td>
            </tr>

            {/* 여덟 번째 줄 */}
            <tr>
              <td colSpan="2">{selectedHospital
                ? `${selectedHospital.hosName}`
                : "(선택된 병원 없음)"}</td>
              <td colSpan="3">{selectedHospital
                ? `${selectedHospital.hosAdd}`
                : "(선택된 병원 없음)"}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PrintPage;
