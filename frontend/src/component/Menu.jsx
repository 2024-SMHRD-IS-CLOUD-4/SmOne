import React, { useState } from "react";
import "./Menu.css";
import axios from "axios"; // axios 추가
import { IonIcon } from "@ionic/react";
import { useNavigate } from "react-router-dom";
import {
  homeOutline,
  personOutline,
  settingsOutline,
  lockClosedOutline,
  logOutOutline,
} from "ionicons/icons";
import patientIcon from "./png/patient.png"; // Patient 아이콘 이미지 import

const Menu = ({ onMypageClick, onPatientClick, onHomeClick }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  const menuItems = [
    { title: "메인화면", icon: homeOutline },
    { title: "마이페이지", icon: personOutline },
    { title: "환자등록", icon: null, image: patientIcon },
    { title: "로그아웃", icon: logOutOutline },
  ];

  const handleClick = (index) => {
    setActiveIndex(index);
    if (menuItems[index].title === "메인화면") {
      if (onHomeClick) onHomeClick(); // Reset patient selection
      navigate("/main"); // Navigate back to main screen
    }
    if (menuItems[index].title === "마이페이지") {
      navigate("/mypage"); // MyPage로 이동
    }
    if (menuItems[index].title === "환자등록") {
      navigate("/patients"); // 환자 등록 페이지로 이동
    }
    if (menuItems[index].title === "로그아웃") {
      handleLogout(); // 로그아웃 실행
    }
  };
  const toggleMenu = () => {
    setIsExpanded(!isExpanded);
  };
  const handleLogout = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_DB_URL}/users/logout`, {}, { withCredentials: true });
      alert("로그아웃 성공!");
      navigate("/");
    } catch (e) {
      console.error(e);
      alert("로그아웃 실패");
    }
  };
  
  return (
    <>
      {isExpanded && <div className="menu-overlay" onClick={toggleMenu}></div>}
      <div
        className={`navigation ${isExpanded ? "expanded" : ""}`}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        <ul>
          {menuItems.map((item, index) => (
            <li
              key={index}
              className={`list ${activeIndex === index ? "active" : ""}`}
              onClick={() => handleClick(index)}
            >
              <a href="#">
                <span className="icon">
                  {item.image ? (
                    <img src={item.image} alt={`${item.title} icon`} className="menu-image" />
                  ) : (
                    <IonIcon icon={item.icon} />
                  )}
                </span>
                <span className="title">{item.title}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default Menu;
