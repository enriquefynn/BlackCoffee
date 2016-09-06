import {Component} from '@angular/core';
import {NavController, NavParams, ModalController} from 'ionic-angular';
import {Events} from 'ionic-angular';
import {User} from '../user/user';
import {UserInfo} from '../user_info/user_info';
import {DBProvider} from '../../providers/db-provider/db-provider';
import {ModalCurr} from '../modal_cur/modal_cur';

@Component({
  templateUrl: 'build/pages/home/home.html',
  providers: [DBProvider]
})

export class Home {
    alphabet : Array<string> = ['A','B','C','D','E','F','G','H','I','J','K',
        'L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
    users: {[key:string]:Array<User>} = {};
    credit_box: number;
    nav : NavController;

    constructor(public dbProvider: DBProvider,
                nav : NavController,
                private modalCtrl: ModalController,
                public events: Events)
    {
        this.nav = nav;
        this.loadUsers();
        this.loadCredit();
        this.events.subscribe('user', () => {
            this.loadUsers();
        });
        this.events.subscribe('credit', () => {
            this.loadCredit();
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
            }

            //Sort
            for (let i = 0; i < this.alphabet.length; ++i)
                if (this.users[this.alphabet[i]] !== undefined)
                    this.users[this.alphabet[i]].sort((a, b) => {
                        return (a['Name'] < b['Name']) ? -1 : 1;
                    });
        })
        .catch(console.error);
    }
    
    private loadCredit()
    {
        this.credit_box = 0.0;
        this.dbProvider.calculateCreditBox()
        .then(data => {
            console.log('Credit: ', data.res.rows.item(0));
            if (data.res.rows.length > 0 && 
                data.res.rows.item(0).sum_credit !== null)
                this.credit_box = data.res.rows.item(0).sum_credit.toFixed(2);
        })
        .catch(console.error);
    }

    public deleteDB()
    {
        this.dbProvider.deleteDB();
    }

    public openUser(user_obj)
    {
        this.nav.push(UserInfo, {user: user_obj});
    }

    public broughtCoffee()
    {
        let modal = this.modalCtrl.create(ModalCurr);
        modal.onDidDismiss(data => {
            if (data == undefined)
                return;
            this.dbProvider.insertCreditBox(-data['value'])
            .then(d => {
                console.log('Took', data['value'], 'from box');
                this.events.publish('credit');
            })
            .catch(console.error);
        });
        modal.present();
    }

}
