import CalendarAside from "../../../components/common/calendarAside";
import AntWorkLayout from "../../../layouts/AntWorkLayout";
import MyCalendar from "../../../components/main/Calendar/MyCalendar";
import ScheduleList from "../../../components/main/Calendar/ScheduleList";

export default function CalendarPage() {
  return (
    <>
      <AntWorkLayout>
        <CalendarAside />
        {/* <ScheduleList /> */}
        <section className="cal">
          <MyCalendar />
        </section>
      </AntWorkLayout>
    </>
  );
}
