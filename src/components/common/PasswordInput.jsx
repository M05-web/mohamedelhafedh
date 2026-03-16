import React, { useState } from 'react';
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';

const PasswordInput = ({ value, onChange, placeholder, required, style = {} }) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div style={{ position: 'relative', width: '100%', ...style }}>
            <input
                type={showPassword ? "text" : "password"}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                required={required}
                style={{ paddingRight: '50px', width: '100%' }}
            />
            <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                    position: 'absolute',
                    right: '15px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'rgba(255, 255, 255, 0.4)',
                    cursor: 'pointer',
                    padding: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: '-0.75rem', // Offset the margin-bottom of the input
                    transition: 'color 0.3s ease',
                    boxShadow: 'none',
                    width: 'auto',
                    height: 'auto'
                }}
                onMouseOver={(e) => e.currentTarget.style.color = 'white'}
                onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.4)'}
            >
                {showPassword ? <EyeInvisibleOutlined style={{ fontSize: '18px' }} /> : <EyeOutlined style={{ fontSize: '18px' }} />}
            </button>
        </div>
    );
};

export default PasswordInput;
