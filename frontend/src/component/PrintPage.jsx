// src/component/PringPage.jsx

import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
// CSS 파일명을 PrintPage.css 로
import "./PrintPage.css";

function PringPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const { patient, aiResult, newlyUploaded } = location.state || {};

  // 결과 페이지로 돌아가기
  function handleBack() {
    navigate("/result");
  }

  // 브라우저 인쇄
  function handlePrint() {
    window.print();
  }

  return (
    <div className="print-container">
      <div className="print-topbar">
        <h2>의사 소견서</h2>
        <div>
          <button onClick={handleBack}>결과 페이지로</button>
          <button onClick={handlePrint} style={{ marginLeft:"10px" }}>
            브라우저 인쇄
          </button>
        </div>
      </div>

      <div className="print-content">
        <h3 style={{ textAlign:"center" }}>OO 기관 소견서</h3>

        <table className="print-table">
          <tbody>
            <tr>
              <th>환자 이름</th>
              <td>{patient?.pName || "N/A"}</td>
              <th>생년월일</th>
              <td>{patient?.birth || "N/A"}</td>
            </tr>
            <tr>
              <th>연락처</th>
              <td>{patient?.tel || "N/A"}</td>
              <th>주소</th>
              <td>{patient?.pAdd || "N/A"}</td>
            </tr>
            <tr>
              <th>AI 진단 결과</th>
              <td colSpan={3}>{aiResult || "(없음)"}</td>
            </tr>
            <tr>
              <th>첨부된 X-ray</th>
              <td colSpan={3}>
                {newlyUploaded && newlyUploaded.length>0 ? (
                  newlyUploaded.join(", ")
                ) : "(없음)"}
              </td>
            </tr>
          </tbody>
        </table>

        <div className="doctor-opinion">
          <p>치료 소견: [예시] 추가 검사 요망.</p>
          <p>특이 사항: [예시] 보존적 치료 권장.</p>
        </div>

        <p style={{ textAlign:"right", marginTop:"40px" }}>
          <strong>발행일자:</strong> {new Date().toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}

export default PringPage;
