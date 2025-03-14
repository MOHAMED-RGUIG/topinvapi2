const express = require("express");
const router = express.Router();
const { sql, poolPromise,poolPromise2 } = require('../db'); 


router.post('/validInvInsert', async (req, res) => {
    let pool;
    try {
        const { currentUser, REFINV_0, ITMREF_0, rows } = req.body;

        // Vérifiez que les données nécessaires sont présentes
        if (!REFINV_0 || !ITMREF_0 ) {
            return res.status(400).json({ message: 'Invalid input data' });
        }

        // Obtenez une connexion au pool
        pool = await poolPromise;

        for (const row of rows) {
            const request = pool.request(); // Nouvelle requête pour chaque itération

            // Liaison des paramètres pour la ligne actuelle
            request.input('REFINV_0', sql.NVarChar(), REFINV_0);
            request.input('ITMREF_0', sql.NVarChar(), ITMREF_0);
            request.input('LOT_0', sql.NVarChar(), row.LOT_0);
            request.input('STOFCY_0', sql.NVarChar(), row.STOFCY_0);
            request.input('QTYINV_0', sql.Int, row.Qt);
            request.input('userID', sql.Int, currentUser.ID);

            // Vérifiez si le LOT_0 existe déjà pour REFINV_0
            const checkQuery = `
                SELECT COUNT(*) AS count 
                FROM TCE.YINMEN 
                WHERE REFINV_0 = @REFINV_0 AND LOT_0 = @LOT_0 AND STOFCY_0 = @STOFCY_0
            `;
            const checkResult = await request.query(checkQuery);

            if (checkResult.recordset[0].count > 0) {
                // Si le lot existe, mettez à jour la ligne correspondante
                const updateQuery = `
                    UPDATE TCE.YINMEN
                    SET QTYINV_0 = QTYINV_0 + @QTYINV_0, [USER] = @userID
                    WHERE REFINV_0 = @REFINV_0 AND LOT_0 = @LOT_0 AND STOFCY_0 = @STOFCY_0
                `;
                await request.query(updateQuery);
            } else {
                // Sinon, insérez une nouvelle ligne
                const insertQuery = `
INSERT INTO TCE.YINMEN (REFINV_0, ITMREF_0, LOT_0, STOFCY_0, QTYINV_0, [USER]) 
                 VALUES (@REFINV_0, @ITMREF_0, @LOT_0, @STOFCY_0, @QTYINV_0, @userID)                `;
                await request.query(insertQuery);
            }
        }

        // Répondre avec succès
        res.status(201).send('Data processed successfully');
    } catch (error) {
        console.error('Error processing data:', error);

        // Retourner une réponse d'erreur
        return res.status(500).json({ message: 'Something went wrong', error: error.message });
    }
});


router.get('/getExistingDataForInv', async (req, res) => {
    const { refInv, itmref } = req.query; // Récupérer `itmref` depuis la requête
    try {
        const pool = await poolPromise;
        const request = pool.request();

        // Ajout des paramètres d'entrée
        request.input('refInv', sql.NVarChar(), refInv);
        request.input('itmref', sql.NVarChar(), itmref);

        // Requête SQL
        const query = `
            SELECT ITMREF_0, LOT_0, STOFCY_0, QTYINV_0,REFINV_0
            FROM TCE.YINMEN
            WHERE REFINV_0 = @refInv AND ITMREF_0 = @itmref
        `;
        
        // Exécution de la requête
        const result = await request.query(query);

        // Retourner les résultats au client
        res.status(200).json(result.recordset);
    } catch (error) {
        console.error("Erreur lors de la récupération des données existantes :", error);
        res.status(500).send("Erreur serveur");
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

        // First query (for stock data)
        const query1 = `
            SELECT ITMREF_0, LOT_0, LOC_0, STOFCY_0, STOCOU_0 
            FROM TCE.STOCK
            WHERE STOFCY_0 = 'SIG' AND ITMREF_0 LIKE '${itmref}%' 
            GROUP BY ITMREF_0, LOT_0, LOC_0, STOFCY_0, STOCOU_0
        `;
        
        // Second query (for item master data)
        const query2 = `
            SELECT TSICOD_0, TSICOD_1, ITMDES1_0 ,EANCOD_0
            FROM TCE.ITMMASTER
            WHERE ITMREF_0 = '${itmref}'
        `;

        // Execute both queries
        const result1 = await request.query(query1);
        const result2 = await request.query(query2);

        // Combine the results in a single response
        res.status(200).json({
            stockData: result1.recordset,
            itemMasterData: result2.recordset
        });
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
