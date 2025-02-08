import React, { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./PrintPage.css";
import printerImg from "./png/printerimg.png";

function generateDocNo() {
  const now = new Date();
  const yyyy = now.getFullYear().toString();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const datePart = `${yyyy}${mm}${dd}`;
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

    centerId,
    userName,
    userEmail,
    userAddress,
    diagDate
  } = location.state || {};

  const docNo = useMemo(() => generateDocNo(), []);
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
        </div>

        <table className="grid-table">
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
          <tbody>
            <tr>
              <th className="highlight-cell">질병분류</th>
              <td colSpan="4">{aiResult || "(진단없음)"}</td>
            </tr>
            <tr>
              <th className="highlight-cell">처방인 성명</th>
              <td colSpan="4">{userName || "(담당 의사)"}</td>
            </tr>
            <tr>
              <th className="highlight-cell">근처 병원</th>
              <td colSpan="4">
                {selectedHospital
                  ? `${selectedHospital.hosName} / ${selectedHospital.hosAdd}`
                  : "(선택된 병원 없음)"}
              </td>
            </tr>
            <tr>
              <th colSpan="" className="highlight-cell">X-ray 사진</th>
              <th colSpan="4" className="xray-cell">
                {bigPreview ? (
                  <img
                    src={bigPreview}
                    alt="X-ray"
                    style={{ width: "300px", height: "auto", display: "block", margin: "10px 0" }}
                  />
                ) : (
                  <p>(X-ray 미리보기 없음)</p>
                )}
              </th>
            </tr>
          </tbody>
        </table>
        <table className="grid-table">
          <tbody>

          </tbody>
        </table>
        <p className="print-date">
          발행일자: {printDateStr}
        </p>

      </div>
    </div>
  );
}

export default PrintPage;
