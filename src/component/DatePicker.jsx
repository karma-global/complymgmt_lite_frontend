import * as React from 'react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

export default function ResponsiveDatePickers({setSelectedDate, selectedDate}) {
 const handleDateChange = (newValue) => {
    setSelectedDate(newValue);
  };
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        value={selectedDate}
        onChange={handleDateChange}
        sx={{ width: '100%' }}
      />
    </LocalizationProvider>
  );
}
