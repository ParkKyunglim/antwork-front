import { useEffect, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction"; // 상호작용을 위한 플러그인
import listPlugin from "@fullcalendar/list";
import "../../../styles/calendar.scss";
import axios from "axios";
import {
  deleteSchedule,
  getCalendar,
  getSchedule,
  insertSchedule,
  updateScheduleDrag,
} from "../../../api/calendarAPI";
import useAuthStore from "../../../store/AuthStore";
import { useNavigate } from "react-router-dom";

function MyCalendar({ listMonth, setListMonth }) {
  const navigate = useNavigate();
  const calendarRef = useRef(null);
  const user = useAuthStore((state) => state.user); // Zustand에서 사용자 정보 가져오기
  const uid = user?.uid;
  // useState 몰아넣은 곳
  const [currentEventData, setCurrentEventData] = useState(null);
  const [holidays, setHolidays] = useState([]); // 공휴일 데이터를 저장할 상태
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false); // 수정 모드
  const [currentEventId, setCurrentEventId] = useState(null); // 수정 중인 이벤트의 ID 저장
  const [option, setOption] = useState([]);
  const allEvents = [...events, ...holidays];
  const [formData, setFormData] = useState({
    title: "",
    start: "",
    end: "",
    uid: "",
    calendarId: "",
    location: "",
    internalAttendees: [],
    externalAttendees: [],
    content: "",
  });
  //
  useEffect(() => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi(); // FullCalendar API 참조

      if (listMonth === "listWeek") {
        calendarApi.changeView("listWeek"); // 'listMonth' 버튼 동작 재현
        setListMonth("dayGridMonth");
      } else if (listMonth === "listMonth") {
        calendarApi.changeView("listMonth"); // 'listMonth' 버튼 동작 재현
        setListMonth("dayGridMonth");
      }
    }
  }, [listMonth]); // 컴포넌트가 처음 렌더링될 때 한 번 실행됨

  const customPrevYear = () => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      const currentDate = calendarApi.getDate();
      // 현재 날짜를 기준으로 1년을 빼고 새로운 Date 객체를 생성
      const prevYearDate = new Date(
        currentDate.setFullYear(
          currentDate.getFullYear() - 1,
          currentDate.getMonth(),
          currentDate.getDate()
        )
      );
      calendarApi.gotoDate(prevYearDate); // 새로 생성한 날짜로 이동
    }
  };

  const customNextYear = () => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      const currentDate = calendarApi.getDate();
      // 현재 날짜를 기준으로 1년을 더하고 새로운 Date 객체를 생성
      const nextYearDate = new Date(
        currentDate.setFullYear(currentDate.getFullYear() + 1)
      );
      calendarApi.gotoDate(nextYearDate); // 새로 생성한 날짜로 이동
    }
  };

  useEffect(() => {
    const fetchHolidays = async () => {
      const url =
        "http://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getRestDeInfo";
      const queryParams = `?serviceKey=Ga4qgNx2BToVICIp2Vnj8MeBJELIN1prWSVxT8pKAVTGMdtksMcuNH0avVG4rMFeAwPRp1pmUD58vhdtXIT8oA==&solYear=2024`; // 예시로 2024년 1월의 공휴일을 요청
      const numOfRows = 30;
      try {
        const response = await axios.get(url + queryParams, {
          params: { numOfRows: numOfRows },
        });
        const holidayData = response.data.response.body.items.item;

        // 공휴일 데이터를 FullCalendar에 맞게 변환
        const formattedHolidays = holidayData.map((holiday) => {
          const locdateStr = String(holiday.locdate); // 숫자일 경우 문자열로 변환
          const year = locdateStr.substring(0, 4);
          const month = locdateStr.substring(4, 6);
          const day = locdateStr.substring(6, 8);
          const formattedDate = `${year}-${month}-${day}`;

          return {
            title: holiday.dateName, // 공휴일 이름
            date: formattedDate, // 공휴일 날짜 (YYYYMMDD 형식)
            color: "white", // 공휴일 표시 색상
            display: "background",
          };
        });

        setHolidays(formattedHolidays); // 상태에 공휴일 데이터 저장
      } catch (error) {
        console.error("API 호출 오류:", error);
      }
    };

    fetchHolidays();
  }, []); // 컴포넌트가 처음 렌더링될 때만 호출

  useEffect(() => {
    const fetchData = async () => {
      const data2 = await getSchedule(uid);
      setEvents(data2);
    };

    fetchData();
  }, [uid]);

  // 날짜 클릭 시 모달 띄우기
  const handleDateClick = (info) => {
    const clickedDate = info.dateStr; // 클릭한 날짜
    const formattedDate = clickedDate + "T00:00"; // `datetime-local` 형식에 맞게 변환

    setFormData((prevState) => ({
      ...prevState,
      title: "",
      content: "",
      location: "",
      calendarId: "",
      start: formattedDate, // 시작일에 클릭한 날짜 설정
      end: formattedDate, // 종료일에도 클릭한 날짜 설정 (같은 날짜로 초기화)
    }));
    setEditMode(false); // 새 일정 추가이므로 수정 모드 아님
    setShowModal(true); // 모달 띄우기
    setCurrentEventId(null); // 수정 중인 이벤트 없음
  };

  // 일정 클릭 시 수정 모드로 진입
  const handleEventClick = (info) => {
    const event = info.event;
    const startDate = new Date(event.start).toLocaleString("sv-SE"); // 'yyyy-MM-ddTHH:mm' 형식으로 변환
    const endDate = event.end
      ? new Date(event.end).toLocaleString("sv-SE")
      : startDate; // 종료일도 처리
    const isHoliday = holidays.some((holiday) => holiday.title === event.title);

    if (isHoliday) {
      // 공휴일인 경우 드래그를 되돌려 원래 위치로 복원
      info.jsEvent.preventDefault();
      alert("공휴일은 수정할 수 없습니다!");
      return;
    }

    setFormData({
      title: event.title || "",
      location: event.extendedProps.location || "",
      calendarId: event.extendedProps.calendarId,
      content: event.extendedProps.content,
      start: startDate,
      end: endDate,
    });

    setEditMode(true); // 수정 모드로 설정
    setShowModal(true); // 모달 띄우기
    setCurrentEventId(event.id); // 수정하려는 이벤트의 ID 저장

    setCurrentEventData({ event });
  };

  const navigateToEditPage = () => {
    console.log();
    if (currentEventData) {
      navigate("/antwork/schedule", {
        state: {
          id: currentEventData.event.id,
        }, // eventData를 state로 전달
      });
    }
  };

  const handleDelete = () => {
    if (currentEventId && calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      const event = calendarApi.getEventById(currentEventId);

      if (event) {
        if (confirm("일정을 삭제하시겠습니까?")) {
          event.remove(); // FullCalendar의 해당 이벤트 삭제
          const fetchData = async () => {
            await deleteSchedule(event.id);
          };
          alert("일정이 삭제되었습니다.");
          fetchData();
          setShowModal(false); // 모달 닫기
        }
      } else {
        alert("삭제할 일정을 찾을 수 없습니다.");
      }
    } else {
      alert("삭제할 일정이 없습니다.");
    }
  };

  const handleDateSelect = (selectInfo) => {
    // 드래그한 범위의 날짜 정보 가져오기
    const { startStr, endStr } = selectInfo;
    console.log(selectInfo);
    // 새 일정 추가
    setFormData((prevState) => ({
      ...prevState,
      title: "",
      content: "",
      location: "",
      calendarId: "",
      start: startStr + "T00:00", // 시작일에 클릭한 날짜 설정
      end: endStr + "T00:00", // 종료일에도 클릭한 날짜 설정 (같은 날짜로 초기화)
    }));
    setEditMode(false); // 새 일정 추가이므로 수정 모드 아님
    setShowModal(true); // 모달 띄우기
    setCurrentEventId(null); // 수정 중인 이벤트 없음
  };

  const renderEventContent = (eventInfo) => {
    const { location } = eventInfo.event.extendedProps;

    const start = eventInfo.event.start;
    if (eventInfo.event.backgroundColor === "white") {
      return (
        <div className="flex justify-start ml-[33px] mt-1">
          <b className="text-[rgb(253,1,1)]">{eventInfo.event.title}</b>
        </div>
      ); // 이벤트가 빨간색 배경일 때 렌더링하지 않음
    }

    return (
      <div>
        <b>{eventInfo.event.title}</b>
        <p>
          {start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}{" "}
          장소: {location}
        </p>
      </div>
    );
  };

  const handleEventDrop = (info) => {
    const { event } = info;
    const isHoliday = holidays.some((holiday) => holiday.title === event.title);
    if (isHoliday) {
      // 공휴일인 경우 드래그를 되돌려 원래 위치로 복원
      info.revert();
    }
    console.log("ppppppppppp:::" + JSON.stringify(event));

    const fetchData = async () => {
      await updateScheduleDrag(event.id, event.start, event.end);
    };
    fetchData();

    setEvents((prevEvents) =>
      prevEvents.map((e) =>
        e.id === event.id
          ? { ...e, start: event.startStr, end: event.endStr }
          : e
      )
    );
  };

  const [dayMaxEvents, setDayMaxEvents] = useState(2); // dayMaxEvents 기본값 설정

  const handleDatesSet = (info) => {
    if (info.view.type === "dayGridMonth") {
      setDayMaxEvents(2); // dayGridMonth에서만 2개로 제한
    } else {
      setDayMaxEvents(false); // 다른 뷰에서는 제한 없음
    }
  };

  useEffect(() => {
    setFormData((prevState) => ({
      ...prevState,
      uid: uid,
    }));
    const fetchData = async () => {
      const data2 = await getCalendar(uid);
      setOption(data2);
    };
    fetchData();
  }, [uid]);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData); // 폼 제출 시 데이터 로그
    console.log("uid---------" + uid);
    setFormData({ uid: uid });
    const fetchData = async () => {
      console.log("form:::::::::" + JSON.stringify(formData));
      const result = await insertSchedule(formData);

      const calendarApi = calendarRef.current.getApi();
      calendarApi.addEvent(result); // FullCalendar에 동적으로 추가
    };
    fetchData();
    setFormData({
      title: "",
      start: "",
      end: "",
      uid: "",
      calendarId: "",
      location: "",
      internalAttendees: [],
      externalAttendees: [],
      content: "",
    });
    setShowModal(false);
  };

  return (
    <section className="w-auto h-auto bg-white mx-auto">
      <div className="w-full">
        {/* FullCalendar */}
        <FullCalendar
          ref={calendarRef}
          initialView="dayGridMonth"
          plugins={[dayGridPlugin, interactionPlugin, listPlugin]}
          events={allEvents}
          eventTextColor="black"
          eventColor="#b2d1ff" // event에 색상 설정
          selectable={true} // 드래그로 날짜 선택 활성화
          select={handleDateSelect} // 날짜 선택 시 실행할 함수
          slotWidth="auto" // slot의 너비를 자동으로 조정
          height="750px" // 일정 내용 영역의 높이를 200px로 고정
          dayMaxEvents={dayMaxEvents} // 일정 개수가 일정 한계를 초과할 때 + 더 보기 링크 표시
          datesSet={handleDatesSet} // 뷰 변경시마다 호출되는 이벤트
          moreLinkText={(n) => `+${n}개의 일정 더보기`} // 3개 이상일 때 나타날 + 텍스트
          locale="ko" // 언어를 한국어로 설정
          eventContent={renderEventContent} // 커스터마이징 렌더링
          dateClick={handleDateClick} // 날짜 클릭 시 새 일정 추가
          eventClick={handleEventClick} // 일정 클릭 시 수정
          editable={true} // 드래그 및 리사이즈 가능
          eventDrop={handleEventDrop} // 드래그 앤 드롭 후 호출
          headerToolbar={{
            start: "prev,next,today", // 이전/다음 버튼
            center: "customPrevYear,title,customNextYear", // 현재 날짜 제목
            end: "dayGridMonth,dayGridWeek", // 뷰 전환 버튼
          }}
          customButtons={{
            customPrevYear: {
              text: "<",
              click: customPrevYear, // 이전 1년 버튼 클릭 시
            },
            customNextYear: {
              text: ">",
              click: customNextYear, // 다음 1년 버튼 클릭 시
            },
          }}
          buttonText={{
            dayGridMonth: "월간 보기",
            dayGridWeek: "주간 보기",
          }}
        />

        {/* 모달 및 오버레이 */}
        {showModal && (
          <>
            {/* 어두운 배경 오버레이 */}
            <div
              className="fixed inset-0 bg-black/50 z-[100] "
              onClick={() => setShowModal(false)} // 배경 클릭 시 모달 닫기
            ></div>

            {/* 모달 창 */}
            <div className="fixed inset-0 flex items-center justify-center z-[101]">
              <form>
                <div className="w-[700px] h-[450px] bg-white shadow-lg p-7 rounded-lg">
                  <h3 className="text-lg font-bold mb-4">
                    {editMode ? "일정 수정" : "일정 추가"}
                  </h3>

                  {/* 제목 입력 */}
                  <input
                    type="text"
                    className="w-full p-2 mb-4 border rounded outline-none"
                    placeholder="제목"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                  />

                  {/* 장소 입력 */}
                  <input
                    type="text"
                    className="w-full p-2 mb-4 border rounded outline-none"
                    placeholder="장소"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                  />

                  {/* Calendar Selection */}
                  <select
                    name="calendarId"
                    value={formData.calendarId || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, calendarId: e.target.value })
                    }
                    className="w-full p-2 mb-4 border rounded outline-none"
                    required
                  >
                    <option value="">Calendar 선택</option>
                    {option.map((item) => (
                      <option key={item.calendarId} value={item.calendarId}>
                        {item.name}
                      </option>
                    ))}
                  </select>

                  {/* 설명 입력 */}
                  <textarea
                    className="w-full p-2 mb-4 border rounded outline-none"
                    placeholder="설명"
                    name="content"
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                  ></textarea>

                  {/* 시작일 입력 */}
                  <input
                    type="datetime-local"
                    className="w-full p-2 mb-4 border rounded outline-none"
                    name="start"
                    value={formData.start}
                    onChange={(e) =>
                      setFormData({ ...formData, start: e.target.value })
                    }
                  />

                  {/* 종료일 입력 */}
                  <input
                    type="datetime-local"
                    className="w-full p-2 mb-4 border rounded outline-none"
                    name="end"
                    value={formData.end}
                    onChange={(e) =>
                      setFormData({ ...formData, end: e.target.value })
                    }
                  />

                  {/* 버튼들 */}
                  <div className="flex justify-end space-x-2 outline-none">
                    <button
                      className="bg-[#A0C3F7] text-white px-4 py-2 rounded hover:bg-blue-400 outline-none"
                      onClick={handleSubmit}
                    >
                      {editMode ? "수정" : "저장"}
                    </button>
                    {editMode && (
                      <>
                        <button
                          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                          onClick={handleDelete}
                        >
                          삭제
                        </button>
                        <button
                          type="button"
                          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                          onClick={navigateToEditPage}
                        >
                          상세 수정
                        </button>
                      </>
                    )}
                    <button
                      className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                      onClick={() => setShowModal(false)}
                    >
                      취소
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default MyCalendar;
------------------------------------- myCalendar