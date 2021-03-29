import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AngularFireModule } from "@angular/fire";
import { AngularFirestoreModule } from "@angular/fire/firestore";
import { AngularFireStorageModule } from "@angular/fire/storage";
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { DatePipe } from '@angular/common';

var firebaseConfig = {
  apiKey: "AIzaSyDypTjfTEQrKqw2UXffZKNu7mA3fZlKZ6k",
  authDomain: "ribeye-4baff.firebaseapp.com",
  projectId: "ribeye-4baff",
  storageBucket: "ribeye-4baff.appspot.com",
  messagingSenderId: "486377763191",
  appId: "1:486377763191:web:ba4422af0e4a35ea43b172"
};


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFirestoreModule,
    AngularFireStorageModule,
    
  ],
  providers: [DatePipe],
  bootstrap: [AppComponent]
})
export class AppModule { }
