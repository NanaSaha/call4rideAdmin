import { Injectable, OnDestroy } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, from } from "rxjs";
import { map, tap } from "rxjs/operators";

import { environment } from "../../environments/environment";
import { User } from "./user.model";
import { Plugins } from "@capacitor/core";

export interface AuthResponseData {
  kind: string;
  idToken: string;
  email: string;
  refreshToken: string;
  localId: string;
  expiresIn: string;
  registered?: boolean;
}

export interface RefreshTokenResponseData {
  expires_in: string;
  token_type: string;
  refresh_token: string;
  id_token: string;
  user_id: string;
  project_id: boolean;
}

@Injectable({
  providedIn: "root",
})
export class AuthService implements OnDestroy {
  private _user = new BehaviorSubject<User>(null);
  private activeLogoutTimer: any;

  get userIsAuthenticated() {
    return this._user.asObservable().pipe(
      map((user) => {
        if (user) {
          return !!user.token;
        } else {
          return false;
        }
      })
    );
  }

  get authenticatedUser() {
    return this._user.asObservable().pipe(
      map((user) => {
        if (user) {
          return user;
        } else {
          return null;
        }
      })
    );
  }

  get userId() {
    return this._user.asObservable().pipe(
      map((user) => {
        if (user) {
          return user.id;
        } else {
          console.log("user not found!!");
          return null;
        }
      })
    );
  }

  constructor(private http: HttpClient) {}

  autoLogin() {
    return from(Plugins.Storage.get({ key: "authData" })).pipe(
      map((storedData) => {
        if (!storedData || !storedData.value) {
          return null;
        }
        const parsedData = JSON.parse(storedData.value) as {
          token: string;
          tokenExpirationDate: string;
          userId: string;
          email: string;
          refreshToken:string
        };
        const expirationTime = new Date(parsedData.tokenExpirationDate);
        // if (expirationTime <= new Date()) {
        //   return null;
        // }
        const user = new User(
          parsedData.userId,
          parsedData.email,
          parsedData.token,
          parsedData.refreshToken,
          expirationTime
        );
        return user;
      }),
      tap((user) => {
        if (user) {
          this._user.next(user);
          //this.autoLogout(user.tokenDuration);
        }
      }),
      map((user) => {
        return !!user;
      })
    );
  }

  signup(email: string, password: string) {
    return this.http
      .post<AuthResponseData>(
        `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${environment.firebaseAPIKey}`,
        { email: email, password: password, returnSecureToken: true }
      )
      .pipe(tap(this.setUserData.bind(this)));
  }

