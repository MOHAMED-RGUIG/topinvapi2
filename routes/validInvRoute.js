const express = require("express");
const router = express.Router();
const { sql, poolPromise,poolPromise2 } = require('../db'); 


router.post('/validInvInsert', async (req, res) => {
    let pool;
    try {
        const { currentUser, REFINV_0, ITMREF_0, rows } = req.body;

        // Vérifiez que les données nécessaires sont présentes
        if (!REFINV_0 || !ITMREF_0 || !rows || rows.length === 0 || !currentUser.ID) {
            return res.status(400).json({ message: 'Aucune ligne à insérer.' });
        }

        // Obtenez une connexion au pool
        pool = await poolPromise;
        
        for (const row of rows) {
            const request = pool.request(); // Create a new request instance for each iteration
            
            // Bind parameters for the current row
            request.input('REFINV_0', sql.NVarChar(), REFINV_0);
            request.input('ITMREF_0', sql.NVarChar(), ITMREF_0);
            request.input('LOT_0', sql.NVarChar(), row.LOT_0);
            request.input('STOFCY_0', sql.NVarChar(), row.STOFCY_0);
            request.input('QTYINV_0', sql.Int, row.Qt);
            request.input('userID', sql.Int, currentUser.ID); // Make sure userID is passed as a parameter

            // Use parameterized query to insert the data
            await request.query(
                `INSERT INTO TCE.YINMEN (REFINV_0, ITMREF_0, LOT_0, STOFCY_0, QTYINV_0, [USER]) 
                 VALUES (@REFINV_0, @ITMREF_0, @LOT_0, @STOFCY_0, @QTYINV_0, @userID)`
            );
        }

        // Répondre avec succès
        res.status(201).send('Order registered successfully');
    } catch (error) {
        console.error('Error placing order:', error);

        // Retourner une réponse d'erreur
        return res.status(500).json({ message: 'Something went wrong', error: error.message });
    }
});


router.get('/getAllValidInvByCode', async (req, res) => {
    let pool;
    try {
        const { eancod } = req.query; // Récupérer le paramètre de requête
        pool = await poolPromise;
        const request = pool.request();

        let query = `
   SELECT S.ITMREF_0, S.LOT_0, S.LOC_0, S.STOFCY_0,S.STOCOU_0,I.EANCOD_0 FROM TCE.STOCK S,TCE.ITMMASTER I
        WHERE S.ITMREF_0 = I.ITMREF_0 AND
        STOFCY_0 = 'SIG' AND  EANCOD_0 LIKE '${eancod}%' 
        GROUP BY S.ITMREF_0, S.LOT_0,S.LOC_0, S.STOFCY_0,S.STOCOU_0,I.EANCOD_0         `;
     
        // Appliquer un filtre si `itmref` est fourni
      
     

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
        console.error('Error getting data:', error);
        return res.status(400).json({ message: 'Something went wrong', error: error.message });
    }
});
router.get('/getAllValidInv', async (req, res) => {
    let pool;
    try {
        const { itmref } = req.query; // Récupérer le paramètre de requête
        pool = await poolPromise;
        const request = pool.request();

        let query = `
            SELECT ITMREF_0, LOT_0, LOC_0, STOFCY_0,STOCOU_0 FROM TCE.STOCK
            WHERE STOFCY_0 = 'SIG' AND ITMREF_0 LIKE '${itmref}%' GROUP BY ITMREF_0, LOT_0, LOC_0, STOFCY_0,STOCOU_0
        `;

        // Appliquer un filtre si `itmref` est fourni
      
     

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
        console.error('Error getting data:', error);
        return res.status(400).json({ message: 'Something went wrong', error: error.message });
    }
});
router.get('/getInv', async (req, res) => {
    let pool;
    try {
        const { itmref } = req.query; // Récupérer le paramètre de requête
        pool = await poolPromise;
        const request = pool.request();

        let query = `
            SELECT * FROM TCE.YLSTINV where ETATINV = 'ouvert'
            
        `;

        // Appliquer un filtre si `itmref` est fourni
      
     

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
        console.error('Error getting data:', error);
        return res.status(400).json({ message: 'Something went wrong', error: error.message });
    }
});


module.exports = router;

