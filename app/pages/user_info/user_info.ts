import {Component} from '@angular/core';
import {NavController,
    NavParams,
    AlertController,
    ModalController,
    Events,
} from 'ionic-angular';
import {DBProvider} from '../../providers/db-provider/db-provider';
import {Home} from '../home/home';
import {User} from '../user/user';
import {ModalCurr} from '../modal_cur/modal_cur';

@Component({
    templateUrl: 'build/pages/user_info/user_info.html',
    providers: [DBProvider]
})

export class UserInfo {
    nav : NavController;
    user: User;
    credit: number;

    constructor(public dbProvider: DBProvider, 
                nav : NavController, 
                navParams : NavParams,
                private alertCtrl: AlertController,
                private modalCtrl: ModalController,
                private events: Events)
    {
        this.nav = nav;
        this.user = navParams.get('user');
        this.calculateCredit();
    }
    
    private calculateCredit()
    {
        this.credit = 0.0;
        this.dbProvider.calculateCredit(this.user['Id'])
        .then(data => {
            if (data.res.rows.length > 0 && 
                data.res.rows.item(0).sum_credit !== null)
                this.credit = data.res.rows.item(0).sum_credit.toFixed(2);
        })
        .catch(console.error);
    }

    public openDeposit()
    {
        let modal = this.modalCtrl.create(ModalCurr);
        modal.onDidDismiss(data => {
            if (data == undefined)
                return;
            this.dbProvider.insertCredit(this.user['Id'], data['value'])
            .then(d => {
                return this.dbProvider.insertCreditBox(data['value']);
            })
            .then(d => {
                console.log('Inserted', data['value'], 'into user', this.user['Id']);
                this.events.publish('credit');
                this.calculateCredit();
            })
            .catch(console.error);
        });
        modal.present();
    }

    public drink(option : string) {
        let alert = this.alertCtrl.create({
        title: 'Confirm',
        message: 'Do you want to drink ' + option + '?',
        buttons: [{
            text: 'Cancel',
            role: 'cancel',
            handler: () => {
                console.log('Canceled drinking');
            }
        },{
            text: 'Ok',
            handler: () => {
                this.dbProvider.drink(this.user['Id'], option)
                .then(data => {
                    return this.dbProvider.insertCredit(this.user['Id'],
                           this.dbProvider.prices[option]);
                })
                .then(data => {
                    console.log("User", this.user['Id'], "drank", option);
                    this.calculateCredit();
                })
                .catch(console.error);
              }
          }
        ]
      });
      alert.present();
    }
}