  login(email: string, password: string) {
    return this.http
      .post<AuthResponseData>(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${environment.firebaseAPIKey}`,
        { email: email, password: password, returnSecureToken: true }
      )
      .pipe(tap(this.setUserData.bind(this)));
  }

  refreshToken() {
    Plugins.Storage.get({ key: "authData" }).then((storedData)=>{
      if (!storedData || !storedData.value) {
         this.logout()
         return;
        }
        const parsedData = JSON.parse(storedData.value) as {
          token: string;
          tokenExpirationDate: string;
          userId: string;
          email: string;
          refreshToken:string;
        };
      return this.http
      .post<RefreshTokenResponseData>(
        `https://securetoken.googleapis.com/v1/token?key=${environment.firebaseAPIKey}`,
        { grant_type: 'refresh_token', refresh_token: parsedData.refreshToken }
      )
      .pipe(map((response)=>{
        let authData:AuthResponseData = {
            kind: "",
            idToken: response.id_token,
            email: parsedData.email,
            refreshToken: response.id_token,
            localId: response.user_id,
            expiresIn: response.expires_in
        }
        // parsedData.token = response.id_token;
        // parsedData.tokenExpirationDate = response.expires_in;
        // parsedData.userId = response.user_id;
        this.setUserData(authData)

      })
        // tap(
        //  this.setUserData.bind(this)
        // )
        );
    })
  
    
  }

  refreshToken2() {

    return from(Plugins.Storage.get({ key: "authData" })).pipe(
      map((storedData) => {
        if (!storedData || !storedData.value) {
          this.logout()
         return;
        }
        const parsedData = JSON.parse(storedData.value) as {
          token: string;
          tokenExpirationDate: string;
          userId: string;
          email: string;
          refreshToken:string
        };
        const expirationTime = new Date(parsedData.tokenExpirationDate);
        // if (expirationTime <= new Date()) {
        //   return null;
        // }
        // const user = new User(
        //   parsedData.userId,
        //   parsedData.email,
        //   parsedData.token,
        //   parsedData.refreshToken,
        //   expirationTime
        // );
        return this.http
        .post<RefreshTokenResponseData>(
          `https://securetoken.googleapis.com/v1/token?key=${environment.firebaseAPIKey}`,
          { grant_type: 'refresh_token', refresh_token: parsedData.refreshToken }
        )
        .pipe(map((response)=>{
          let authData:AuthResponseData = {
              kind: "",
              idToken: response.id_token,
              email: parsedData.email,
              refreshToken: response.id_token,
              localId: response.user_id,
              expiresIn: response.expires_in
          }
         
          this.setUserData(authData)
  
        })
         
          );
      })
    )
  }

  logout() {
    if (this.activeLogoutTimer) {
      clearTimeout(this.activeLogoutTimer);
    }
    this._user.next(null);
    Plugins.Storage.remove({ key: "authData" });
  }

  changePassword(password: string) {
    return this.http
      .post<AuthResponseData>(
        `https://identitytoolkit.googleapis.com/v1/accounts:update?key=${environment.firebaseAPIKey}`,
        { password: password, returnSecureToken: true }
      )
      .pipe(tap(this.setUserData.bind(this)));
  }

  ngOnDestroy() {
    if (this.activeLogoutTimer) {
      clearTimeout(this.activeLogoutTimer);
    }
  }

  private autoLogout(duration: number) {
    if (this.activeLogoutTimer) {
      clearTimeout(this.activeLogoutTimer);
    }
    this.activeLogoutTimer = setTimeout(() => {
      this.logout();
    }, duration);
  }

  private autoRefreshToken(duration: number) {
    if (this.activeLogoutTimer) {
      clearTimeout(this.activeLogoutTimer);
    }
    this.activeLogoutTimer = setTimeout(() => {
      //this.logout();
      this.refreshToken()
    }, duration);
  }

  private setUserData(userData: AuthResponseData) {
    const expirationTime = new Date(
      new Date().getTime() + +userData.expiresIn * 1000
    );
    const user = new User(
      userData.localId,
      userData.email,
      userData.idToken,
      userData.refreshToken,
      expirationTime
    );

    this._user.next(user);
    this.autoRefreshToken(user.tokenDuration);
    this.storeAuthData(
      userData.localId,
      userData.idToken,
      expirationTime.toISOString(),
      userData.email,
      userData.refreshToken
    );
  }

  private storeAuthData(
    userId: string,
    token: string,
    tokenExpirationDate: string,
    email: string,
    refreshToken:string
  ) {
    const data = JSON.stringify({
      userId: userId,
      token: token,
      tokenExpirationDate: tokenExpirationDate,
      email: email,
      refreshToken:refreshToken
    });
    Plugins.Storage.set({ key: "authData", value: data });
  }
}

// import { Injectable } from "@angular/core";
// import {HttpClient} from '@angular/common/http';
// import {environment} from 'src/environments/environment'

// interface AuthResponseData {
//   kind: string;
//   idToken: string;
//   email: string;
//   refreshToken: string;
//   localId: string;
//   expiresIn: string;
//   registered?: boolean;
// }

// @Injectable({
//   providedIn: "root",
// })
// export class AuthService {
//   private _userIsAuthenticated = false;
//   private _userId = null;

//   constructor(private http: HttpClient) {}

//   get userIsAuthenticated() {
//     return this._userIsAuthenticated;
//   }

//   get userId() {
//     return this._userId;
//   }

//   login(email:string, password:string) {
//     return this.http.post<AuthResponseData>(
//       `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=[API_KEY]https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${environment.firebaseAPIKey}`,
//       {email:email,password:password, returnSecureToken:true}
//     );
//     //this._userIsAuthenticated = true;
//   }
//   logout() {
//     this._userIsAuthenticated = false;
//   }

//   signup(email:string, password:string)
//   {
//       return this.http.post<AuthResponseData>(
//         `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${environment.firebaseAPIKey}`,
//         {email:email,password:password, returnSecureToken:true}
//       );
//   }
// }
