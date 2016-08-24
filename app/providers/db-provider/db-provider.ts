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
    storage: Storage = null;

    // Init an empty Record if it does not exist by now!
    constructor()
    {
        this.storage = new Storage(SqlStorage);

        this.storage.query('CREATE TABLE IF NOT EXISTS USER (Id INTEGER PRIMARY KEY, Name TEXT, Email TEXT)');
        this.storage.query('CREATE TABLE IF NOT EXISTS COFFEE (UserId INTEGER, Timestamp DATETIME)');
        this.storage.query('CREATE TABLE IF NOT EXISTS LATTE (UserId INTEGER, Timestamp DATETIME)');
        this.storage.query('CREATE TABLE IF NOT EXISTS CREDIT (UserId INTEGER, Credit REAL, Timestamp DATETIME)');
        this.storage.query('CREATE TABLE IF NOT EXISTS PRICE (Coffee REAL, Latte REAL)');
    }

    public getUsers()
    {
        return this.storage.query('SELECT * FROM USER');
    }

    public saveUser(name: string, email: string)
    {
        //TODO: See if user with this id exists in the db
        let sql = 'INSERT INTO USER (Id, Name, Email) VALUES (null,?,?)';
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

    public drink(id: number, cofffe_latte: boolean)
    {
        let drink = (cofffe_latte) ? 'COFFEE' : 'LATTE';
        let sql = 'BEGIN TRANSACTION;' +
            'INSERT INTO ' + drink + ' (Id, Timestamp) VALUES (?, ?); ' + 
            'UPDATE USER SET CREDIT = CREDIT + (SELECT ' + drink + ' FROM PRICE) WHERE Id = ?;' +
            'END TRANSACTION;';
        console.log('User', id, 'drank', drink);
        return this.storage.query(sql, [id, Date.now(), id]);
    }

    public calculateCredit(id: number)
    {
        let sql = 'SELECT * FROM CREDIT WHERE UserId = ' + id
        return this.storage.query(sql);
    }

    public pay(id: number, ammount: number)
    {
        let sql = 'UPDATE USER SET CREDIT = CREDIT - ? WHERE Id = ?'
        return this.storage.query(sql, [ammount, id]);
    } 

    public deleteDB()
    {
        this.storage.query('DROP TABLE USER');
        this.storage.query('DROP TABLE COFFEE');
        this.storage.query('DROP TABLE LATTE');
        this.storage.query('DROP TABLE CREDIT');
        this.storage.query('DROP TABLE PRICE');
    }
}
