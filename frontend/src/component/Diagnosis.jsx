import React from "react";
import { useNavigate } from "react-router-dom"; // useNavigate 임포트
import "./Diagnosis.css";

function Diagnosis() {
  const navigate = useNavigate(); // 네비게이터 훅
  const handlePrint = () => {
    window.print();
  };
  const handleCancel = () => {
    navigate(-1); // 취소 시 Result 화면으로 이동
  };


  return (
    <div className="diagnosis-body">
      <div className="diagnosis-container">
        <video className="video-background" autoPlay muted loop>
          <source src="video.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        <div className="overlay-box">
          <button className="print-button" onClick={handlePrint}>
            <img src={require("./png/printerimg.png")} alt="Print Icon" />
            출력하기
          </button>
          <button className="cancel-button" onClick={handleCancel}>
            이전화면
          </button>
          <div className="report-content">
            <div className="report-header">
              <h2>OO 기관 소견서</h2>
              <span>진단 날짜: 2025.01.02</span>
            </div>

            <table className="grid-table">
              <tbody>
                <tr>
                  <th className="highlight-cell">교부년월일 및 번호</th>
                  <td colSpan="2">{docNo}</td>
                  <th className="merged-cell highlight-cell" rowSpan="3">의료기관</th>
                  <th>명칭</th>
                  <td colSpan="2">{centerId || "(기관명)"}</td>
                </tr>

                <tr>
                  <td rowSpan="2" className="merged-cell highlight-cell">환자</td>
                  <th>성명</th>
                  <td>{patient?.pName || "N/A"}</td>
                  <th>이메일</th>
                  <td colSpan="2">{userEmail || "(기관 이메일)"}</td>
                </tr>

                <tr>
                  <th>주민등록번호</th>
                  <td>{patient?.birth || "N/A"}</td>
                  <th>기관주소</th>
                  <td colSpan="2">{patient?.pAdd || "N/A"}</td>
                </tr>

                <tr>
                  <th className="highlight-cell">질병분류</th>
                  <td colSpan="2">{aiResult || "(진단없음)"}</td>
                  <th colSpan="2" className="highlight-cell">처방인 성명</th>
                  <td colSpan="2">{userName || "(담당 의사)"}</td>
                </tr>

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

                <tr>
                  <td colSpan="6" className="diagnosis-cell">
                    진단내용 및 진단을 내린 대략적인 이유
                  </td>
                </tr>

                <tr>
                  <th rowSpan="2" className="highlight-cell">근처병원</th>
                  <td colSpan="2">{selectedHospital
                    ? `${selectedHospital.hosName}`
                    : "(선택된 병원 없음)"}</td>
                  <td colSpan="3">{selectedHospital
                    ? `${selectedHospital.hosAdd}`
                    : "(선택된 병원 없음)"}</td>
                </tr>

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
      </div>
    </div>
  );
}

export default Diagnosis;
