// Application http request adress: http://localhost:5024/
// import { faker } from '@faker-js/faker';
const { faker } = require('@faker-js/faker');
const express =  require('express');
const cors = require('cors');
// Create an instance of the express application
const app = express();
app.use(cors());
// Specify a port number for the server
const port = 5024;
// Start the server and listen to the port
module.exports = app.listen(port, () => {
  console.log(`Backend server is running on port ${port}`);
});

app.use(express.json());

require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const mysql = require('mysql');
const connection = mysql.createConnection({
  host: '34.154.188.241',
  user: 'root',
  password: 'carmanagement',
  database: 'cardealership'
})

connection.connect();

function insertCarIntoDatabase(car, userName){
    stringQuerry = `INSERT INTO cars (dealershipId, name, price, year, userName) VALUES ( ${car.dealershipId}, "${car.name}", ${car.price}
        , ${car.year}, '${userName}')`;

    return new Promise((resolve, reject) => {
        connection.query(stringQuerry, (err) => {
            if (err){
                reject(err);
            }
            resolve();
        })
    })
}

function insertDealershipIntoDatabase(dealership){
    stringQuerry = `INSERT INTO dealerships (name, adress) VALUES ( "${dealership.name}", "${dealership.adress}")`;
    
    return new Promise((resolve, reject) => {
        connection.query(stringQuerry, (err) => {
            if (err){
                reject(err);
            }
            resolve();
        })
    })
}

function updateCarIntoDatabase(car){
    stringQuerry = `UPDATE cars SET dealershipId = ${car.dealershipId}, name = "${car.name}", price = ${car.price}, year = ${car.year} WHERE id = ${car.id}`;
    
    return new Promise((resolve, reject) => {
        connection.query(stringQuerry, (err) => {
            if (err){
                reject(err);
            }
            resolve();
        })
    })
}

function updateDealershipIntoDatabase(dealership){
    stringQuerry = `UPDATE dealerships SET name = "${dealership.name}", adress = "${dealership.adress}" WHERE id = ${dealership.id}`;
    
    return new Promise((resolve, reject) => {
        connection.query(stringQuerry, (err) => {
            if (err){
                reject(err);
            }
            resolve();
        })
    })
}

function deleteCarFromDatabase(car){
    stringQuerry = `DELETE FROM cars WHERE id = ${car.id}`;
    
    return new Promise((resolve, reject) => {
        connection.query(stringQuerry, (err) => {
            if (err){
                reject(err);
            }
            resolve();
        })
    })
}

function deleteDealershipFromDatabase(dealership){
    stringQuerry = `DELETE FROM dealerships WHERE id = ${dealership.id}`;
    
    return new Promise((resolve, reject) => {
        connection.query(stringQuerry, (err) => {
            if (err){
                reject(err);
            }
            resolve();
        })
    })
}

function createUserInDatabase(newUser){
    const stringQuery = `INSERT INTO user VALUES ('${newUser.name}', '${newUser.password}', '${newUser.accessToken}')`;

    return new Promise((resolve, reject) => {
        connection.query(stringQuery, (err) => {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    });
}

function getUserByName(name) {
    const stringQuery = `SELECT * FROM user Where Name = '${name}'`;
    
    return new Promise((resolve, reject) => {
        connection.query(stringQuery, (err, rows) => {
            if (err) {
                return reject(err);
            }
            resolve(rows[0]);
        });
    });
}

function getAllCars(userName){
    let result = []
    let stringQuerry =`SELECT * FROM cars WHERE userName = '${userName}'`;

    return new Promise((resolve, reject) => {
        connection.query(stringQuerry, (err, rows) => {
            if (err){
                reject(err);
            }
            for (let i = 0; i < rows.length; i++){
                result.push(rows[i]);
            }
            resolve(result);
        })
    })
}

function getAllDealerships(){
    let result = []
    let stringQuerry ="select * from dealerships";
   
    return new Promise((resolve, reject) => {
        connection.query(stringQuerry, (err, rows) => {
            if (err){
                reject(err);
            }
            for (let i = 0; i < rows.length; i++){
                result.push(rows[i]);
            }
            resolve(result);
        })
    })
}

function authenticateToken(req, res, next){
    const authHeader = req.headers['authorization']; // Bearer Token
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null)
        return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err)
            return res.sendStatus(403);

        req.user = user;
        next();
    });
}

