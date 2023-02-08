import { useCallback, useState } from 'react';
import Scheduler from 'devextreme-react/scheduler';
import { Popup, Position, ToolbarItem } from 'devextreme-react/popup';
import { isOverlapRecurrentAppointment } from './utils/isOverlapRecurrentAppointment';
import { defaultData } from './data.js';
import 'devextreme/dist/css/dx.common.css';
import 'devextreme/dist/css/dx.material.blue.light.css';
import './App.css';

const App = () => {
    const [popupVisible, setPopupVisible] = useState(false);
    const [data] = useState(defaultData);

    const hideInfo = () => {
        setPopupVisible(false);
    }

    const closeButtonOptions = {
        text: 'Close',
        onClick: hideInfo,
    };

    const handleAppointmentActions = useCallback((event, newAppointment) => {
        const recurrentAppointments = data.filter((appointment) => appointment?.recurrenceRule)
            .map((appointment) => ({
                ...appointment,
                startDate: new Date(appointment.startDate),
                endDate: new Date(appointment.endDate),
            }));
        for (const recurrentAppointment of recurrentAppointments) {
            const isOverlap = isOverlapRecurrentAppointment(event, recurrentAppointment, newAppointment);
            if (isOverlap) {
                event.cancel = true;
                setPopupVisible(true)
            }
        }
    }, [data]);
    const handleAppointmentAdding = useCallback((event) => {
        handleAppointmentActions(event, event.appointmentData);
    }, [handleAppointmentActions]);
    const handleAppointmentUpdating = useCallback((event) => {
        handleAppointmentActions(event, event.newData);
    }, [handleAppointmentActions]);

    return (
        <>
            <Popup
                visible={popupVisible}
                onHiding={hideInfo}
                dragEnabled={false}
                hideOnOutsideClick={true}
                showCloseButton={false}
                showTitle={true}
                title='Information'
                container='.dx-viewport'
                width={280}
                height={150}
            >
                <Position
                    at='center'
                    my='center'
                />
                <ToolbarItem
                    widget='dxButton'
                    toolbar='bottom'
                    location='after'
                    options={closeButtonOptions}
                />
                <p>There is a recurrent appointment in this cell.</p>
            </Popup>
            <Scheduler
                dataSource={data}
                views={[{
                    type: 'week'
                }]}
                firstDayOfWeek={0}
                defaultCurrentView='week'
                defaultCurrentDate={new Date(2020, 10, 25)}
                startDayHour={9}
                width='100%'
                height='100%'
                onAppointmentAdding={handleAppointmentAdding}
                onAppointmentUpdating={handleAppointmentUpdating}
            />
        </>
    );
}

export default App;
