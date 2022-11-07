const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000;
const app = express()

// middle wares
app.use(cors())
app.use(express.json())



// apis
app.get('/', (req, res) => {
    res.send('Server is Up and Running')
})





app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})