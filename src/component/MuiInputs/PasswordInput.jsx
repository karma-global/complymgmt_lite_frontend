import * as React from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText'; // ✅ Import this
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

export default function PasswordInput({
    label,
    isRequired,
    handleChange,
    value,
    name,
    error,
    helperText
}) {
    const [showPassword, setShowPassword] = React.useState(false);

    const handleClickShowPassword = () => setShowPassword(show => !show);

    const handleMouseDownPassword = (event) => event.preventDefault();
    const handleMouseUpPassword = (event) => event.preventDefault();

    return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', width: '100%' }}>
            <FormControl sx={{ width: '100%' }} variant="outlined" error={error}>
                <InputLabel htmlFor="outlined-adornment-password">{label}</InputLabel>
                <OutlinedInput
                    id="outlined-adornment-password"
                    type={showPassword ? 'text' : 'password'}
                    value={value}
                    required={isRequired}
                    name={name}
                    onChange={handleChange}
                    // className='mb-3'
                    endAdornment={
                        <InputAdornment position="end">
                            <IconButton
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                onClick={handleClickShowPassword}
                                onMouseDown={handleMouseDownPassword}
                                onMouseUp={handleMouseUpPassword}
                                edge="end"
                            >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        </InputAdornment>
                    }
                    label={label}
                />
                {/* ✅ This shows helper text or error message */}
                {helperText && (
                    <FormHelperText>{helperText}</FormHelperText>
                )}
            </FormControl>
        </Box>
    );
}
