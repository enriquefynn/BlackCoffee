import {Component} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import {Events} from 'ionic-angular';
import {User} from '../user/user';
import {UserInfo} from '../user_info/user_info';
import {DBProvider} from '../../providers/db-provider/db-provider';

@Component({
  templateUrl: 'build/pages/home/home.html',
  providers: [DBProvider]
})

export class Home {
    alphabet : Array<string> = ['A','B','C','D','E','F','G','H','I','J','K',
        'L','M','N','O','P','Q','R','S','U','V','X','Y','Z'];
    users: {[key:string]:Array<User>} = {};
    nav : NavController;

    constructor(public dbProvider: DBProvider,
                nav : NavController,
                public events: Events)
    {
        this.nav = nav;
        this.loadUsers();
        this.events.subscribe('user:created', () => {
            this.loadUsers();
        });
    }

    public newUser()
    {
        this.nav.push(User);
    }

    private loadUsers()
    {
        this.users = {};
        this.dbProvider.getUsers()
        .then(data => {
            for (let i = 0; i < data.res.rows.length; ++i)
            {
                if (this.users[data.res.rows.item(i).Name[0]] === undefined)
                    this.users[data.res.rows.item(i).Name[0]] = [];
                this.users[data.res.rows.item(i).Name[0]].push(data.res.rows.item(i));
                console.log(data.res.rows.item(i).Name);
            }

            //Sort
            for (let i = 0; i < this.alphabet.length; ++i)
                if (this.users[this.alphabet[i]] !== undefined)
                    this.users[this.alphabet[i]].sort((a, b) => {
                        return (a['Name'] < b['Name']) ? -1 : 1;
                    });
            console.log(this.users);
        })
        .catch(err => {console.error(err);});
    }

    public deleteDB()
    {
        this.dbProvider.deleteDB();
    }

    public openUser(user_obj)
    {
        this.nav.push(UserInfo, {user: user_obj});
    }

}
