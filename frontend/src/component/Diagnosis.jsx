import React from "react";
import "./Diagnosis.css";

function Diagnosis() {
  return (
    <div style={{ position: "relative", height: "800px" }}>
      {/* 반투명 배경 박스 */}
      <div className="background-box"></div>

    <div className="report-content">
      <div className="report-header">
        <h2>OO 기관 소견서</h2>
        <span>진단 날짜: 2025.01.02</span>
      </div>

      <table className="grid-table">
        <tbody>
          {/* 첫 번째 줄 */}
          <tr>
            <th className="highlight-cell">교부년월일 및 번호</th>
            <td colSpan="2">20250102-00235</td>
            <th className="merged-cell highlight-cell" rowSpan="3">의료기관</th>
            <th>명칭</th>
            <td colSpan="2">스마트인재개발원</td>
          </tr>

          {/* 두 번째 줄 */}
          <tr>
            <td rowSpan="2" className="merged-cell highlight-cell">환자</td>
            <th>성명</th>
            <td>김지수</td>
            <th>전화번호</th>
            <td colSpan="2">062-962-0000</td>
          </tr>

          {/* 세 번째 줄 */}
          <tr>
            <th>주민등록번호</th>
            <td>000809-4******</td>
            <th>팩스번호</th>
            <td colSpan="2">062-962-1111</td>
          </tr>

          {/* 네 번째 줄 */}
          <tr>
            <th className="highlight-cell">질병분류</th>
            <td colSpan="2">결핵, 폐렴</td>
            <th colSpan="2" className="highlight-cell">처방인 성명</th>
            <td colSpan="2">송유란</td>
          </tr>

          {/* 다섯 번째 줄 (X-ray) */}
          <tr>
            <th rowSpan="2" className="highlight-cell">치료소견</th>
            <td colSpan="6" className="xray-cell">
              <img
                src="xray-sample.jpg"
                alt="X-ray"
                className="report-image"
              />
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
            <td colSpan="2">스마트인재개발원</td>
            <td colSpan="3">광주광역시 동구 중앙로 196</td>
          </tr>

          {/* 여덟 번째 줄 */}
          <tr>
            <td colSpan="2">스마트인재개발원남구지점</td>
            <td colSpan="3">금남로 4가역 방가방가 출구</td>
          </tr>
        </tbody>
      </table>
    </div>
    </div>
  );
}

export default Diagnosis;
