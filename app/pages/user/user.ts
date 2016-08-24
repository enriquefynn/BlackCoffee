import {Component} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import {Events} from 'ionic-angular';
import {DBProvider} from '../../providers/db-provider/db-provider';
import {Home} from '../home/home';

@Component({
    templateUrl: 'build/pages/user/user.html',
    providers: [DBProvider]
})

export class User {
    nav : NavController;
    name : string;
    email : string;

    constructor(public dbProvider: DBProvider,
                nav : NavController,
                public events: Events)
    {
        this.nav = nav;
    }

    public create()
    {
        console.log('Creating user:', this.name, this.email);
        this.dbProvider.saveUser(this.name, this.email).then(data => {
            console.log(data);
            this.events.publish('user:created');
            this.nav.pop();

        }).catch(err => {console.error(err);});
    }
}
