import { async, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { IonicModule, Platform } from 'ionic-angular';

import { PlatformMock } from '../../test-config/mocks-ionic';

import { MyApp } from './app.component';


import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule, Http } from '@angular/http';
import { IonicStorageModule } from '@ionic/storage';
import { BrowserModule } from '@angular/platform-browser';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { Keyboard } from '@ionic-native/keyboard';
import { AppVersion } from '@ionic-native/app-version';
import { Facebook } from '@ionic-native/facebook';
import { SocialSharing } from '@ionic-native/social-sharing';
import { AppRate } from '@ionic-native/app-rate';

import { TranslateService, TranslateModule } from '@ngx-translate/core';

import {
    TwAPIService,
    AnalyticsService,
    ConfigurationService
} from 'tw-core';


import { Pipe, PipeTransform } from '@angular/core';

class ApiMock {
    constructor() {
    }
}

describe('MyApp Component', () => {
    let fixture;
    let component: MyApp;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [MyApp],
            imports: [
                IonicModule.forRoot(MyApp),
                IonicStorageModule.forRoot(),
                TranslateModule.forRoot()
            ],
            providers: [
                StatusBar,
                SplashScreen,
                { provide: Platform, useClass: PlatformMock },
                { provide: TwAPIService, useClass: ApiMock },
                Keyboard,
                AppVersion,
                StatusBar,
                Facebook,
                SocialSharing,
                AppRate,
                InAppBrowser,
                AnalyticsService,
                Keyboard
            ]
        });
        
        window.open = function(url?: string, target?: string, features?: string, replace?: boolean): Window{
            return window;
        }
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MyApp);
        component = fixture.componentInstance;
    });

    it('should be created', () => {
        expect(component instanceof MyApp).toBe(true);
    });

    it('should open intagram', () => {
        expect(component.intagram()).toBeUndefined();
    });

    it('should open pinterest', () => {
        expect(component.pinterest()).toBeUndefined();
    });

    it('should open twitter', () => {
        expect(component.twitter()).toBeUndefined();
    });

    it('should open facebook', () => {
        expect(component.facebook()).toBeUndefined();
    });

    it('should enable the menu controller', fakeAsync(() => {

        MyApp.userLogged.emit();
        tick();
        expect((component as any).menuController).toBeDefined();
    }));

    it('should open the contact form', fakeAsync(() => {
        component.contact();
        tick();
        expect((component as any).menuController).toBeDefined();
    }));

    it('should open the beer form', fakeAsync(() => {
        component.beer();
        tick();
        expect((component as any).menuController).toBeDefined();
    }));

});