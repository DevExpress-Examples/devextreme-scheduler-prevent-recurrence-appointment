<script setup lang="ts">
import { ref } from 'vue';
import DxScheduler, { type DxSchedulerTypes } from 'devextreme-vue/scheduler';
import { DxPopup, DxPosition, DxToolbarItem } from 'devextreme-vue/popup';
import { appointments } from '../data/appointments';
import { isOverlapRecurrentAppointment } from '../utils/isOverlapRecurrentAppointment';
import type { Appointment } from '../types/appointments';

type SchedulerComponentRef = InstanceType<typeof DxScheduler>;
type ViewBoundaries = {
  startDate: Date;
  endDate: Date;
};

const schedulerRef = ref<SchedulerComponentRef | null>(null);
const popupVisible = ref(false);
const dataSource = ref<Appointment[]>(appointments);
const views = [{ type: 'week' }];
const currentDate = new Date(2020, 10, 25);
const firstDayOfWeek = 0;
const startDayHour = 9;
const allDayPanelMode = 'hidden';

const closeButtonOptions = {
  text: 'Close',
  onClick: (): void => {
    popupVisible.value = false;
  },
};

const getViewBoundaries = (): ViewBoundaries | null => {
  const schedulerInstance = schedulerRef.value?.instance;
  if (!schedulerInstance) {
    return null;
  }

  return {
    startDate: schedulerInstance.getStartViewDate(),
    endDate: schedulerInstance.getEndViewDate(),
  };
};

const getRecurrentAppointments = (): Appointment[] => dataSource.value
  .filter((appointment) => appointment?.recurrenceRule)
  .map((appointment) => ({
    ...appointment,
    startDate: new Date(appointment.startDate),
    endDate: new Date(appointment.endDate),
  }));

const handleAppointmentActions = (
  event: DxSchedulerTypes.AppointmentAddingEvent | DxSchedulerTypes.AppointmentUpdatingEvent,
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
      popupVisible.value = true;
      return;
    }
  }
};

const handleAppointmentAdd = (event: DxSchedulerTypes.AppointmentAddingEvent): void => {
  handleAppointmentActions(
    event,
    getRecurrentAppointments(),
    event.appointmentData as Appointment,
  );
};

const handleAppointmentUpdate = (event: DxSchedulerTypes.AppointmentUpdatingEvent): void => {
  const recurrentAppointments = getRecurrentAppointments()
    .filter((appointment) => appointment !== event.oldData);

  handleAppointmentActions(
    event,
    recurrentAppointments,
    event.newData as Appointment,
  );
};
</script>

<template>
  <div class="scheduler-container">
    <DxPopup
      v-model:visible="popupVisible"
      :drag-enabled="false"
      :hide-on-outside-click="true"
      :show-close-button="false"
      :show-title="true"
      title="Information"
      container=".dx-viewport"
      :width="280"
      :height="150"
    >
      <DxPosition
        at="center"
        my="center"
      />
      <DxToolbarItem
        widget="dxButton"
        toolbar="bottom"
        location="after"
        :options="closeButtonOptions"
      />
      <p>There is a recurrent appointment in this cell.</p>
    </DxPopup>

    <DxScheduler
      ref="schedulerRef"
      :data-source="dataSource"
      :views="views"
      current-view="week"
      :current-date="currentDate"
      :first-day-of-week="firstDayOfWeek"
      :start-day-hour="startDayHour"
      :all-day-panel-mode="allDayPanelMode"
      width="100%"
      height="100%"
      :on-appointment-adding="handleAppointmentAdd"
      :on-appointment-updating="handleAppointmentUpdate"
    />
  </div>
</template>
