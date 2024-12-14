import { auth } from './firebaseConfig'; // Import Firebase auth from the config file

// Auth class to handle user authentication
class Auth {
    // Sign up a new user
    static async signUp(email, password) {
        try {
            console.log("Attempting to sign up with:", email);
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            console.log("Signup successful:", userCredential.user);
            return userCredential.user;
        } catch (error) {
            console.error('Detailed Signup Error:', {
                code: error.code,
                message: error.message,
                fullError: error,
            });
            throw error;
        }
    }

    // Sign in an existing user
    static async signIn(email, password) {
        try {
            console.log("Attempting to sign in with:", email);
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            console.log("Login successful:", userCredential.user);
            return userCredential.user;
        } catch (error) {
            console.error('Detailed Login Error:', {
                code: error.code,
                message: error.message,
                fullError: error,
            });
            throw error;
        }
    }
}

// Add global error logging
window.addEventListener('error', (event) => {
    console.error('Uncaught error:', event.error);
});

// Add a comprehensive Firebase initialization check
document.addEventListener('DOMContentLoaded', () => {
    console.log('Firebase initialization check:');
    try {
        if (typeof auth !== 'undefined') {
            console.log('Firebase Auth initialized successfully');
        } else {
            console.error('Firebase Auth not initialized properly');
        }
    } catch (error) {
        console.error('Initialization check error:', error);
    }
});

export default Auth;
