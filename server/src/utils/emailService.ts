import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// Create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    // Use environment variables or fallback to Ethereal/Console for dev
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER || 'ethereal_user',
        pass: process.env.SMTP_PASS || 'ethereal_pass',
    },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
    try {
        const info = await transporter.sendMail({
            from: process.env.FROM_EMAIL || '"Staffly HR" <no-reply@staffly.com>', // sender address
            to,
            subject,
            html,
        });

        console.log("Message sent: %s", info.messageId);
        // Preview only available when sending through an Ethereal account
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        return info;
    } catch (error) {
        console.error("Error sending email:", error);
        // Don't throw error to prevent blocking main flow, just log it
        return null;
    }
};

export const emailTemplates = {
    welcome: (name: string, email: string, role: string) => `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h1 style="color: #4F46E5;">Welcome to Staffly!</h1>
            <p>Hi ${name},</p>
            <p>Your account has been created successfully. You can now log in to the Staffly HR portal.</p>
            <p><strong>Username:</strong> ${email}</p>
            <p><strong>Role:</strong> ${role}</p>
            <br>
            <p>Please contact your administrator if you have any issues accessing your account.</p>
            <br>
            <p>Best regards,</p>
            <p>The Staffly Team</p>
        </div>
    `,
    leaveStatusUpdate: (name: string, type: string, status: string) => `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h1 style="color: #4F46E5;">Leave Request Update</h1>
            <p>Hi ${name},</p>
            <p>Your request for <strong>${type} leave</strong> has been <strong>${status.toUpperCase()}</strong>.</p>
            <br>
            <p>You can check the details in your dashboard.</p>
            <br>
            <p>Best regards,</p>
            <p>The Staffly Team</p>
        </div>
    `,
    newLeaveRequest: (adminName: string, employeeName: string, type: string, reason: string) => `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h1 style="color: #4F46E5;">New Leave Request</h1>
            <p>Hi ${adminName || 'Admin'},</p>
            <p><strong>${employeeName}</strong> has requested <strong>${type} leave</strong>.</p>
            <p><strong>Reason:</strong> ${reason}</p>
            <br>
            <p>Please review the request in the dashboard.</p>
            <br>
            <p>Best regards,</p>
            <p>The Staffly System</p>
        </div>
    `,
    welcomeEmployee: (name: string, email: string, password: string, role: string) => `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h1 style="color: #4F46E5;">Welcome to Staffly!</h1>
            <p>Hi ${name},</p>
            <p>Your employee account has been created successfully.</p>
            <p><strong>Username:</strong> ${email}</p>
            <p><strong>Password:</strong> ${password}</p>
            <p><strong>Role:</strong> ${role}</p>
            <br>
            <p>Please log in and change your password if needed.</p>
            <br>
            <p>Best regards,</p>
            <p>The Staffly Team</p>
        </div>
    `,
    payrollGenerated: (name: string, month: string, netPay: number, status: string) => `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h1 style="color: #4F46E5;">Payroll Generated</h1>
            <p>Hi ${name},</p>
            <p>Your payroll for the month of <strong>${month}</strong> has been generated.</p>
            <p><strong>Net Pay:</strong> $${netPay}</p>
            <p><strong>Status:</strong> ${status.toUpperCase()}</p>
            <br>
            <p>You can view the detailed payslip in your dashboard.</p>
            <br>
            <p>Best regards,</p>
            <p>The Staffly Team</p>
        </div>
    `
};
