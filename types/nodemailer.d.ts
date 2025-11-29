declare module "nodemailer" {
  interface Transporter {
    sendMail(mailOptions: any): Promise<any>;
  }

  function createTransport(options: any): Transporter;

  export { createTransport };
  export default { createTransport };
}
