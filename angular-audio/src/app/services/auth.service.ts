import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

import decode from 'jwt-decode';
import { DECODE_TOKEN } from '../interfaces/decode-token';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { CloudService } from './cloud.service';

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

    private reupDectectedSubject$: Subject<number> = new Subject();


    constructor(private http: HttpClient, private router: Router, private cloudService: CloudService) {
        this.SERVER_URL = environment.SERVER_URL;
        this.SERVER_URL_SOUND = environment.SERVER_URL_SOUND;
    }

    getReupDectectedSubject() {
        return this.reupDectectedSubject$.asObservable();
    }

    updateReupDectected(numberOfReupDectected: number) {
        this.reupDectectedSubject$.next(numberOfReupDectected);
    }

    login(data: any) {
        return this.http.post<any>(`${this.SERVER_URL}users/login`, data);
    }

    update(data: any) {
        return this.http.post<any>(`${this.SERVER_URL}users/update`, data, {
            headers: {
                Authorization: localStorage.getItem('jwtToken')
            }
        });
    }

    register(data: any) {
        return this.http.post<any>(`${this.SERVER_URL}users/register`, data);
    }

    setUpAfterLogin(token: string) {
        this.isAuthenticated = true;
        this.currentUser = decode(token);
        console.log(this.currentUser);
        this.isAuthenticatedSubject$.next(this.isAuthenticated);
        this.currentUserSubject$.next(this.currentUser);
        const expire = this.currentUser.exp;
        const now = Math.round(new Date().getTime() / 1000);
        this.tokenTimer = setTimeout(() => {
            this.logOut();
        }, (expire - now) * 1000);
        localStorage.setItem('jwtToken', token);
        if (!localStorage.getItem('reup')) {
            localStorage.setItem('reup', this.currentUser.numberOfReup.toString());
        }
        if (this.currentUser.username === 'superadmin') {
            this.router.navigate(['/manage-categories/upload-category']);
        } else {
            this.cloudService.getBlockedSongs().pipe(
                map((blockedSongs: any[]) => {
                    const result = [];
                    blockedSongs.forEach(blockedSong => result.push(blockedSong.id));
                    return result;
                }),
                take(1)
            ).subscribe(blockedSongs => {
                this.cloudService.setBlockedSongsOfUser(blockedSongs);
                this.router.navigate(['/categories']);
            });
        }
    }

    setUpAfterUpdate(token: string) {
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('reup');
        clearTimeout(this.tokenTimer);
        this.currentUser = decode(token);
        this.currentUserSubject$.next(this.currentUser);
        const expire = this.currentUser.exp;
        const now = Math.round(new Date().getTime() / 1000);
        this.tokenTimer = setTimeout(() => {
            this.logOut();
        }, (expire - now) * 1000);
        localStorage.setItem('jwtToken', token);
        if (!localStorage.getItem('reup')) {
            localStorage.setItem('reup', this.currentUser.numberOfReup.toString());
        }
    }

    logOut() {
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('reup');
        clearTimeout(this.tokenTimer);
        this.isAuthenticated = false;
        this.currentUser = null;
        this.isAuthenticatedSubject$.next(this.isAuthenticated);
        this.currentUserSubject$.next(this.currentUser);
        this.router.navigate(['/login']);
        this.cloudService.setBlockedSongsOfUser([]);
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

    getCurrentUser() {
        return this.currentUser;
    }

    getUserById(id: string) {
        return this.http.get(`${this.SERVER_URL}users/getUserById`, { params: { id } }).pipe(
            map((user: any) => ({ id: user._id, avatar: user.avatar ? user.avatar : null, username: user.username }))
        );
    }
}