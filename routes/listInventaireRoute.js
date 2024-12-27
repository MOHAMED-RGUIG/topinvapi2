const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../db');

router.post('/listInventaire', async (req, res) => {
    let pool;
    try {
        const {currentUser, DATEINV, DESINV,ETATINV } = req.body;

        // Vérifiez que les données nécessaires sont présentes
        if (!DATEINV || !DESINV || !ETATINV ||!currentUser.ID) {
            return res.status(400).json({ message: 'DATEINV and DESINV are required' });
        }

        // Obtenez une connexion au pool
        pool = await poolPromise;
        const request = pool.request();

        // Préparer les paramètres
        request.input('DATEINV', sql.Date, DATEINV);
        request.input('DESINV', sql.NVarChar(255), DESINV);
        request.input('ETATINV', sql.NVarChar(10), ETATINV);
        
        request.input('userID', sql.Int, currentUser.ID); // Ajustez la taille selon vos besoins

        // Requête SQL avec les types appropriés pour les colonnes
        const query = `
            INSERT INTO TCE.YLSTINV 
            (DATEINV_0, DESINV_0, [USER],ETATINV)
            VALUES (@DATEINV,@DESINV,@userID,@ETATINV)
        `;

        // Exécuter la requête
        await request.query(query);

        // Répondre avec succès
        res.status(201).send('Order registered successfully');
    } catch (error) {
        console.error('Error placing order:', error);

        // Retourner une réponse d'erreur
        return res.status(500).json({ message: 'Something went wrong', error: error.message });
    } 
});

router.post('/getuserorders', async (req, res) => {
    let pool;
    try {
        const { currentUser } = req.body;

        if (!currentUser || !currentUser.ID) {
            return res.status(400).json({ message: 'User ID is missing or undefined' });
        }

        pool = await poolPromise;
        const request = pool.request();

        request.input('userid', sql.Int, currentUser.ID);

        const query = `
            SELECT * FROM topclass.SORDER WHERE [USER] = @userid
        `;

        const result = await request.query(query);

        res.status(200).json(result.recordset);
    } catch (error) {
        if (pool) {
            try {
                await pool.close();
            } catch (e) {
                console.error('Error closing MSSQL pool', e);
            }
        }
        console.error('Error getting user orders:', error);
        return res.status(400).json({ message: 'Something went wrong', error: error.message });
    }
});


module.exports = router;
