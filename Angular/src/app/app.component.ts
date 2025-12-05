import { Component, ViewChild } from '@angular/core';
import { DxSchedulerComponent } from 'devextreme-angular/ui/scheduler';
import type { PositionConfig } from 'devextreme/animation/position';
import type { ToolbarItem } from 'devextreme/ui/popup';
import type { AppointmentAddingEvent, AppointmentUpdatingEvent } from 'devextreme/ui/scheduler';
import { appointments } from '../data/appointments';
import { isOverlapRecurrentAppointment } from '../utils/isOverlapRecurrentAppointment';
import type { Appointment, CloseButtonOptions } from './interfaces';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  @ViewChild(DxSchedulerComponent, { static: false }) scheduler?: DxSchedulerComponent;

  readonly allDayPanelMode = 'hidden';

  readonly dataSource = appointments;

  readonly currentDate = new Date(2020, 10, 25);

  readonly startDayHour = 9;

  readonly firstDayOfWeek = 0;

  popupVisible = false;

  readonly closeButtonOptions: CloseButtonOptions = {
    text: 'Close',
    onClick: (): void => {
      this.popupVisible = false;
    },
  };

  readonly popupToolbarItems: ToolbarItem[] = [{
    widget: 'dxButton',
    toolbar: 'bottom',
    location: 'after',
    options: this.closeButtonOptions,
  }];

  readonly popupPosition: PositionConfig = {
    at: 'center',
    my: 'center',
  };

  handleAppointmentAdd(event: AppointmentAddingEvent): void {
    this.handleAppointmentActions(
      event,
      this.getRecurrentAppointments(),
      event.appointmentData as Appointment,
    );
  }

  handleAppointmentUpdate(event: AppointmentUpdatingEvent): void {
    const recurrentAppointments = this.getRecurrentAppointments()
      .filter((appointment) => appointment !== event.oldData);

    this.handleAppointmentActions(
      event,
      recurrentAppointments,
      event.newData as Appointment,
    );
  }

  private handleAppointmentActions(
    event: AppointmentAddingEvent | AppointmentUpdatingEvent,
    recurrentAppointments: Appointment[],
    newAppointment: Appointment,
  ): void {
    const viewBoundaries = this.getViewBoundaries();
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
        this.popupVisible = true;
        return;
      }
    }
  }

  private getViewBoundaries(): { startDate: Date; endDate: Date } | null {
    const schedulerInstance = this.scheduler?.instance;
    if (!schedulerInstance) {
      return null;
    }

    return {
      startDate: schedulerInstance.getStartViewDate(),
      endDate: schedulerInstance.getEndViewDate(),
    };
  }

  private getRecurrentAppointments(): Appointment[] {
    return this.dataSource
      .filter((appointment) => appointment?.recurrenceRule)
      .map((appointment) => ({
        ...appointment,
        startDate: new Date(appointment.startDate),
        endDate: new Date(appointment.endDate),
      }));
  }
}
