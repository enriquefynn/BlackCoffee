import {Component} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import {DBProvider} from '../../providers/db-provider/db-provider';
import {Home} from '../home/home';
import {User} from '../user/user';

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
                navParams : NavParams)
    {
        this.nav = nav;
        this.user = navParams.get('user');
        this.calculateCredit();
        console.log(this.user);
    }
    
    private calculateCredit()
    {
        this.dbProvider.calculateCredit(this.user['Id'])
        .then(data => {console.log(data);})
        .catch(err => {console.error(err);});
    }
}
