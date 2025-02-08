import "./DateList.css";

function DateList({ diagDates, currentPage, setCurrentPage, onDateClick, selectedPatient }) {
  const datesPerPage = 4; // 한 페이지에 4개씩 표시 (2줄 X 2개)
  const totalPages = Math.ceil(diagDates.length / datesPerPage);
  const indexOfLast = currentPage * datesPerPage;
  const indexOfFirst = indexOfLast - datesPerPage;
  const currentDates = diagDates.slice(indexOfFirst, indexOfLast);

  const goFirst = () => setCurrentPage(1);
  const goLast = () => setCurrentPage(totalPages);
  const goPrev = () => setCurrentPage((prev) => Math.max(1, prev - 1));
  const goNext = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const goPage = (p) => setCurrentPage(p);

  return (
    <>
      <div className="date-list-container">
        {!selectedPatient && diagDates.length === 0 ? (
          <p className="no-dates-message">환자를 선택하세요</p>
        ) : diagDates.length === 0 ? (
          <p className="no-dates-message1">등록된 진단 날짜가 없습니다</p>
        ) : (
          <ul className="date-list">
            {currentDates.map((d, i) => (
              <li key={i} className="date-item" onClick={() => onDateClick(d)}>
                {d}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 페이지네이션 (5개 이상일 경우 표시) */}
      {diagDates.length > datesPerPage && (
        <div className="date-pagination-container">
          <div className="date-pagination">
            <button onClick={goFirst} disabled={currentPage === 1}>{"<<"}</button>
            <button onClick={goPrev} disabled={currentPage === 1}>{"<"}</button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                onClick={() => goPage(num)}
                className={currentPage === num ? "active" : ""}
              >
                {num}
              </button>
            ))}

            <button onClick={goNext} disabled={currentPage === totalPages}>{">"}</button>
            <button onClick={goLast} disabled={currentPage === totalPages}>{">>"}</button>
          </div>
        </div>
      )}
    </>
  );
}

export default DateList;
