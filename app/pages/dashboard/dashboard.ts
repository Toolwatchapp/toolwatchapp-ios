import {Component, ElementRef, EventEmitter, ViewChild} from '@angular/core';
import {Alert, Nav, Loading, NavController, NavParams, ActionSheet} from 'ionic-angular';
import {LoginComponent} from 'tw-common/dist/app/directives/login/login.component';
import {TwAPIService} from 'tw-common/dist/app/services/twapi.service';
import {Watch, WatchStatus, WatchAction} from 'tw-common/dist/app/models/watch.model';
import {MeasureStatus} from 'tw-common/dist/app/models/measure.model';
import {User} from 'tw-common/dist/app/models/user.model';
import {TRANSLATE_PROVIDERS, TranslateService, TranslatePipe, TranslateLoader, TranslateStaticLoader} from 'ng2-translate/ng2-translate';
import {Http, HTTP_PROVIDERS, Headers}  from '@angular/http';
import {Footer} from '../footer/footer';
import {WatchPage} from '../watch/watch';
import {Header} from '../header/header';
import {MeasurePage} from '../measure/measure';

import 'gsap';


@Component({
	templateUrl: 'build/pages/dashboard/dashboard.html',
	pipes: [TranslatePipe],
	directives: [Footer, Header]
})
export class DashboardPage {

	user:User;
	WatchStatus = WatchStatus;
	MeasureStatus = MeasureStatus;
	WatchAction = WatchAction;
	public static userChanged = new EventEmitter();
	

	constructor(private nav: NavController, private navParams: NavParams,  private translate: TranslateService,
		private twapi: TwAPIService, private elementRef: ElementRef) {

		translate.setDefaultLang('en');
		translate.use('en');

		DashboardPage.userChanged.subscribe(
			user => {
				this.user = user;
				console.log("user", this.user);
			}
		);

		this.user = this.navParams.get('user');
	}

	updateWatch(watch:Watch){
		this.nav.push(WatchPage, {
			watch: watch,
			user: this.user
		});
	}

	measureWatch(watch: Watch){

		this.nav.push(MeasurePage, {
			watch: watch,
			user: this.user
		});

	}

	share(){

		let actionSheet = ActionSheet.create({
			title: 'Modify your album',
			buttons: [
				{
					text: 'Destructive',
					role: 'destructive',
					handler: () => {
						console.log('Destructive clicked');
					}
				}, {
					text: 'Archive',
					handler: () => {
						console.log('Archive clicked');
					}
				}, {
					text: 'Cancel',
					role: 'cancel',
					handler: () => {
						console.log('Cancel clicked');
					}
				}
			]
		});
		this.nav.present(actionSheet);
		
	}

	deleteWatch(watch:Watch){


		let alert = Alert.create({
			title: this.translate.instant('delete-watch-alert'),
			message: this.translate.instant('delete-watch-confirm') + watch.brand + " " + watch.name + "?",
			buttons: [
				{
					text: this.translate.instant('cancel'),
					role: 'cancel',
					handler: () => {
						console.log('Cancel clicked');
					}
				},
				{
					text: this.translate.instant('confirm'),
					handler: () => {

						this.twapi.deleteWatch(this.user, watch).then(
							res => {
								this.user = res;
								console.log("Deletion");
							}
						);
						console.log('Deletion clicked');
					}
				}
			]
		});
		this.nav.present(alert);
	}

	onRefresh(refresher) {

		this.twapi.getWatches().then(
			res => {
				this.user.watches = res;
				refresher.complete();
			}
		)
	}

}
