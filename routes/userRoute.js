const express = require('express');
const router = express.Router();
const {sql, poolPromise} = require('../db');

/*
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if a user with the provided email already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            // User already exists with the same email
            return res.status(400).send('User already registered with this email');
        }else{
                 const newUser = new User({ name, email, password });
        await newUser.save();

        res.status(201).send('User registered successfully');    
        }

        // Create a new user
   
    } catch (error) {
        // Handle any errors
        res.status(500).json({ message: 'Internal server error' });
    }
});
*/
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const pool = await poolPromise; // Get the pool connection
        const request = pool.request(); // Create a new request from the pool

        // Use parameterized queries to prevent SQL injection
        const query = `SELECT * FROM [topclass_ges].[topclass].[USERS] WHERE EMAILUSR = @Email AND MotDePasse = @Password`;
        request.input('Email', sql.NVarChar, email);
        request.input('Password', sql.NVarChar, password);

        const result = await request.query(query);

        if (result.recordset.length > 0) {
            const user = result.recordset[0];
            const currentUser = {
                EMAILUSR: user.EMAILUSR,
                ID: user.ID,
                NOMUSR: user.NOMUSR,
                TELEP: user.TELEP
            };
            res.send(currentUser);
        } else {
            return res.status(400).json({ message: 'User Login Failed' });
        }
    } catch (error) {
        console.error('Error during login:', error);
        return res.status(400).json({ message: 'Something went wrong', error: error.message });
    }
});

module.exports = router;