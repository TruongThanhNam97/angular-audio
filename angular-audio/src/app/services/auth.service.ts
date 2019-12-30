import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

import decode from 'jwt-decode';
import { DECODE_TOKEN } from '../interfaces/decode-token';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private SERVER_URL: string;
    private SERVER_URL_SOUND: string;

    private isAuthenticated = false;
    private currentUser: DECODE_TOKEN;
    private tokenTimer: any;

    private isAuthenticatedSubject$: Subject<boolean> = new Subject();
    private currentUserSubject$: Subject<DECODE_TOKEN> = new Subject();

    constructor(private http: HttpClient, private router: Router) {
        this.SERVER_URL = environment.SERVER_URL;
        this.SERVER_URL_SOUND = environment.SERVER_URL_SOUND;
    }

    login(data: any) {
        return this.http.post<any>(`${this.SERVER_URL}users/login`, data);
    }

    register(data: any) {
        return this.http.post<any>(`${this.SERVER_URL}users/register`, data);
    }

    setUpAfterLogin(token: string) {
        this.isAuthenticated = true;
        this.currentUser = decode(token);
        this.isAuthenticatedSubject$.next(this.isAuthenticated);
        this.currentUserSubject$.next(this.currentUser);
        const expire = this.currentUser.exp;
        const now = Math.round(new Date().getTime() / 1000);
        this.tokenTimer = setTimeout(() => {
            this.logOut();
        }, (expire - now) * 1000);
        localStorage.setItem('jwtToken', token);
        this.router.navigate(['/songs']);
    }

    logOut() {
        localStorage.removeItem('jwtToken');
        clearTimeout(this.tokenTimer);
        this.isAuthenticated = false;
        this.currentUser = null;
        this.isAuthenticatedSubject$.next(this.isAuthenticated);
        this.currentUserSubject$.next(this.currentUser);
        this.router.navigate(['/login']);
    }

    isAuthenticate(): boolean {
        return this.isAuthenticated;
    }

    getIsAuthenticatedSubject() {
        return this.isAuthenticatedSubject$.asObservable();
    }

    getCurrentUserSubject() {
        return this.currentUserSubject$.asObservable();
    }
}