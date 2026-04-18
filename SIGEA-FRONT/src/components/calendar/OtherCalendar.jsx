import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import './calendario.css'

export default function OtherCalendar({ placeholder, value, onChange }) {
  return (
    <div className="calendar-wrapper">
        <LocalizationProvider dateAdapter={AdapterDayjs} className="calendar">
          <DatePicker 
            value={value}
            onChange={onChange}
            slotProps={{
              textField: {
                placeholder: placeholder,
                fullWidth: true,
                size: 'small',
                sx: {
                  '& .MuiInputBase-input': {
                    fontSize: '12px',
                    padding:'13px'
                  }
                }
              }
            }}
          />
        </LocalizationProvider>
    </div>
  );
}