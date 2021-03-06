import {
    AlertController,
    Loading,
    LoadingController,
    NavController,
    NavParams,
    ModalController,
    IonicPage
} from 'ionic-angular';
import { SocialSharing } from '@ionic-native/social-sharing';
import { AppRate } from '@ionic-native/app-rate';

import { Component, ElementRef } from '@angular/core';

import { DashboardPage } from '../dashboard/dashboard';

import {
    User,
    TwAPIService,
    AnalyticsService,
    Watch,
    WatchAction,
    Measure
} from 'tw-core';

import { TranslateService } from '@ngx-translate/core';

declare var window;

@IonicPage({
  name: 'MeasurePage',
  segment: 'MeasurePage'
})
@Component({
    templateUrl: 'measure.html'
})
export class MeasurePage {

    user: User;
    watch: Watch;
    offsetedDate: Date;
    offsetedDateString: string;
    referenceTime: Date;
    accuracy: number;
    percentage: number;
    accuracyText: string;
    percentilText: string;
    step = 0;
    loading: Loading;

    //css variables
    active: boolean = false;
    highFiveSrc = "assets/images/h5.png";
    waitingApi = false;

    constructor(
        private nav: NavController,
        private navParams: NavParams,
        private translate: TranslateService,
        private elementRef: ElementRef,
        private twapi: TwAPIService,
        private loadingController: LoadingController,
        private alertCtrl: AlertController,
        private modalCtrl: ModalController,
        private analytics: AnalyticsService,
        private socialSharing: SocialSharing,
        private appRate: AppRate
    ) {

        this.analytics.screenview("MEASURE");

        this.loading = this.loadingController.create({
            content: this.translate.instant('sync'),
            dismissOnPageChange: false
        });

        this.user = this.navParams.get('user');
        this.watch = this.navParams.get('watch');
    }

    /**
     * Display share options
     */
    share() {

        this.analytics.event("CTA", "SHARE", "MEASURE");

        this.socialSharing.share(
            this.translate.instant('share-text').replace('{X}', this.percentage),
            'Toolwatch',
            null,
            "https://toolwatch.io"
        );
    }

    /**
     * Provides explanation
     */
    alert() {
        let alert = this.alertCtrl.create({
            title: this.translate.instant('something-wrong'),
            subTitle: this.translate.instant('something-wrong-explain'),
            buttons: ['OK']
        });
        alert.present();
    }

    /**
     * On main CTA click
     */
    validate() {

        this.waitingApi = true;

        //User fiddled with the date picker
        if (this.offsetedDateString !== this.constructoffsetedDateString()) {

            let splittedString: string[] = this.offsetedDateString.split(":");
            this.offsetedDate.setHours(Number(splittedString[0]));
            this.offsetedDate.setMinutes(Number(splittedString[1]));
        }

        if (this.watch.next === WatchAction.Measure) {

            this.twapi.upsertMeasure(
                this.watch,
                new Measure(null, this.referenceTime.getTime() / 1000, this.offsetedDate.getTime() / 1000)
            ).then(
                watch => this.baseMeasure(watch)
                );
        } else {

            this.watch.currentMeasure().addAccuracyMeasure(
                this.offsetedDate.getTime() / 1000, this.referenceTime.getTime() / 1000
            );

            this.twapi.upsertMeasure(
                this.watch,
                this.watch.currentMeasure()
            ).then(
                watch => this.accuracyMeasure(watch)
                );
        }
    }

    /**
     * Go Back
     */
    leave() {

        this.user.upsertWatch(this.watch);
        DashboardPage.userChanged.emit(this.user);
        this.nav.pop();
    }

    /**
     * onMeasure
     */
    measure() {

        this.active = true;

        setTimeout(() => this.step = 1, 1000);

        this.twapi.accurateTime().then(
            time => {
                this.referenceTime = time;
            }
        );
    }

    /**
     * Retrieves a minute 
     */
    retrieveMinute() {
        this.offsetedDate = new Date(this.offsetedDate.getTime() - 60 * 1000);
        this.offsetedDateString = this.constructoffsetedDateString();
    }

    /**
     * Adds a minute
     */
    addMinute() {
        this.offsetedDate = new Date(this.offsetedDate.getTime() + 60 * 1000);
        this.offsetedDateString = this.constructoffsetedDateString();
    }

    /**
     * Sync with twapi
     */
    ngAfterViewInit() {

        this.loading.present();

        this.twapi.accurateTime().then(
            res => {
                setTimeout(() => {
                    this.loading.dismiss();
                });

                let d = res;
                let seconds = d.getSeconds();
                let offsetSeconds = 0;

                // If it's somewhere between xx:xx:51 and xx:xx:60,
                // users won't have the time to click.
                // So, we add a minute.
                if (seconds >= 50) {
                    offsetSeconds = 60 - seconds;
                } else {
                    offsetSeconds = -seconds;
                }

                this.offsetedDate = new Date(d.getTime() + offsetSeconds * 1000 + 60 * 1000);
                this.offsetedDateString = this.constructoffsetedDateString();
            }
        );
    }

    /**
     * Creates base measure for watch
     * @param {Watch} watch
     */
    private baseMeasure(watch: Watch) {

        setTimeout(() => {
            this.highFiveSrc = "assets/images/h5.gif";
            setTimeout(() => {
                this.highFiveSrc = "assets/images/h5.png";
            }, 2000);
        }, 1000);
        this.watch = watch;
        this.watch.next = WatchAction.Waiting;
        this.watch.waiting = 12;
        this.user.upsertWatch(this.watch);
        this.step = 2;
        this.analytics.event("API", "MEASURE", "FIRST");
    }

    /**
     * Creates accuracy measure for watch
     * @param {Watch} watch [description]
     */
    private accuracyMeasure(watch: Watch) {
        this.watch = watch;
        this.accuracy = watch.currentMeasure().accuracy;
        this.percentage = watch.currentMeasure().percentile;

        this.user.upsertWatch(this.watch);
        DashboardPage.userChanged.emit(this.user);
        this.analytics.event("API", "MEASURE", "SECOND");

        this.step = 3;

        setTimeout(() => {
            this.appRate.preferences.storeAppURL = {
                ios: '1105636950',
                android: 'market://details?id=toolwatch.toolwatch',
            };

            this.appRate.preferences.customLocale = {
                title: "Rate Toolwatch",
                message: "If you enjoy using Toolwatch, would you mind taking a moment to rate it? It won’t take more than a minute. Thanks for your support!",
                cancelButtonLabel: "No, Thanks",
                laterButtonLabel: "Remind Me Later",
                rateButtonLabel: "Rate It Now"
            };
            this.appRate.preferences.usesUntilPrompt = 1;
            this.appRate.preferences.promptAgainForEachNewVersion = true;

            this.appRate.promptForRating(false);
        }, 3000);

    }

    /**
     * Construct data
     * @return {string}
     */
    private constructoffsetedDateString(): string {
        var hours = (this.offsetedDate.getHours() < 10) ? "0" + this.offsetedDate.getHours() :
            this.offsetedDate.getHours();

        var minutes = (this.offsetedDate.getMinutes() < 10) ? "0" + this.offsetedDate.getMinutes() :
            this.offsetedDate.getMinutes();

        var seconds = (this.offsetedDate.getSeconds() < 10) ? "0" + this.offsetedDate.getSeconds() :
            this.offsetedDate.getSeconds();

        return hours + ":" + minutes + ":" + seconds;
    }


}