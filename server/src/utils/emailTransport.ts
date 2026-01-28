import nodemailer from "nodemailer";


function buildTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  const missing = [host && "host", port && "port", user && "user", pass && "pass"].filter(
    (v) => !v,
  );

  if (missing.length > 0) {
    console.warn(
      `[email] Missing SMTP config (${missing.join(
        ", ",
      )}); using stream transport (emails will be printed, not sent).`,
    );

    return nodemailer.createTransport({
      streamTransport: true,
      newline: "unix",
      buffer: true,
    });
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for other ports
    auth: {
      user,
      pass,
    },
  });
}

const transporter = buildTransport();

export default transporter;
