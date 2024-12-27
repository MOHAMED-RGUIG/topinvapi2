const express = require("express");
const router = express.Router();
const { sql, poolPromise,poolPromise2 } = require('../db'); 

router.get('/getallproducts', async (req, res) => {
    let pool;
    try {
        pool = await poolPromise2;
        const request = pool.request();

        const query = `SELECT * FROM  [topclass_sage].[TCE].[YLSTINV]`;

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
router.put('/updateproducts/:REFINV_0', async (req, res) => {
    const { REFINV_0 } = req.params;
    const { ETATINV } = req.body;
  console.log('REFINV_0:', REFINV_0, 'ETATINV:', ETATINV);
    try {

      const pool = await poolPromise2;
  
      const request = pool.request();
        request.input('REFINV_0', sql.Int, REFINV_0)
         request.input('ETATINV', sql.NVarChar, ETATINV)
         await  request.query(`
          UPDATE [topclass_sage].[TCE].[YLSTINV]
          SET ETATINV = @ETATINV
          WHERE REFINV_0 = @REFINV_0
        `);
  
      if (request.rowsAffected[0] > 0) {
        res.json({
          success: true,
          message: 'Product updated successfully',
          updatedProduct: { REFINV_0, ETATINV }, // Renvoie les nouvelles données
        });
      } else {
        res.status(404).json({ success: false, message: 'Product not found' });
      }
    } catch (err) {
console.error('Full SQL Error:', err);
res.status(500).json({ error: err });   
}
  });
  

router.get("/getallimgproducts",async(req,res)=>
{
    try{
            const products = await Product.find({});
            res.send(products);
    } catch(error){
        return res.status(400).json({message: error});
    }   
}
)


module.exports = router;

