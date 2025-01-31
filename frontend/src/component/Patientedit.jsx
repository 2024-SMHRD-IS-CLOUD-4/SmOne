import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

function PatientEdit() {
    
    const {pIdx} = useParams(); // URL에서 pIdx추출
    const navigate = useNavigate();

    // 상태값
    const[formData, setFormData] = useState({
        pName: "",
        gender: "남",
        birthPart1: "", // 주민번호 앞 6자리
        birthPart2: "", // 주민번호 뒤 7자리
        phonePart1: "",
        phonePart2: "",
        phonePart3: "",
        postcode: "",
        address: "",
        detailAddress: "",
        pAdd: "", // DB에 최종 저장될 주소 (우편 + 기본 + 상세)
    });

    // 마운트 시점에서 환자 정보(기존 값) 불러오기 -> 기본 값 표시
    useEffect(() => {
        // 서버에서 환자 목록 불러오기
        axios.get("http://localhost:8090/SmOne/api/patients").then((res) => {
            
            // pIdx 일치하는 환자 찾기
            const found = res.data.find((p) => p.pIdx === parseInt(pIdx, 10));
            if(!found){
                alert("해당 환자를 찾을 수 없습니다.");
                navigate("/main");
                return;
            }

            //DB에 저장된 값 파싱
            let birthFront = "";
            let birthBack = "";
            if(found.birth.includes("-")){
                const[f,b] = found.birth.split("-");
                birthFront = f ?? "";
                birthBack = b ?? "";
            }

            let phone1 = "";
            let phone2 = "";
            let phone3 = "";
            if (found.tel.includes("-")) {

            // '-'로 구분되어 있으므로 split
            const [p1, p2, p3] = found.tel.split("-");
            phone1 = p1 ?? "";
            phone2 = p2 ?? "";
            phone3 = p3 ?? "";
            }

            let post = "";
            let addr = "";
            let detail = "";

            const splitted = found.pAdd.split(" ");
            if (splitted[0] && /^\d{5}$/.test(splitted[0])) {
            // 5자리 숫자 = 우편번호
            post = splitted[0];
            
            addr = splitted.slice(1).join(" ");
            detail = "";
            }else{
                addr = found.pAdd;
            }

            // formData에 반영
            setFormData({
                pName: found.pName,
                gender: found.gender,
                birthPart1: birthFront,
                birthPart2: birthBack,
                phonePart1: phone1,
                phonePart2: phone2,
                phonePart3: phone3,
                postcode: post,
                address: addr,
                detailAddress: detail,
                pAdd: found.pAdd, // DB전체 주소
            });
        })
        .catch((err) => {
            console.error("환자 정보 로드 오류:", err);
            alert("환자 정보를 불러오는 중 오류가 발생했습니다.");
            navigate("/main");
        });
    }, [pIdx, navigate]);

    // 입력 핸들러 => 숫자만 입력해야 하는곳(주민번호, 전화번호) 정규식 처리
    const handleChange = (e) => {
        const{name, value, maxLength} = e.target;

        // 숫자 입력 필드라면 숫자만 남김
        if(
            name === "birthPart1" ||
            name === "birthPart2" ||
            name === "phonePart1" ||
            name === "phonePart2" ||
            name === "phonePart3"
        ) {
            const onlyNums = value.replace(/\D/g, "");
            setFormData((prev) => ({
                ...prev,
                [name]: onlyNums.slice(0, maxLength),
            }));
        }else{
            // 일반 입력
            setFormData((prev) => ({...prev, [name]: value}));
        }
    };

    // 입력중에 maxLength까지 채우면 다음 필드로 포커스 이동
    const handleNextFocus = (e, nextField) => {
        const {value, maxLength} = e.target;
        if(value.length === maxLength && nextField) {
            document.getElementsByName(nextField)[0].focus();
        }
    };

    // 다음 우편번호api로 주소 검색
    const handleAddressSearch = () => {
        new window.daum.Postcode({
            oncomplete: (data) => {
                
                // 'data.zonecode' = 5자리 우편번호, 'data.address' = 기본주소
                const pAdd = `${data.zonecode} ${data.address}`;
                setFormData((prev) => ({
                ...prev,
                postcode: data.zonecode,
                address: data.address,
                // detailAddress는 기존 그대로 유지
                pAdd: `${pAdd} ${prev.detailAddress}`, // DB 저장용 전체 주소
                }));
            },
        }).open();
    };

    // 환자 수정 버튼 => put 요청
    const handleSubmit = async (e) => {
        e.preventDefault();

        // 최종 DB에 저장할 birth, tel, pAdd
        const newBirth = `${formData.birthPart1}-${formData.birthPart2}`;
        const newTel = `${formData.phonePart1}-${formData.phonePart2}-${formData.phonePart3}`;
        const newPAdd = `${formData.postcode} ${formData.address} ${formData.detailAddress}`;

        // 백엔드로 전송할 데이터
        const sendData = {
            pName: formData.pName,
            gender: formData.gender,
            birth: newBirth, 
            tel: newTel,
            pAdd: newPAdd,
          };

          try {
            // PUT /api/patients/update/:pIdx
            await axios.put(`http://localhost:8090/SmOne/api/patients/update/${pIdx}`, sendData);
            alert("환자 정보가 수정되었습니다.");
      
            // 수정 완료 후 /main 페이지로 이동
            navigate("/main");
          } catch (err) {
            console.error("환자 수정 오류:", err);
            alert("환자 정보 수정 중 오류가 발생했습니다.");
          }
        };

  return (
    <div>
        <h2>환자 수정</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>환자 이름</label>
          <input
            type="text"
            name="pName"
            placeholder="환자 이름"
            value={formData.pName}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>성별</label>
          <input
            type="radio"
            name="gender"
            value="남"
            checked={formData.gender === "남"}
            onChange={handleChange}
          /> 남
          <input
            type="radio"
            name="gender"
            value="여"
            checked={formData.gender === "여"}
            onChange={handleChange}
          /> 여
        </div>

        <div>
          <label>주민번호</label>
          <div style={{ display: "flex", gap: "5px" }}>
            <input
              type="text"
              name="birthPart1"
              placeholder="앞 6자리"
              maxLength={6}
              value={formData.birthPart1}
              onChange={handleChange}
              onInput={(e) => handleNextFocus(e, "birthPart2")}
              required
            />
            <span>-</span>
            <input
              type="text"
              name="birthPart2"
              placeholder="뒤 7자리"
              maxLength={7}
              value={formData.birthPart2}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div>
          <label>전화번호</label>
          <div style={{ display: "flex", gap: "5px" }}>
            <input
              type="text"
              name="phonePart1"
              placeholder="010"
              maxLength={3}
              value={formData.phonePart1}
              onChange={handleChange}
              onInput={(e) => handleNextFocus(e, "phonePart2")}
              required
            />
            <span>-</span>
            <input
              type="text"
              name="phonePart2"
              placeholder="0000"
              maxLength={4}
              value={formData.phonePart2}
              onChange={handleChange}
              onInput={(e) => handleNextFocus(e, "phonePart3")}
              required
            />
            <span>-</span>
            <input
              type="text"
              name="phonePart3"
              placeholder="0000"
              maxLength={4}
              value={formData.phonePart3}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div>
          <label>우편번호</label>
          <input
            type="text"
            name="postcode"
            placeholder="우편번호"
            value={formData.postcode}
            readOnly
            required
          />
          <button type="button" onClick={handleAddressSearch}>
            검색
          </button>
        </div>

        <div>
          <label>주소</label>
          <input
            type="text"
            name="address"
            placeholder="주소"
            value={formData.address}
            readOnly
            required
          />
        </div>

        <div>
          <label>상세주소</label>
          <input
            type="text"
            name="detailAddress"
            placeholder="상세주소"
            value={formData.detailAddress}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" style={{ marginTop: "10px" }}>
          환자 수정
        </button>
      </form>
    </div>
  );
}

export default PatientEdit