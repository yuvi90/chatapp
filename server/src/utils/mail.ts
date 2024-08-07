import nodemailer from "nodemailer";
import Mailgen from "mailgen";
import config from "../config/index.js";

/**
 *
 * @param {{email: string; subject: string; mailgenContent: Mailgen.Content; }} options
 *
 */
type Options = {
  email: string;
  subject: string;
  mailgenContent: Mailgen.Content;
};

async function sendEmail(options: Options) {
  // Initialize mailgen instance with default theme and brand configuration
  const mailGenerator = new Mailgen({
    theme: "default",
    product: {
      name: "ChatApp",
      link: "https://chat.app",
    },
  });

  const emailBody = mailGenerator.generate(options.mailgenContent);
  const emailText = mailGenerator.generatePlaintext(options.mailgenContent);

  const transporter = nodemailer.createTransport({
    host: config.mailService.host,
    port: config.mailService.port,
    secure: config.mailService.secure,
    auth: {
      user: config.mailService.auth.user,
      pass: config.mailService.auth.pass,
    },
  });

  const info: nodemailer.SendMailOptions = {
    from: `"Support" <${config.mailService.auth.user}>`,
    to: options.email,
    subject: options.subject,
    text: emailText,
    html: emailBody,
  };

  try {
    // As sending email is not strongly coupled to the business logic it is not worth to raise an error when email sending fails
    // So it's better to fail silently rather than breaking the app
    await transporter.sendMail(info);
  } catch (error) {
    console.log(error);
  }
}

/**
 *
 * @param {string} username
 * @param {string} verificationUrl
 * @returns {Mailgen.Content}
 * @description It designs the email verification mail
 */
type EmailVerificationOptions = {
  username: string;
  verificationUrl: string;
};
const emailVerificationMailgenContent = ({
  username,
  verificationUrl,
}: EmailVerificationOptions) => {
  return {
    body: {
      name: username,
      intro: "Welcome to our app! We're very excited to have you on board.",
      action: {
        instructions:
          "To verify your email please click on the following button:",
        button: {
          color: "#22BC66", // Optional action button color
          text: "Verify your email",
          link: verificationUrl,
        },
      },
      outro:
        "Need help, or have questions? Just reply to this email, we'd love to help.",
    },
  };
};

/**
 *
 * @param {string} username
 * @param {string} verificationUrl
 * @returns {Mailgen.Content}
 * @description It designs the forgot password mail
 */
type ForgotPasswordOptions = {
  username: string;
  passwordResetUrl: string;
};
const forgotPasswordMailgenContent = ({
  username,
  passwordResetUrl,
}: ForgotPasswordOptions) => {
  return {
    body: {
      name: username,
      intro: "We got a request to reset the password of our account",
      action: {
        instructions:
          "To reset your password click on the following button or link:",
        button: {
          color: "#22BC66", // Optional action button color
          text: "Reset password",
          link: passwordResetUrl,
        },
      },
      outro:
        "Need help, or have questions? Just reply to this email, we'd love to help.",
    },
  };
};

export {
  sendEmail,
  emailVerificationMailgenContent,
  forgotPasswordMailgenContent,
};
