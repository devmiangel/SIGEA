import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import './calendario.css'

export default function OtherCalendar({ placeholder, value, onChange }) {
  return (
    <div className="calendar-wrapper">
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker 
            value={value}
            onChange={onChange}
            slotProps={{
              textField: {
                placeholder: placeholder,
                fullWidth: true,
                size: 'small',
                sx: {
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '6px',
                    '& fieldset': { borderColor: '#015d3b' },
                    '&:hover fieldset': { borderColor: '#015d3b' },
                    '&.Mui-focused fieldset': { borderColor: '#015d3b' },
                    '&.Mui-focused': { boxShadow: '0 0 0 3px rgba(1, 93, 59, 0.25)' },
                  },
                  '& .MuiOutlinedInput-input': {
                    fontSize: '14px',
                    padding: '12px 14px',
                    '&::placeholder': { color: '#9ca3af', opacity: 1 },
                  }
                }
              }
            }}
          />
        </LocalizationProvider>
    </div>
  );
}