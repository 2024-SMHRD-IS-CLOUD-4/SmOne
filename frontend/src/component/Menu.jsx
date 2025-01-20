import React, { useState } from "react";
import "./Menu.css";
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
    { title: "Setting", icon: settingsOutline },
    { title: 'Change PW', icon: lockClosedOutline },
    { title: "Log Out", icon: logOutOutline },
  ];

  const handleClick = (index) => {
    setActiveIndex(index);
    if (menuItems[index].title === "Home") {
      onHomeClick(); // Home 클릭 시 초기화 함수 호출
      navigate("/Main"); // Main 화면으로 이동
    }
    if (menuItems[index].title === "My Page") {
      onProfileClick(); // Profile 클릭 시 MyPage 출력 상태 변경
    }
    if (menuItems[index].title === "Patient") {
      onPatientClick(); // Patient 클릭 시 PatientJoin 출력
    }
    if (menuItems[index].title === "Log Out") {
      navigate("/login"); // Log Out 클릭 시 로그인 페이지로 이동
    }
  };

  const toggleMenu = () => {
    setIsExpanded(!isExpanded);
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
