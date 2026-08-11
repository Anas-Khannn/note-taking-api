class EmailService {
  static async sendPasswordResetEmail({ to, resetToken }) {
    // Email delivery is not configured yet. Provider-specific code
    // (Nodemailer, SendGrid, Amazon SES, ...) belongs here so that switching
    // providers never requires changes to the password reset flow.
  }
}

module.exports = EmailService;
