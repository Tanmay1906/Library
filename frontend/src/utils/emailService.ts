// Import the EmailJS SDK
import { init, send } from "@emailjs/browser";

declare global {
  interface Window {
    emailjs: {
      init: (publicKey: string) => void;
      send: typeof send;
    };
  }
}

/* ------------------------------------------------------------------ */
/*  EmailJS Configuration                                             */
/* ------------------------------------------------------------------ */
const EMAILJS_CONFIG = {
  SERVICE_ID: "service_1vbxw88",
  TEMPLATE_ID: "template_a3eymwb",
  PUBLIC_KEY: "3RGIXMhMCA_2kGitE"
};

// Initialize EmailJS when the module is loaded
let isInitialized = false;

try {
  init(EMAILJS_CONFIG.PUBLIC_KEY);
  isInitialized = true;
  console.log('EmailJS initialized successfully');
} catch (error) {
  console.error('Failed to initialize EmailJS:', error);
  isInitialized = false;
}


/* ------------------------------------------------------------------ */
/*  Send Password Reset Email                                         */
/* ------------------------------------------------------------------ */

export const sendPasswordResetEmail = async (email: string, resetLink: string, tempPassword?: string): Promise<boolean> => {
  try {
    console.log('=== Sending Password Reset Email ===');
    console.log('Recipient:', email);
    console.log('Reset Link:', resetLink);
    
    // Ensure EmailJS is initialized
    if (!isInitialized) {
      console.error('EmailJS not properly initialized');
      return false;
    }
    
    // Generate a temporary password if not provided
    const password = tempPassword || generateTemporaryPassword();
    
    const templateParams = {
      to_email: email,               // The recipient's email
      email: email,                  // Also include as 'email' for compatibility
      reset_link: resetLink,         // The password reset link
      temporaryPassword: password,   // Match the template variable name
      login_url: `${window.location.origin}/login`,
      support_url: `${window.location.origin}/support`,
      year: new Date().getFullYear(),
      // Add any additional parameters your template might expect
      from_name: 'Library Management System',
      to_name: email.split('@')[0],  // Use the part before @ as the name
      reply_to: 'noreply@library.com',
      subject: 'Your Password Reset Request',
      message: `Here is your temporary password: ${password}. Please use it to log in and change your password.`
    };

    console.log('EmailJS Request:', {
      serviceId: EMAILJS_CONFIG.SERVICE_ID,
      templateId: EMAILJS_CONFIG.TEMPLATE_ID,
      publicKey: EMAILJS_CONFIG.PUBLIC_KEY,
      templateParams
    });

    // Use the imported send function directly
    const response = await send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID,
      templateParams,
      EMAILJS_CONFIG.PUBLIC_KEY
    );

    console.log('EmailJS Response:', {
      status: response.status,
      text: response.text,
      statusText: response.statusText,
      headers: response.headers
    });
    
    if (response.status === 200) {
      console.log("✅ Email sent successfully to:", email);
      return true;
    } else {
      console.error("❌ EmailJS returned non-200 status:", response.status, response.text);
      return false;
    }

  } catch (error) {
    console.error("Error sending password reset email:", error);
    return false;
  }
};


/* ------------------------------------------------------------------ */
/*  Temporary Password Generator                                      */
/* ------------------------------------------------------------------ */

export const generateTemporaryPassword = (): string => {
  const length = 10;
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";

  let password = "";
  const values = new Uint32Array(length);

  window.crypto.getRandomValues(values);

  for (let i = 0; i < length; i++) {
    password += charset[values[i] % charset.length];
  }

  return password;
};
