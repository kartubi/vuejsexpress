import express from 'express'
// TODO change database?
import {Database} from "sqlite3"

var bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.urlencoded({extended: false}));
const db = new Database('database.db')

app.use(express.json())
app.use(express.static('public'))

// TODO how do you debug typescript code?
app.listen(8000, () => {
    console.log('App is running')
})

// TODO split to separate module
// TODO what's the bug in this method and how to fix it?

app.get('/check', (req, res) => {
    const sql = "SELECT * from sqlite_master where name = 'users'";
    db.all(sql, (err: any, data: any) => {
        let arr = data;
        arr = arr.length;

        let baseResponse = {
            'success': true,
            'data': arr
        };

        res.send(baseResponse)
    })
})

app.get('/init', (req, res) => {
    // TODO normalize database
    //db.run(`drop table disease`)

    db.run('CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY AUTOINCREMENT, name text not null, age integer not null)')

    db.run(`CREATE TABLE IF NOT EXISTS disease(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name text not null,
        picture text null,
        user_id integer not null
    )`)

    res.json('init success')
    // TODO sample database join?
})

/* GET ALL DISEASES */

app.get('/diseases2', (req, res) => {
    db.all(`SELECT * from disease`, (err: any, data: any) => {
        res.json(data)
    })
})

app.get('/diseases', (req, res) => {
    db.all(`SELECT dis.id id, user.id user_id, dis.name diseases_name, user.name user_name, user.age user_age FROM disease dis left join users user on user.id = dis.user_id`, (err: any, data: any) => {
        res.json(data)
    })
})

/* FIND DISEASE BY ID */
app.get('/diseases/show/:id', (req, res) => {
    //res.send(req.params.id)
    const sql = 'SELECT * FROM disease where id = ?'
    const id = req.params.id

    db.get(sql, id, (err: any, data: any) => {
        res.send(data)
    })
})

/* STORE DISEASES */
app.post('/diseases/store', (req, res) => {

    const sql = 'insert into disease (id, name, user_id) values (null, ?,?)'
    const params = [req.body.name, req.body.user_id]

    //return res.send(req.body);

    db.run(sql, params, err => {
        if (err) {
            res.send(err)
        }
        res.send('Success Add New Data !')
    })
})

app.post('/diseases/update', (req, res) => {

    const sql = 'update disease set name = ? , user_id = ? where id = ?'
    const params = [req.body.name, req.body.user_id, req.body.id]

    db.run(sql, params, err => {
        if (err) {
            res.send(err)
        }
        res.send('Success Update Data !')
    })
})


app.post('/diseases/delete', (req, res, next) => {
    const id = req.body.id;
    const sql = 'delete from disease where id = ?';

    db.run(sql, id, err => {
        if (err) {
            res.send(err)
        }
        res.send('Success Delete Data !')
    })


})

/* GET ALL DISEASES */
app.get('/users', (req, res) => {
    db.all(`SELECT * FROM users`, (err: any, data: any) => {
        res.json(data)
    })
})

app.post('/users/store', (req, res) => {

    const sql = 'insert into users (id, name, age) values (null, ?,?)'
    const params = [req.body.name, req.body.age]

    db.run(sql, params, err => {
        if (err) {
            res.send(err)
        }
        res.send('Success Add New Data !')
    })
})


// TODO create dockerfile
// TODO create docker-compose file
// TODO set CI/CD for the repository
// TODO create unit test