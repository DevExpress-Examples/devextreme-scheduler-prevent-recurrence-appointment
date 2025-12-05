import type dxScheduler from 'devextreme/ui/scheduler';
import type { AppointmentAddingEvent, AppointmentUpdatingEvent } from 'devextreme/ui/scheduler';
import Scheduler from 'devextreme-react/scheduler';
import {
  Popup,
  Position,
  ToolbarItem,
} from 'devextreme-react/popup';
import {
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import 'devextreme/dist/css/dx.common.css';
import 'devextreme/dist/css/dx.material.blue.light.css';
import './App.css';
import { appointments } from './data/appointments';
import { isOverlapRecurrentAppointment } from './utils/isOverlapRecurrentAppointment';
import type { Appointment } from './types/appointments';

const views: 'week'[] = ['week'];

interface ViewBoundaries {
  startDate: Date;
  endDate: Date;
}

interface SchedulerComponentRef {
  instance: () => dxScheduler;
}

function App(): JSX.Element {
  const schedulerRef = useRef<SchedulerComponentRef | null>(null);
  const [popupVisible, setPopupVisible] = useState<boolean>(false);
  const data = useMemo(() => appointments, []);

  const closeButtonOptions = useMemo(
    () => ({
      text: 'Close',
      onClick: (): void => setPopupVisible(false),
    }),
    [setPopupVisible],
  );

  const getViewBoundaries = useCallback((): ViewBoundaries | null => {
    const schedulerInstance = schedulerRef.current?.instance();
    if (!schedulerInstance) {
      return null;
    }

    return {
      startDate: schedulerInstance.getStartViewDate(),
      endDate: schedulerInstance.getEndViewDate(),
    };
  }, []);

  const getRecurrentAppointments = useCallback(
    (): Appointment[] => data
      .filter((appointment) => appointment?.recurrenceRule)
      .map((appointment) => ({
        ...appointment,
        startDate: new Date(appointment.startDate),
        endDate: new Date(appointment.endDate),
      })),
    [data],
  );

  const handleAppointmentActions = useCallback((
    event: AppointmentAddingEvent | AppointmentUpdatingEvent,
    recurrentAppointments: Appointment[],
    newAppointment: Appointment,
  ): void => {
    const viewBoundaries = getViewBoundaries();
    if (!viewBoundaries) {
      return;
    }

    for (const recurrentAppointment of recurrentAppointments) {
      const overlapFound = isOverlapRecurrentAppointment(
        viewBoundaries.startDate,
        viewBoundaries.endDate,
        recurrentAppointment,
        newAppointment,
      );

      if (overlapFound) {
        event.cancel = true;
        setPopupVisible(true);
        return;
      }
    }
  }, [getViewBoundaries, setPopupVisible]);

  const handleAppointmentAdd = useCallback((event: AppointmentAddingEvent): void => {
    handleAppointmentActions(
      event,
      getRecurrentAppointments(),
      event.appointmentData as Appointment,
    );
  }, [getRecurrentAppointments, handleAppointmentActions]);

  const handleAppointmentUpdate = useCallback((event: AppointmentUpdatingEvent): void => {
    const recurrentAppointments = getRecurrentAppointments()
      .filter((appointment) => appointment !== event.oldData);

    handleAppointmentActions(
      event,
      recurrentAppointments,
      event.newData as Appointment,
    );
  }, [getRecurrentAppointments, handleAppointmentActions]);

  return (
    <div className="app-container">
      <Popup
        visible={popupVisible}
        dragEnabled={false}
        hideOnOutsideClick
        showCloseButton={false}
        showTitle
        title="Information"
        container=".dx-viewport"
        width={280}
        height={150}
      >
        <Position at="center" my="center" />
        <ToolbarItem
          widget="dxButton"
          toolbar="bottom"
          location="after"
          options={closeButtonOptions}
        />
        <p>There is a recurrent appointment in this cell.</p>
      </Popup>

      <Scheduler
        ref={schedulerRef}
        dataSource={data}
        views={views}
        defaultCurrentView="week"
        defaultCurrentDate={new Date(2020, 10, 25)}
        firstDayOfWeek={0}
        startDayHour={9}
        allDayPanelMode="hidden"
        height="100%"
        width="100%"
        onAppointmentAdding={handleAppointmentAdd}
        onAppointmentUpdating={handleAppointmentUpdate}
      />
    </div>
  );
}

export default App;
