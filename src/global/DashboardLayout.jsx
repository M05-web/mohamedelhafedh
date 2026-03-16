import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { 
    MenuOutlined
} from '@ant-design/icons';

const DashboardLayout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9' }}>
            {/* Mobile Top Bar */}
            <div className="mobile-only" style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                height: 'var(--header-height)',
                background: '#0f172a',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 20px',
                zIndex: 1000,
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}>
                {/* Left: Hamburger */}
                <button 
                    onClick={() => setIsSidebarOpen(true)}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'white',
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '40px'
                    }}
                >
                    <span style={{ display: 'flex' }}><MenuOutlined /></span>
                </button>

                {/* Center: Logo */}
                <div style={{ 
                    position: 'absolute',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px' 
                }}>
                    <img src="/medical-logo.svg" alt="Logo" style={{ width: '32px', height: '32px', borderRadius: '8px' }} />
                    <span style={{ fontWeight: '800', fontFamily: 'Outfit', fontSize: '1.2rem' }}>WerguiYaram</span>
                </div>

                {/* Right: Empty space to keep logo centered */}
                <div style={{ width: '40px' }} />
            </div>

            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            
            <main style={{ 
                flex: 1, 
                marginLeft: 'var(--sidebar-width)', 
                padding: '32px',
                transition: 'all 0.3s ease',
                marginTop: 0
            }}>
                <style>
                    {`
                        @media (max-width: 1024px) {
                            main { 
                                margin-left: 0 !important; 
                                padding-top: calc(var(--header-height) + 20px) !important;
                                padding-left: 16px !important;
                                padding-right: 16px !important;
                                padding-bottom: 32px !important;
                            }
                            .sidebar-desktop { display: none !important; }
                        }
                    `}
                </style>
                <div className="container" style={{ maxWidth: '1400px', margin: '0 auto' }}>
                    {children}
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
