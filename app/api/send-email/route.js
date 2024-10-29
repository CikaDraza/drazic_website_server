// src/app/api/send-email/route.js
import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';

const allowedOrigins = ['http://localhost:5173', 'https://drazic-webdev.dev'];

export async function OPTIONS(request) {
  const origin = request.headers.get('Origin');
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : 'null',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}

export async function POST(request) {
  const origin = request.headers.get('Origin');
  const { fullName, email, phone, city, text } = await request.json();

  console.log(fullName, email, phone, city, text);

  const transporter = nodemailer.createTransport({
    host: 'mail.privateemail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const htmlBody = `
    <html>
      <body>
        <p>Full Name: ${fullName}</p>
        <p>Email: ${email}</p>
        <p>Phone: ${phone}</p>
        <p>City: ${city}</p>
        <p>Message: ${text}</p>
      </body>
    </html>
  `;

  // Email to the user for confirmation
  const userMailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Thank you for reaching out',
    text: 'Thank you for contacting us. We have received your message and will get back to you soon.',
    html: `<p>Thank you, ${fullName}! We will reach out soon.</p>`,
  };

  // Email to the business
  const businessMailOptions = {
    from: email,
    to: process.env.BUSINESS_EMAIL,  // replace with the business email
    subject: `New message from ${fullName}`,
    replyTo: email,
    html: htmlBody,
  };

  try {
    // Send confirmation email to the user
    await transporter.sendMail(userMailOptions);
    console.log('Confirmation email sent to user');

    // Send email to the business
    await transporter.sendMail(businessMailOptions);
    console.log('Notification email sent to business');

    return new NextResponse(
      JSON.stringify({ message: 'Message received and emails sent successfully.' }),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : 'null',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400',
        }
      }
    );
    
  } catch (error) {
    console.error('Error sending email:', error);
    return new NextResponse(
      JSON.stringify({ message: 'Error sending email' }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : 'null',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400',
        }
      }
    );
  }
}