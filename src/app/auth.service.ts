import { Injectable } from "@angular/core";
import { Router } from "@angular/router";

import { auth } from "firebase/app";
import { AngularFireAuth } from "@angular/fire/auth";
import {
  AngularFirestore,
  AngularFirestoreDocument,
} from "@angular/fire/firestore";

import { Observable, of, BehaviorSubject } from "rxjs";
import { switchMap } from "rxjs/operators";
import { User } from "./user.model";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  user$: Observable<User>;
  public currentUser = null;
  public currentUser$ = new BehaviorSubject<User>(this.currentUser);
  public currentUserData = null;

  constructor(
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private router: Router
  ) {
    this.user$ = this.afAuth.authState.pipe(
      switchMap((user) => {
        if (user) {
          this.currentUser = user.email;
          //console.log(this.currentUser);
          return this.afs.doc<User>(`users/${user.uid}`).valueChanges();
        } else {
          return of(null);
        }
      })
    );
  }

  getCurrentUser(): Observable<any> {
    return this.currentUser$.asObservable();
  }

  async googleSignin() {
    const provider = new auth.GoogleAuthProvider();
    const credential = await this.afAuth.auth.signInWithPopup(provider);
    this.currentUser = credential.user;

    this.currentUser$.next(credential.user);
    return this.updateUserData(credential.user);
  }

  async signOut() {
    await this.afAuth.auth.signOut();
    this.currentUser$.next(null);
    localStorage.removeItem("u");
    this.router.navigate(["/"]).then(function () {
      window.location.reload();
    })

    return true;
  }

  private updateUserData(user) {
    const userRef: AngularFirestoreDocument<User> = this.afs.doc(
      `users/${user.uid}`
    );

    const data = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
    };
    this.currentUserData = data;
    localStorage.setItem("u", user.uid);
    return userRef.set(data, { merge: true });
  }
  getCurrentUserVar() {
    console.log(this.currentUser);

    //return this.currentUser;
  }
}
