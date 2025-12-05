import { defaultData } from './data.js';
import { isOverlapRecurrentAppointment } from './utils/isOverlapRecurrentAppointment.js';

$(() => {
  const scheduler = $('#scheduler').dxScheduler({
    dataSource: defaultData,
    views: ['week'],
    currentView: 'week',
    currentDate: new Date(2020, 10, 25),
    firstDayOfWeek: 0,
    startDayHour: 9,
    height: '100%',
    width: '100%',
    allDayPanelMode: 'hidden',
    onAppointmentAdding: (event) => {
      handleAppointmentAdd(event);
    },
    onAppointmentUpdating: (event) => {
      handleAppointmentUpdate(event);
    },
  }).dxScheduler('instance');

  const popup = $('#popup').dxPopup({
    contentTemplate: () => $('<div>').append(
      $('<p>There is a recurrent appointment in this cell.</p>'),
    ),
    width: 300,
    height: 150,
    container: '.dx-viewport',
    showTitle: true,
    title: 'Information',
    visible: false,
    dragEnabled: false,
    hideOnOutsideClick: true,
    showCloseButton: false,
    position: {
      at: 'center',
      my: 'center',
    },
    toolbarItems: [{
      widget: 'dxButton',
      toolbar: 'bottom',
      location: 'after',
      options: {
        text: 'Close',
        onClick: () => {
          popup.hide();
        },
      },
    }],
  }).dxPopup('instance');

  const getViewBoundaries = () => ({
    startDate: scheduler.getStartViewDate(),
    endDate: scheduler.getEndViewDate(),
  });

  const getRecurrentAppointments = () => defaultData
    .filter((appointment) => appointment?.recurrenceRule)
    .map((appointment) => ({
      ...appointment,
      startDate: new Date(appointment.startDate),
      endDate: new Date(appointment.endDate),
    }));

  const handleAppointmentActions = (
    event,
    recurrentAppointments,
    newAppointment,
  ) => {
    const viewBoundaries = getViewBoundaries();
    const overlapFound = recurrentAppointments.some((recurrentAppointment) => (
      isOverlapRecurrentAppointment(
        viewBoundaries.startDate,
        viewBoundaries.endDate,
        recurrentAppointment,
        newAppointment,
      )
    ));

    if (overlapFound) {
      event.cancel = true;
      popup.show();
    }
  };

  const handleAppointmentAdd = (event) => {
    handleAppointmentActions(
      event,
      getRecurrentAppointments(),
      event.appointmentData,
    );
  };

  const handleAppointmentUpdate = (event) => {
    const recurrentAppointments = getRecurrentAppointments()
      .filter((appointment) => appointment !== event.oldData);

    handleAppointmentActions(
      event,
      recurrentAppointments,
      event.newData,
    );
  };
});
