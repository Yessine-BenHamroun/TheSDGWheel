// EmailJS will handle email sending from the frontend
// This file is kept for potential future server-side email needs

exports.sendVerificationEmail = async (to, token) => {
  // EmailJS handles email sending from frontend
  // This function is kept for compatibility but doesn't send emails
  console.log('EmailJS will handle email sending from frontend');
};

// For message replies, we'll return the email data to be sent via EmailJS on the frontend
exports.sendEmail = async (to, subject, htmlContent) => {
  try {
    console.log('📧 Preparing email data for EmailJS:');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('Content preview:', htmlContent.substring(0, 100) + '...');
    
    // Return email data that can be used by EmailJS on the frontend
    return { 
      success: true, 
      messageId: `emailjs_${Date.now()}`,
      emailData: {
        recipientEmail: to,
        subject: subject,
        htmlContent: htmlContent
      }
    };
  } catch (error) {
    console.error('Email preparation error:', error);
    throw error;
  }
}; 