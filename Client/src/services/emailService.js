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