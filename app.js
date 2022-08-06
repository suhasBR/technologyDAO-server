const express = require("express");
const app = express();
require('dotenv').config();
const cors = require('cors')
const users = require("./routes/user");
const write = require("./routes/write");
const articles = require("./routes/articles");

const connectDB = require("./db/connect");

const port = process.env.PORT || 5000;
// to parse JSON 
app.use(express.json());

app.use(cors());

app.use('/api/v1/users',users);
app.use('/api/v1/write',write);
app.use('/api/v1/articles',articles);

const start = async () => {
    try{
        await connectDB("mongodb+srv://suhasbr:orQApynvmxPTe6u0@projectmvp.iz6x5c1.mongodb.net/technologydao?retryWrites=true&w=majority");
        app.listen(port, () => {
            console.log(`Server is listening to port ${port}`);
        });
    }
    catch(error){
        console.log(error);

    }
}

start();