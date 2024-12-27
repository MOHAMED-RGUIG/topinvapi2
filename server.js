require("dotenv").config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');


const db = require("./db");
const app = express();

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({
    origin:["http://localhost:3000"],
    methods:["POST","GET","PUT"],
    credentials:true
    }));

const productsRoute = require('./routes/productsRoute');
const userRoute = require('./routes/userRoute');
const inventaireRoute = require('./routes/listInventaireRoute');
const validinvRoute = require('./routes/validInvRoute');
const getinvRoute = require('./routes/validInvRoute');
const validInvInsertRoute = require('./routes/validInvRoute');
const validInvCodetRoute = require('./routes/validInvRoute');
const getDataValInv = require('./routes/getdatavalinv');


app.use('/api/validinv/', validInvCodetRoute);
app.use('/api/validinv/', getinvRoute);
app.use('/api/validinv/', validinvRoute);
app.use('/api/products/', productsRoute);
app.use('/api/users/', userRoute);
app.use('/api/inventaire/', inventaireRoute);
app.use('/api/getvaliddata/', getDataValInv);

// Endpoint to send email
app.post('/send-email', (req, res) => {
    console.log('Request received:', req.body);
    const { email, subject, text, pdfData } = req.body;

    // Decode the base64 PDF data
    const pdfBuffer = Buffer.from(pdfData, 'base64');

    // Create a Nodemailer transporter using your email provider's SMTP settings
    let transporter = nodemailer.createTransport({
        host: process.env.SMTPHOST,
        port: process.env.SMTPPORT,
        secure: true, // true for 465, false for other ports
        auth: {
            user: process.env.SMTPUSER,
            pass: process.env.SMTPPASS,
        },
    });

    // Setup email data
    let mailOptions = {
        from: process.env.SMTPUSER,
        to: email.join(', '),
        subject: subject,
        text: text,
        attachments: [
            {
                filename: 'order.pdf',
                content: pdfBuffer,
                contentType: 'application/pdf',
            },
        ],
    };

    // Send email
     transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return res.status(500).json({ error: error.toString() });
        }
        res.status(200).json({ message: 'Email sent', info: info.response });
    });
});

app.get("/", async (req, res) => {
    res.send("Server working!!!");
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
