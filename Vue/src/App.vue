<template>
  <DxPopup
      v-model:visible='popupVisible'
      :drag-enabled='false'
      :hide-on-outside-click='true'
      :show-close-button='false'
      :show-title='true'
      title='Information'
      container='.dx-viewport'
      width='280'
      height='150'
  >
    <DxPosition
        at='center'
        my='center'
    />
    <DxToolbarItem
        widget='dxButton'
        toolbar='bottom'
        location='after'
        :options='closeButtonOptions'
    />
    <p>There is a recurrent appointment in this cell.</p>
  </DxPopup>
  <DxScheduler
      :on-appointment-adding='handleAppointmentAdd'
      :on-appointment-updating='handleAppointmentUpdate'
      :data-source='data'
      :views='[{type: "week"}]'
      :first-day-of-week='0'
      :all-day-panel-mode='allDayPanelMode'
      :current-date='new Date(2020, 10, 25)'
      :start-day-hour='9'
      current-view='week'
      width='100%'
      height='100%'
  />
</template>

<script>
import 'devextreme/dist/css/dx.common.css';
import 'devextreme/dist/css/dx.material.blue.light.css';
import { DxScheduler } from 'devextreme-vue/scheduler';
import { DxPopup, DxPosition, DxToolbarItem } from 'devextreme-vue/popup';
import { isOverlapRecurrentAppointment } from './utils/isOverlapRecurrentAppointment.js';
import { defaultData } from './data';

export default {
  name: 'App',
  components: {
    DxScheduler,
    DxPopup,
    DxPosition,
    DxToolbarItem
  },
  data() {
    return {
      allDayPanelMode: 'hidden',
      popupVisible: false,
      data: defaultData,
      closeButtonOptions: {
        text: 'Close',
        onClick: () => {
          this.popupVisible = false;
        },
      },
    }
  },
  methods: {
    handleAppointmentActions (
        event,
        recurrentAppointments,
        newAppointment) {
      for (const recurrentAppointment of recurrentAppointments) {
        const isOverlap = isOverlapRecurrentAppointment(
            event,
            recurrentAppointment,
            newAppointment);
        if (isOverlap) {
          event.cancel = true;
          this.popupVisible = true;
        }
      }
    },
    getRecurrentAppointments() {
      return defaultData
          .filter((appointment) => appointment?.recurrenceRule)
          .map((appointment) => ({
            ...appointment,
            startDate: new Date(appointment.startDate),
            endDate: new Date(appointment.endDate),
          }));
    },
    handleAppointmentAdd(event) {
      this.handleAppointmentActions(
          event,
          this.getRecurrentAppointments(),
          event.appointmentData,
      );
    },
    handleAppointmentUpdate(event) {
      const recurrentAppointments = this.getRecurrentAppointments()
          .filter((appointment) => appointment !== event.oldData);
      this.handleAppointmentActions(
          event,
          recurrentAppointments,
          event.newData,
      )
    }
  }
}
</script>
