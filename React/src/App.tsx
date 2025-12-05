import React, {
  useCallback, useState, useRef, useMemo,
} from 'react';
import Scheduler from 'devextreme-react/scheduler';
import { Popup, Position, ToolbarItem } from 'devextreme-react/popup';
import type { AppointmentAddingEvent, AppointmentUpdatingEvent } from 'devextreme/ui/scheduler';
import { isOverlapRecurrentAppointment } from './utils/isOverlapRecurrentAppointment';
import { defaultData } from './data';
import type { Appointment } from './interfaces';
import 'devextreme/dist/css/dx.common.css';
import 'devextreme/dist/css/dx.material.blue.light.css';
import './App.css';

function App(): JSX.Element {
  const [popupVisible, setPopupVisible] = useState<boolean>(false);
  const [data] = useState<Appointment[]>(defaultData);

  const closeButtonOptions = useRef({
    text: 'Close',
    onClick: (): void => {
      setPopupVisible(false);
    },
  });

  const schedulerViews = useMemo(() => [{
    type: 'week' as const,
  }], []);

  const handleAppointmentActions = useCallback(
    (
      event: AppointmentAddingEvent | AppointmentUpdatingEvent,
      recurrentAppointments: Appointment[],
      newAppointment: Appointment,
    ): void => {
      for (const recurrentAppointment of recurrentAppointments) {
        const isOverlap = isOverlapRecurrentAppointment(
          event as AppointmentAddingEvent,
          recurrentAppointment,
          newAppointment,
        );
        if (isOverlap) {
          event.cancel = true;
          setPopupVisible(true);
        }
      }
    },
    [],
  );

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

  const handleAppointmentAdd = useCallback(
    (event: AppointmentAddingEvent): void => {
      handleAppointmentActions(
        event,
        getRecurrentAppointments(),
        event.appointmentData as Appointment,
      );
    },
    [handleAppointmentActions, getRecurrentAppointments],
  );

  const handleAppointmentUpdate = useCallback(
    (event: AppointmentUpdatingEvent): void => {
      const recurrentAppointments = getRecurrentAppointments().filter(
        (appointment) => appointment !== event.oldData,
      );
      handleAppointmentActions(event, recurrentAppointments, event.newData as Appointment);
    },
    [handleAppointmentActions, getRecurrentAppointments],
  );

  return (
    <React.Fragment>
      <Popup
        visible={popupVisible}
        dragEnabled={false}
        hideOnOutsideClick={true}
        showCloseButton={false}
        showTitle={true}
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
          options={closeButtonOptions.current}
        />
        <p>There is a recurrent appointment in this cell.</p>
      </Popup>
      <Scheduler
        dataSource={data}
        views={schedulerViews}
        firstDayOfWeek={0}
        defaultCurrentView="week"
        defaultCurrentDate={new Date(2020, 10, 25)}
        startDayHour={9}
        width="100%"
        height="100%"
        allDayPanelMode="hidden"
        onAppointmentAdding={handleAppointmentAdd}
        onAppointmentUpdating={handleAppointmentUpdate}
      />
    </React.Fragment>
  );
}

export default App;
