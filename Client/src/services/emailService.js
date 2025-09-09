import emailjs from '@emailjs/browser';

// Initialize EmailJS with your public key
emailjs.init('NsnWWTJOjLjIvj5lw');

export const sendVerificationEmail = async (to, token) => {
  const verificationUrl = `${window.location.origin}/verify/${token}`;
  
  console.log('Sending verification email:')
  console.log('- To:', to)
  console.log('- Token:', token)
  console.log('- Verification URL:', verificationUrl)
  
  try {
    const response = await emailjs.send(
      'theSDGWheel',
      'template_2f06614',
      {
        to_email: to,
        to_name: to.split('@')[0], // Use the part before @ as name
        verification_url: verificationUrl,
        website_link: verificationUrl, // For the button link
        company_email: 'support@sdgwheel.com', // Replace with your actual support email
        message: `Welcome to The SDG Wheel! Click the button below to verify your email and activate your account: ${verificationUrl}`
      },
      'NsnWWTJOjLjIvj5lw'
    );
    
    console.log('Email sent successfully:', response);
    return { success: true };
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};

export const sendPasswordResetEmail = async (to, resetToken, userName) => {
  console.log('Sending password reset email:')
  console.log('- To:', to)
  console.log('- Reset Token:', resetToken)
  console.log('- User Name:', userName)
  
  try {
    const resetLink = `${window.location.origin}/reset-password/${resetToken}`;
    
    // Use the dedicated password reset template
    const response = await emailjs.send(
      'theSDGWheel',
      'template_mf2fm3a', // Your new password reset template
      {
        to_email: to,
        to_name: userName,
        reset_page_url: resetLink,
        company_email: 'support@sdgwheel.com',
        link: resetLink, // Main reset link variable
        expiry_time: 'one hour'
      },
      'NsnWWTJOjLjIvj5lw'
    );
    
    console.log('Password reset email sent successfully with dedicated template:', response);
    return { success: true };
    
  } catch (error) {
    console.error('Password reset email sending failed:', error);
    
    // Fallback to the old verification template if the new one fails
    try {
      console.log('Trying fallback with verification template...');
      
      const resetLink = `${window.location.origin}/reset-password/${resetToken}`;
      
      const response = await emailjs.send(
        'theSDGWheel',
        'template_2f06614', // Fallback to verification template
        {
          to_email: to,
          to_name: userName,
          verification_url: resetLink,
          website_link: resetLink,
          company_email: 'support@sdgwheel.com',
          message: `You have requested a password change

We received a request to reset the password for your account. To proceed, please click the link below to create a new password:

${resetLink}

This link will expire in one hour.

If you didn't request this password reset, please ignore this email or let us know immediately. Your account remains secure.

Best regards,
The SDG Wheel Team`
        },
        'NsnWWTJOjLjIvj5lw'
      );
      
      console.log('Fallback password reset email sent:', response);
      return { success: true };
      
    } catch (altError) {
      console.error('All email sending attempts failed:', altError);
      throw new Error('Failed to send password reset email. Please try again or contact support.');
    }
  }
}; 