app.get('/', (req,res) => {
    res.json("fafda")
})

app.get('/cars', authenticateToken ,async (req, res) => {
    // Send the posts array as a JSON response
    console.log('request get');
    res.set({
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
    });

    await getAllCars(req.user.name)
        .then(cars => res.status(200).json(cars))
        .catch(err => {res.status(500).send({error: 'Database connection down!'})})
});

app.get('/dealerships', authenticateToken, async (req, res) => {
    res.set({
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
    });

    await getAllDealerships()
        .then(dealerships => res.status(200).json(dealerships))
        .catch((err) => {res.status(500).send({error: 'Database connection down!'})})
});

app.post('/car/add', authenticateToken, async (req, res) =>{
    const car = req.body.data;

    if (car.name && car.year && car.price && car.dealershipId){ 
        await insertCarIntoDatabase(car, req.user.name)
            .then(res.status(200).json(car))
            .catch(err => {res.status(500).send({error: err.message})})
    }
    else
        res.status(400).send({error: 'invalid data'});
});

app.post('/dealership/add', authenticateToken, async(req, res) =>{
    const dealership = req.body.data;


    if (dealership.name && dealership.adress){
        await insertDealershipIntoDatabase(dealership)
            .then(res.status(200).json(dealership))
            .catch((err) => {res.status(500).send({error: err.message})})
    }
    else
        res.status(400).send({error: 'invalid data'});
});

app.post('/car/edit', authenticateToken, async (req, res) => {
    const car = req.body.data;

    if (car.name && car.year && car.price && car.dealershipId){     
            await updateCarIntoDatabase(car)
                .then(res.status(200).json(car))
                .catch(err => {res.status(500).send({error: err.message})})
    }
    else
        res.status(404).send({error: 'invalid data'});
});

app.post('/dealership/edit', authenticateToken, async (req, res) => {
    const dealership = req.body.data;

    if (dealership.name && dealership.adress){
        await updateDealershipIntoDatabase(dealership)
            .then(res.status(200).json(dealership))
            .catch(err => {res.status(500).send({error: err.message})})
    }
    else
        res.status(404).send({error: 'invalid data'});
});

app.delete('/car/delete', authenticateToken, async (req, res) =>{
    const car = req.body;

    if (car.name && car.price && car.year){
        await deleteCarFromDatabase(car)
            .then(res.status(200).json(car))
            .catch((err) => {res.status(400).send({error: err.message})})
    }
    else
        res.status(404).send({error: 'invalid data'});
});

app.delete('/dealership/delete', async (req, res) =>{
    const dealership = req.body;

    if (dealership.name && dealership.adress){
        
        await deleteDealershipFromDatabase(dealership)
            .then(res.status(200).json(dealership))
            .catch((err) => {res.status(500).send({error: err.message})})
    }
    else
        res.status(404).send({error: 'invalid data'});
});

  app.post('/register', async (req, res) => {
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(req.body.password, salt);


        const tokenUser = {name : req.body.name};
        const accessToken = jwt.sign(tokenUser, process.env.ACCESS_TOKEN_SECRET);

        const newUser = {name: req.body.name, password: hashedPassword, accessToken: accessToken};

        try {
            await createUserInDatabase(newUser)
                .then()
                .catch(err => {throw err;})

            res.status(200).send()
        }
        catch (err){
            res.status(500).send({error: err});
        }
    }
   
  );

  app.post('/login', async (req, res) => {
    try {
        let _user;
        await getUserByName(req.body.name)
            .then((user) => {_user = user;})
            .catch(err => {throw err})

        if (await bcrypt.compare(req.body.password, _user.Password)){
            // User Authentificated

            res.status(200).json({accessToken: _user.AccessToken});
        }
        else {
            res.status(401).send({error: 'Invalid Password'});
        }
    }
    catch (err){
        res.status(500).send({error: err.message});
    }
  });

module.exports = app;