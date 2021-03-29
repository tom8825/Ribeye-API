import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable, BehaviorSubject } from 'rxjs';
import {formatDate} from '@angular/common';
import { DatePipe } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  messageGroupsCollection: AngularFirestoreCollection;
  messageGroups = this.firestore.collection('Links').snapshotChanges();
  public LinkList$ = new BehaviorSubject<any>(this.messageGroups);


  constructor(private firestore: AngularFirestore, private datePipe: DatePipe) {

  }

  getLinks(): Observable<any> {
    let Links = this.firestore.collection('MessageGroups').doc('tt0848228').collection('messages').valueChanges();

    this.LinkList$ = new BehaviorSubject<any>(Links);
    return this.LinkList$.asObservable();
  }

  async postLinkToDb(url, selector) {
    let messageCollections = this.firestore.collection('Links');
    let expDate = this.add_months(new Date(), 1).toString();
    let dateAdded = this.datePipe.transform(new Date(), 'dd/MM/yyyy').toString();
    let link = await this.getBitlyLink(url, selector);
    messageCollections.add({ Url: url, Selector: selector, DateAdded:  dateAdded, ExpiryDate: expDate, Link: link });

    return link;
  }

  async getBitlyLink(url, selector){
    const BitlyClient = require('bitly').BitlyClient;
    const bitly = new BitlyClient('af4e8f9df040e1c5a7763f24fa4fb918709b124f');
    const urlSting = "https://web.scraper.workers.dev/?url="+url+"&selector="+selector+"&pretty=true"; //TODO needs to be changed to an angular url

    const response = await bitly.shorten(urlSting);
    console.log(`Your shortened bitlink is ${response.link}`);

    return response.link;
  }

  add_months(dt, n) 
  {
    return this.datePipe.transform(new Date(dt.setMonth(dt.getMonth() + n)), 'dd/MM/yyyy');     
  }

  add_days(dt, n) 
  {
    return this.datePipe.transform(new Date(dt.setDay(dt.getDay() + n)), 'dd/MM/yyyy');     
  }


  uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}
