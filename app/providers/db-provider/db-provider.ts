import {Storage, SqlStorage} from 'ionic-angular';
import {Injectable} from '@angular/core';

export class User {
    id: number;
    name: string;
    constructor(id: number, name: string) {
        this.id = id;
        this.name = name;
    }
}

@Injectable()
export class DBProvider
{
    //TODO: Put this in storage (handle conflicts in credit :-P)
    prices: {[key:string]:number};
    storage: Storage = null;

    // Init an empty Record if it does not exist by now!
    constructor()
    {
        this.prices = {'coffee': -0.2, 'latte': -0.4}
        this.storage = new Storage(SqlStorage);
        this.storage.query('CREATE TABLE IF NOT EXISTS USER (Id INTEGER PRIMARY KEY, Name TEXT, Email TEXT)');
        this.storage.query('CREATE TABLE IF NOT EXISTS COFFEE (UserId INTEGER, Timestamp DATETIME)');
        this.storage.query('CREATE TABLE IF NOT EXISTS LATTE (UserId INTEGER, Timestamp DATETIME)');
        this.storage.query('CREATE TABLE IF NOT EXISTS CREDIT (UserId INTEGER, Credit REAL, Timestamp DATETIME)');
        this.storage.query('CREATE TABLE IF NOT EXISTS CREDITBOX (Credit REAL, Timestamp DATETIME)');
    }

    public getUsers()
    {
        return this.storage.query('SELECT * FROM USER');
    }

    public saveUser(name: string, email: string)
    {
        //TODO: See if user with this id exists in the db
        let sql = 'INSERT INTO USER (Id, Name, Email) VALUES (null, ?, ?)';
        console.log('[DB]', 'Saving user:', name);

        let name_split = name.toLowerCase().split(' ');
        let correct_name = (name_split.map(word => {
            return word[0].toUpperCase() + word.substr(1)
        })).join(' ');

        return this.storage.query(sql, [
            correct_name, 
            email,
        ]);
    }

    public drink(id: number, cofffe_latte: string)
    {
        let drink = cofffe_latte.toUpperCase();
        let sql = 'INSERT INTO ' + drink + ' (UserId, Timestamp) VALUES (?, ?);'
        console.log('[DB]', 'User', id, 'drank', drink);
        return this.storage.query(sql, [id, Date.now()]);
    }

    public calculateCredit(id: number)
    {
        let sql = 'SELECT SUM(Credit) as sum_credit FROM CREDIT WHERE UserId = ' + id
        return this.storage.query(sql);
    }

    public calculateCreditBox()
    {
        return this.storage.query('SELECT SUM(Credit) as sum_credit FROM CREDITBOX');
    }

    public insertCredit(id: number, ammount: number)
    {
        let sql = 'INSERT INTO CREDIT (UserId, Credit, Timestamp) VALUES (?, ?, ?)';
        return this.storage.query(sql, [id, ammount, Date.now()]);
    }

    public insertCreditBox(ammount: number)
    {
        let sql = 'INSERT INTO CREDITBOX (Credit, Timestamp) VALUES (?, ?)';
        return this.storage.query(sql, [ammount, Date.now()]);
    }

    public deleteDB()
    {
        this.storage.query('DROP TABLE USER');
        this.storage.query('DROP TABLE COFFEE');
        this.storage.query('DROP TABLE LATTE');
        this.storage.query('DROP TABLE CREDIT');
        this.storage.query('DROP TABLE CREDITBOX');
    }
}
