// import React, { useState } from 'react';
// import LoginForm from './LoginForm';
// import RegisterForm from './RegisterForm';
// import { useLocation } from 'react-router-dom';
// import styles from './loginStyles.module.css'
// const AuthPage = () => {
//     const [isRegistering, setIsRegistering] = useState(false);
//     const location = useLocation();
//     const queryParams = new URLSearchParams(location.search);
//     const title = queryParams.get('pageTitle');  // Access the 'pageTitle' query parameter

//     return (
//         <div className={styles.container}>
//             <h1 className={styles.registerLogin}>{isRegistering ? 'Register' : 'Login'}</h1>
//             {isRegistering ? <RegisterForm title={title} /> : <LoginForm title={title} />}

//             <button className={styles.registerToggle} onClick={() => setIsRegistering(!isRegistering)}>
//                 {isRegistering ? 'Already have an account? Login' : "Don't have an account? Register"}
//             </button>

//         </div>
//     );
// };

// export default AuthPage;
