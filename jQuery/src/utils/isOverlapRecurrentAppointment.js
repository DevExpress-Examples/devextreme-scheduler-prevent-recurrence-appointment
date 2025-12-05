/* global rrule */
/* eslint-disable spellcheck/spell-checker -- rrule API naming */

const { RRule, rrulestr } = rrule;

function isOverlapUsualRecurrentAppointment(
  recurrentStartDatesInView,
  recurrentBaseAppointment,
  newAppointment,
) {
  const recurrentBaseStartTime = recurrentBaseAppointment.startDate.getTime();
  const recurrentBaseEndTime = recurrentBaseAppointment.endDate.getTime();
  const recurrentDuration = recurrentBaseEndTime - recurrentBaseStartTime;
  const newStartTime = newAppointment.startDate.getTime();
  const newEndTime = newAppointment.endDate.getTime();

  return recurrentStartDatesInView.some((recurrentStartDate) => {
    const recurrentStartTime = recurrentStartDate.getTime();
    const recurrentEndTime = recurrentStartTime + recurrentDuration;

    return (
      (newStartTime > recurrentStartTime && newStartTime < recurrentEndTime)
      || (newEndTime > recurrentStartTime && newEndTime < recurrentEndTime)
      || (recurrentStartTime > newStartTime && recurrentStartTime < newEndTime)
    );
  });
}

export function isOverlapRecurrentAppointment(
  viewStartDate,
  viewEndDate,
  recurrentAppointment,
  newAppointment,
) {
  const recurrenceOptions = rrulestr(recurrentAppointment.recurrenceRule);
  const rule = new RRule({
    freq: recurrenceOptions.options.freq,
    interval: recurrenceOptions.options.interval,
    byweekday: recurrenceOptions.options.byweekday,
    dtstart: recurrentAppointment?.startDate,
  });
  const recurrentStartDatesInView = rule.between(viewStartDate, viewEndDate);

  return isOverlapUsualRecurrentAppointment(
    recurrentStartDatesInView,
    recurrentAppointment,
    newAppointment,
  );
}
