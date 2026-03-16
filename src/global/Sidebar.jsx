import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../components/styles/index.css';
import { 
    HomeOutlined, 
    CalendarOutlined, 
    UserOutlined, 
    SettingOutlined, 
    LogoutOutlined, 
    MedicineBoxOutlined, 
    HistoryOutlined,
    AppstoreOutlined
} from '@ant-design/icons';

const Sidebar = ({ isOpen, setIsOpen }) => {
    const { role, user, signOut } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = {
        patient: [
            { icon: <HomeOutlined />, label: 'Tableau de bord', path: '/dashboard' },
            { icon: <CalendarOutlined />, label: 'Mes Rendez-vous', path: '/appointments' },
            { icon: <MedicineBoxOutlined />, label: 'Nos Médecins', path: '/my-doctors' },
            { icon: <HistoryOutlined />, label: 'Historique Médical', path: '/history' },
        ],
        doctor: [
            { icon: <HomeOutlined />, label: 'Tableau de bord', path: '/doctor-dashboard' },
            { icon: <CalendarOutlined />, label: 'Planning', path: '/schedule' },
            { icon: <UserOutlined />, label: 'Mes Patients', path: '/my-patients' },
            { icon: <AppstoreOutlined />, label: 'Consultations', path: '/consultations' },
        ],
        admin: [
            { icon: <HomeOutlined />, label: 'Console Admin', path: '/admin-dashboard?tab=overview' },
            { icon: <UserOutlined />, label: 'Vérification', path: '/admin-dashboard?tab=doctors' },
            { icon: <SettingOutlined />, label: 'Paramètres Système', path: '/admin-dashboard?tab=settings' },
        ]
    };

    const currentMenu = menuItems[role] || menuItems.patient;

    const navLinkStyle = ({ isActive }) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        borderRadius: '12px',
        textDecoration: 'none',
        color: isActive ? 'white' : 'rgba(255,255,255,0.7)',
        background: isActive ? 'var(--primary)' : 'transparent',
        transition: 'all 0.2s ease',
        marginBottom: '4px',
        fontWeight: isActive ? '600' : '400'
    });

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div 
                    className="mobile-only"
                    onClick={() => setIsOpen(false)}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.5)',
                        zIndex: 1050,
                        backdropFilter: 'blur(4px)'
                    }}
                />
            )}

            <aside 
                className={isOpen ? 'sidebar-open' : 'sidebar-closed'}
                style={{ 
                    width: 'var(--sidebar-width)', 
                    height: '100vh', 
                    background: '#0f172a', 
                    color: 'white', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    padding: '24px 16px',
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    zIndex: 1100,
                    boxShadow: '4px 0 24px rgba(0,0,0,0.2)',
                    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: isOpen ? 'translateX(0)' : 'translateX(-100%)'
                }}
            >
                <style>
                    {`
                        @media (min-width: 1025px) {
                            aside { transform: translateX(0) !important; }
                        }
                    `}
                </style>
                <div style={{ padding: '0 16px', marginBottom: '40px' }}>
                    <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', overflow: 'hidden' }}>
                            <img src="/medical-logo.svg" alt="WerguiYaram Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'white', fontFamily: 'Outfit' }}>WerguiYaram</span>
                    </a>
                </div>

                <nav style={{ flex: 1 }}>
                    <div style={{ color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: '700', letterSpacing: '1px', padding: '0 16px 12px' }}>
                        Menu Principal
                    </div>
                    {currentMenu.map((item, idx) => {
                        const isLinkActive = item.path.includes('?') 
                            ? (location.pathname + location.search === item.path)
                            : (location.pathname === item.path);

                        return (
                            <NavLink 
                                key={idx} 
                                to={item.path} 
                                style={() => navLinkStyle({ isActive: isLinkActive })} 
                                onClick={() => setIsOpen(false)}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </NavLink>
                        );
                    })}
                </nav>

                <div style={{ marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <div 
                        onClick={() => {
                            navigate(role === 'admin' ? '/admin-profile' : '/profile');
                            setIsOpen(false);
                        }}
                        style={{ 
                            padding: '12px', 
                            borderRadius: '12px', 
                            background: 'rgba(255,255,255,0.05)', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '12px',
                            marginBottom: '16px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            border: '1px solid transparent'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                            e.currentTarget.style.borderColor = 'transparent';
                        }}
                    >
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>
                            {user?.user_metadata?.full_name?.charAt(0) || 'U'}
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                            <div style={{ fontSize: '14px', fontWeight: '600', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{user?.user_metadata?.full_name}</div>
                            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', textTransform: 'capitalize' }}>{role}</div>
                        </div>
                    </div>

                    <button 
                        onClick={signOut}
                        style={{ 
                            width: '100%', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '12px', 
                            padding: '12px 16px', 
                            borderRadius: '12px', 
                            border: 'none', 
                            background: 'transparent', 
                            color: '#f87171', 
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            fontWeight: '600'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(248, 113, 113, 0.1)'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                        <LogoutOutlined />
                        <span>Déconnexion</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
