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
import patientIcon from "./patient.png"; // Patient 아이콘 이미지 import

const Menu = ({ onProfileClick, onPatientClick, onHomeClick }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  const menuItems = [
    { title: "Home", icon: homeOutline },
    { title: "My Page", icon: personOutline },
    { title: "Patient", icon: null, image: patientIcon },

    { title: 'Change PW', icon: lockClosedOutline },
    { title: "Log Out", icon: logOutOutline },
  ];

  const handleClick = (index) => {
    setActiveIndex(index);
    if (menuItems[index].title === "Home") {
      if (onHomeClick) onHomeClick(); // Reset patient selection
      navigate("/Main"); // Navigate back to main screen
    }
    if (menuItems[index].title === "My Page") {
      navigate("/mypage"); // MyPage로 이동
    }
    if (menuItems[index].title === "Patient") {
      navigate("/patients"); // 환자 등록 페이지로 이동
    }
    if (menuItems[index].title === "Log Out") {
      handleLogout(); // 로그아웃 실행
    }
  };
  const toggleMenu = () => {
    setIsExpanded(!isExpanded);
  };
  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:8090/SmOne/api/users/logout", {}, { withCredentials: true });
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
