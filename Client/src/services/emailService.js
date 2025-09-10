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

export const sendMessageReply = async (recipientEmail, recipientName, subject, originalMessage, replyMessage) => {
  console.log('Sending message reply via EmailJS:');
  console.log('- To:', recipientEmail);
  console.log('- Subject:', subject);
  
  try {
    const response = await emailjs.send(
      'theSDGWheel', // Your EmailJS service ID
      'template_reply', // You'll need to create this template in EmailJS
      {
        to_email: recipientEmail,
        to_name: recipientName,
        subject: subject,
        original_message: originalMessage,
        reply_message: replyMessage,
        company_email: 'support@sdgwheel.com',
        website_url: window.location.origin
      },
      'NsnWWTJOjLjIvj5lw' // Your EmailJS public key
    );
    
    console.log('Reply email sent successfully:', response);
    return { success: true };
    
  } catch (error) {
    console.error('Failed to send reply email:', error);
    
    // Fallback with a simpler template if the specific reply template doesn't exist
    try {
      const fallbackResponse = await emailjs.send(
        'theSDGWheel',
        'template_2f06614', // Using the verification template as fallback
        {
          to_email: recipientEmail,
          to_name: recipientName,
          message: `Subject: ${subject}\n\nHello ${recipientName},\n\nThank you for contacting The SDG Wheel. Here is our response to your message:\n\nYour Original Message:\n"${originalMessage}"\n\nOur Response:\n${replyMessage}\n\nIf you have any further questions, please don't hesitate to contact us again.\n\nBest regards,\nThe SDG Wheel Team`,
          company_email: 'support@sdgwheel.com',
          website_link: window.location.origin
        },
        'NsnWWTJOjLjIvj5lw'
      );
      
      console.log('Fallback reply email sent:', fallbackResponse);
      return { success: true };
      
    } catch (fallbackError) {
      console.error('All reply email attempts failed:', fallbackError);
      throw new Error('Failed to send reply email. Please try again or contact support.');
    }
  }
}; 