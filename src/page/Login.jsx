import React, { useState, useRef, useEffect } from 'react';
import '../style/login.css'
import { useNavigate } from 'react-router-dom';
import complyn_mgmt_logo from '../assets/complymgmt_logo.png'
import API from '../api/axios'; // your axios instance
import { LOGIN_API } from '../api/Endpoint';
import Snackbars from '../component/Snackbars';
import { useToken } from '../tokenContext';
import { encryptData } from './utils/encrypt';


const Login = ({ setIsAuthenticated, issnackbarsOpen, setIsSnackbarsOpen, setIsChangePassword }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const { setToken } = useToken();
    const formRef = useRef(null);

    useEffect(() => {
        const handleEnter = (e) => {
            if (e.key === 'Enter') {
                formRef.current?.requestSubmit();
            }
        };

        document.addEventListener('keydown', handleEnter);
        return () => document.removeEventListener('keydown', handleEnter);
    }, []);

    // Login handler
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await API.post(LOGIN_API, {
                username,
                password,
            });

            const token = response.data?.token;
            const message = response?.data?.message;

            if (token) {
                const encryptedToken = encryptData(token);
                localStorage.setItem("authToken", encryptedToken);
                // localStorage.setItem('token', token);
                localStorage.setItem('username', response.data?.username);
                localStorage.setItem('user_id', encryptData(response.data?.user_id));
                localStorage.setItem("user_type", encryptData(String(response.data?.user_type)));
                localStorage.setItem('user_role', encryptData(response.data?.user_role));

                setIsChangePassword(response.data?.is_temp_password);
                setToken(token);

                // sessionStorage.setItem('browserSessionActive', 'true'); // <--- add this
                setIsAuthenticated(true);
                navigate('/dashboard');
                localStorage.setItem("activeItem", 'Dashboard');
                localStorage.setItem('active_url', '/dashboard');
                setIsSnackbarsOpen({ ...issnackbarsOpen, open: true, message, severityType: 'success' });
            } else {
                alert('Login failed: Token missing');
                setIsSnackbarsOpen({ ...issnackbarsOpen, open: true, message, severityType: 'error' });
            }
        } catch (error) {
            setIsSnackbarsOpen({
                ...issnackbarsOpen,
                open: true,
                message: error?.response?.data?.message || 'Login failed',
                severityType: 'error'
            });
        }
    };



    return (
        <div className='centered-container ps-3 pe-3 page_bg'>
            <Snackbars issnackbarsOpen={issnackbarsOpen} setIsSnackbarsOpen={setIsSnackbarsOpen} />

            <div className=' mobil_view_login_form_col1_v2 pe-5'>
                <img src={complyn_mgmt_logo} alt="Avatar" className="avatar_v2" />
                <div className='ps-2 pe-2 mt-2'>Command the chaos. Lead with intelligence. Govern with integrity.
                </div>
            </div>
            <div className=''>
                <div className='d-flex justify-content-center pb-3 pt-3 desk_top_hide'>
                    <img src={complyn_mgmt_logo} alt="Avatar" className="avatar_v2 w-75" />
                </div>
                <div className='d-lg-flex d-md-flex login_form_v2'>
                    <div className=''>
                        <form ref={formRef} onSubmit={handleSubmit}>
                            <div className="container login_form_container">
                                <div className='d-flex justify-content-center mb-3 mt-4'>
                                    <img src={complyn_mgmt_logo} alt="Avatar" style={{ width: '50%' }} />
                                </div>
                                <div className='mb-3 login_heading_text'>Log in</div>
                                <label htmlFor="uname">UserName</label>
                                <input
                                    className='input_border_style'
                                    type="text"
                                    // placeholder="Enter Email address"
                                    name="uname"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />

                                <label htmlFor="psw">Password</label>
                                <input
                                    className='input_border_style'
                                    type="password"
                                    // placeholder="Enter Password"
                                    name="psw"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    className='mt-2 mb-2'
                                    style={{ display: 'contents' }}
                                    onClick={() => navigate('forget_password')}
                                >
                                    Forgot password?
                                </button>

                                <button type="submit" className='login_btn_style_v2 mt-2 mb-2'>
                                    <span className='login_btn'>Log in</span>
                                </button>
                                {/* <div className="container" style={{ backgroundColor: '#f1f1f1' }}> */}
                                {/* </div> */}
                                {/* <div className='karma-logon-text_v2'>New to complymgmt?<span className='karma_logo_text_span_v2'> Create account</span></div> */}

                            </div>
                        </form>
                    </div>
                </div>

            </div>

        </div>

    );
};

export default Login;
