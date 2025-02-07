import "./DateList.css";

function DateList({ diagDates, currentPage, setCurrentPage, onDateClick, selectedPatient }) {
  const datesPerPage = 4; // ✅ 4개씩 표시 (2행 x 2열)
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
          <div className="diagnosis-table-container">
            <table className="diagnosis-table">
              <tbody>
                {Array.from({ length: 2 }).map((_, rowIndex) => (
                  <tr key={rowIndex}>
                    {Array.from({ length: 2 }).map((_, colIndex) => {
                      const dateIndex = rowIndex * 2 + colIndex;
                      return currentDates[dateIndex] ? (
                        <td key={colIndex} className="diagnosis-date" onClick={() => onDateClick(currentDates[dateIndex])}>
                          {currentDates[dateIndex]}
                        </td>
                      ) : (
                        <td key={`empty-${colIndex}`} className="empty-cell"></td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ✅ 페이지네이션을 완전히 박스 밖으로 이동 */}
      {totalPages > 1 && (
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
