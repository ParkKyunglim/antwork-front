import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getCalendar,
  insertCalendar,
  updateCalendar,
  deleteCalendar,
  getSchedule,
} from "../../../api/calendarAPI";
import useAuthStore from "../../../store/AuthStore";
import { useCalendarStore } from "../../../store/CalendarStore";

export default function CalendarAside({ asideVisible, setListMonth }) {
  const user = useAuthStore((state) => state.user); // Zustand에서 사용자 정보 가져오기
  const uid = user?.uid;
  const id = user?.id;
  const navigate = useNavigate();
  const [isMyOpen, setIsMyOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const handleButtonClick = () => {
    console.log("버튼 클릭!");
    setListMonth("listWeek"); // listMonth 값 업데이트
  };
  const handleButtonClick2 = () => {
    console.log("버튼 클릭!");
    setListMonth("listMonth"); // listMonth 값 업데이트
  };
  const [calendars, setCalendars] = useState([]);
  const [editingId, setEditingId] = useState(null); // 수정 중인 캘린더 ID
  const [newName, setNewName] = useState(""); // 수정 중인 이름
  const [color, setColor] = useState("");
  // 새 캘린더 추가 함수
  const addCalendar = async (e) => {
    e.preventDefault();
    if (confirm("캘린더를 추가 하시겠습니까?")) {
      const newCalendar = {
        no: calendars.length,
        name: `새 캘린더`, // 기본 이름
        user_id: uid,
        view: id,
        color: "#b2d1ff",
      };
      setCalendars([...calendars, newCalendar]); // 상태 업데이트
      await insertCalendar(newCalendar);
      const data = await getCalendar(id);
      setData(data);
    }
  };

  const startEditing = (no, currentName) => {
    setEditingId(no);
    setNewName(currentName); // 기존 이름 설정
  };

  // 이름 저장
  const saveName = (no) => {
    const fetchData = async () => {
      const finalColor = color.trim() === "" ? "not" : color;

      console.log("ccoollllll::" + finalColor);
      setColor(finalColor);

      await updateCalendar(no, newName, finalColor);
    };

    fetchData();
    setEditingId(null); // 수정 모드 종료
    setNewName(""); // 입력 초기화
    // window.location.reload(); // 페이지 새로 고침
  };

  // 수정 취소
  const cancelEditing = () => {
    setEditingId(null);
    setNewName("");
  };

  // 캘린더 삭제
  const deleteCal = (no) => {
    console.log(no);
    if (confirm("정말 삭제하시겠습니까? 일정도 같이 삭제됩니다.")) {
      const fetchData = async () => {
        await deleteCalendar(no);
        const data = await getCalendar(id);
        setData(data);
      };
      fetchData();
    }
  };

  const [data, setData] = useState([]);
  const [schedule, setSchedule] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      const data = await getCalendar(id);
      const data2 = await getSchedule(id);

      const updatedData = data2.filter((item) => {
        const startTime = new Date(item.start); // start 값을 Date 객체로 변환
        const endTime = new Date(item.end); // end 값을 Date 객체로 변환
        const today = new Date(); // 현재 날짜를 기준으로 검사
        today.setHours(0, 0, 0, 0); // 오늘의 00:00:00
        const tomorrow = new Date(today); // 내일의 00:00:00
        tomorrow.setDate(today.getDate() + 1);

        // 조건: start <= today < end
        return startTime <= today && endTime >= tomorrow;
      });

      setData(data);
      setSchedule(updatedData);
    };

    fetchData();
  }, [uid]);

  const navigateToEditPage = (id) => {
    console.log();
    if (id) {
      navigate("/antwork/schedule", {
        state: {
          id: id,
        }, // eventData를 state로 전달
      });
    }
  };

  const { selectedIds, toggleCheckbox } = useCalendarStore();

  const handleColorChange = (newColor) => {
    // newColor가 없으면 기본값으로 "not" 설정
    const finalColor = newColor.trim() === "" ? "not" : newColor;

    console.log("ccoollllll::" + finalColor);
    setColor(finalColor);
  };

  const openModal = useCalendarStore((state) => state.openModal);

  return (
    <>
      <aside className={`sidebar ${!asideVisible ? "hidden" : ""}`}>
        <div className="logo !border-b-0">
          <span className="sub-title">My Schedule</span>

          <span className="title">Calendar</span>
          <Link
            to="/antwork/schedule"
            className="w-full flex items-center justify-center space-x-2 p-2 border border-gray-200 rounded-md text-gray-700 hover:bg-gray-50 mt-6 h-14"
            style={{ backgroundColor: "#D9E8FF" }}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span className="text-xl">New Schedule</span>
          </Link>
        </div>
        <ul className="a mt-20">
          <li className="">
            <div>
              <button
                type="button"
                className="w-[195px] h-[40px] flex items-center border-b border-[#d9d9d9] mb-[15px]"
                onClick={() => setIsMyOpen(!isMyOpen)}
              >
                <span className="m-[3px] cursor-pointer">
                  <img
                    src={
                      isMyOpen
                        ? "/images/Antwork/main/drive/위화살표.png"
                        : "/images/Antwork/main/drive/아래화살표.png"
                    }
                    alt="화살표 아이콘"
                    className="w-4 h-4"
                  />
                </span>

                <span className="main-cate">🗓 내 캘린더</span>
              </button>
            </div>
            <div
              className={`Mydrive_List transition-all duration-300 overflow-hidden ${
                isMyOpen ? "max-h-screen" : "max-h-0"
              }`}
            >
              <ul>
                {data.map((item) => (
                  <li key={item.calendarId}>
                    <div className="flex items-center mb-2">
                      {/* 세련된 체크박스 */}
                      <input
                        type="checkbox"
                        id={`checkbox-${item.calendarId}`}
                        className="form-checkbox h-5 w-5 text-blue-500 border-gray-300 rounded focus:ring focus:ring-blue-200"
                        checked={selectedIds.includes(item.calendarId)}
                        onChange={() => toggleCheckbox(item.calendarId)}
                      />

                      {/* 이름 표시 또는 이름 변경 필드 */}
                      {editingId === item.calendarId ? (
                        <div>
                          <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="border rounded-md w-[101px] px-2 py-1 ml-[10px]"
                          />
                          <br />
                          <button
                            onClick={() => saveName(item.calendarId)}
                            className="ml-2 text-green-500"
                          >
                            저장
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="ml-2 text-red-500"
                          >
                            취소
                          </button>
                        </div>
                      ) : (
                        <span className="ml-2">📅 {item.name}</span>
                      )}

                      {/* 이름 수정 버튼 */}
                      {editingId !== item.calendarId && (
                        <button
                          onClick={() =>
                            startEditing(item.calendarId, item.name)
                          }
                          className="ml-2 text-blue-500"
                        >
                          수정
                        </button>
                      )}

                      {/* 캘린더 삭제 버튼 */}
                      {editingId !== item.calendarId && (
                        <button
                          onClick={() => deleteCal(item.calendarId)}
                          className="ml-2 text-red-500"
                        >
                          삭제
                        </button>
                      )}
                      {editingId === item.calendarId ? (
                        <input
                          type="color"
                          value={item.color}
                          onChange={(e) => handleColorChange(e.target.value)} // 색상 변경 시 처리
                          id="colorCalendar"
                          className="w-[20px] h-[20px] rounded-full appearance-none bg-transparent border-none"
                        />
                      ) : (
                        <input
                          type="color"
                          value={item.color}
                          disabled
                          id="colorCalendar"
                          className="w-[20px] h-[20px] rounded-full appearance-none bg-transparent border-none"
                        />
                      )}
                    </div>
                  </li>
                ))}

                {/* 새 캘린더 추가 버튼 */}
                <li>
                  <button
                    onClick={addCalendar}
                    className="ml-[20px] text-blue-500"
                  >
                    + 캘린더 추가
                  </button>
                </li>
              </ul>
            </div>
          </li>
          <li className="">
            <div>
              <button
                type="button"
                className="w-[195px] h-[40px] flex items-center border-b border-[#d9d9d9] mb-[15px]"
                onClick={() => setIsShareOpen(!isShareOpen)}
              >
                <span className="m-[3px] cursor-pointer">
                  <img
                    src={
                      isShareOpen
                        ? "/images/Antwork/main/drive/위화살표.png"
                        : "/images/Antwork/main/drive/아래화살표.png"
                    }
                    alt="화살표 아이콘"
                    className="w-4 h-4"
                  />
                </span>

                <span className="main-cate">⏰ 오늘의 일정</span>
              </button>
            </div>
            <div
              className={`Mydrive_List transition-all duration-300 overflow-hidden ${
                isShareOpen ? "max-h-screen" : "max-h-0"
              } pl-8`}
            >
              <ul>
                {schedule.map((item, index) => (
                  <li key={index}>
                    <button onClick={() => navigateToEditPage(item.id)}>
                      <div className="flex items-start items-center mb-2 space-x-4 text-center">
                        <span>📄 &nbsp; {item.title}</span>
                      </div>
                    </button>
                  </li>
                ))}
                <li>
                  <button onClick={handleButtonClick2}>
                    <div className="flex items-start items-center mb-2 space-x-4">
                      <span>&nbsp; 📚 월간일정</span>
                    </div>
                  </button>
                  <button onClick={handleButtonClick}>
                    <div className="flex items-start items-center mb-2 space-x-4">
                      <span>&nbsp; 📕 주간일정</span>
                    </div>
                  </button>
                </li>
              </ul>
            </div>
          </li>
          <li>
            <div>
              <button className="main-cate " onClick={openModal}>
                🤝 캘린더 공유하기
              </button>
            </div>
          </li>
        </ul>
      </aside>
    </>
  );
}
