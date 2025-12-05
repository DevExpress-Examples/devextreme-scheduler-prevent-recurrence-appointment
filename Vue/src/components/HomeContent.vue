<script setup lang="ts">
import { ref } from 'vue';
import 'devextreme/dist/css/dx.common.css';
import 'devextreme/dist/css/dx.material.blue.light.css';
import { DxScheduler } from 'devextreme-vue/scheduler';
import { DxPopup, DxPosition, DxToolbarItem } from 'devextreme-vue/popup';
import { isOverlapRecurrentAppointment } from '../utils/isOverlapRecurrentAppointment';
import { defaultData } from '../data';
import type { Appointment } from '../interfaces';
import type { AppointmentAddingEvent, AppointmentUpdatingEvent } from 'devextreme/ui/scheduler';

const allDayPanelMode = 'hidden';
const popupVisible = ref<boolean>(false);
const data = ref<Appointment[]>(defaultData);

const closeButtonOptions = {
  text: 'Close',
  onClick: (): void => {
    popupVisible.value = false;
  },
};

function handleAppointmentActions(
  event: AppointmentAddingEvent | AppointmentUpdatingEvent,
  recurrentAppointments: Appointment[],
  newAppointment: Appointment
): void {
  for (const recurrentAppointment of recurrentAppointments) {
    const isOverlap = isOverlapRecurrentAppointment(
      event as AppointmentAddingEvent,
      recurrentAppointment,
      newAppointment
    );
    if (isOverlap) {
      event.cancel = true;
      popupVisible.value = true;
    }
  }
}

function getRecurrentAppointments(): Appointment[] {
  return defaultData
    .filter((appointment) => appointment?.recurrenceRule)
    .map((appointment) => ({
      ...appointment,
      startDate: new Date(appointment.startDate),
      endDate: new Date(appointment.endDate),
    }));
}

function handleAppointmentAdd(event: AppointmentAddingEvent): void {
  handleAppointmentActions(
    event,
    getRecurrentAppointments(),
    event.appointmentData as Appointment
  );
}

function handleAppointmentUpdate(event: AppointmentUpdatingEvent): void {
  const recurrentAppointments = getRecurrentAppointments()
    .filter((appointment) => appointment !== event.oldData);
  handleAppointmentActions(
    event,
    recurrentAppointments,
    event.newData as Appointment
  );
}
</script>

<template>
  <div>
    <DxPopup
      v-model:visible="popupVisible"
      :drag-enabled="false"
      :hide-on-outside-click="true"
      :show-close-button="false"
      :show-title="true"
      title="Information"
      container=".dx-viewport"
      width="280"
      height="150"
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
      :on-appointment-adding="handleAppointmentAdd"
      :on-appointment-updating="handleAppointmentUpdate"
      :data-source="data"
      :views="[{ type: 'week' }]"
      :first-day-of-week="0"
      :all-day-panel-mode="allDayPanelMode"
      :current-date="new Date(2020, 10, 25)"
      :start-day-hour="9"
      current-view="week"
      width="100%"
      height="100%"
    />
  </div>
</template>
