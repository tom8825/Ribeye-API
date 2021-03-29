import { Component, OnInit } from '@angular/core';
import $ from 'jquery';
import { FirebaseService } from "../firebase.service";
import {
  AngularFirestore,
  AngularFirestoreDocument,
} from "@angular/fire/firestore";
import { AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Link } from 'src/app/link.model';
//import { linkSync } from 'fs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  linkList: any;
  responsePreview: any;
  dateToday: Date;
  bitlyLink: string;

  constructor(private _firebaseService: FirebaseService, private afs: AngularFirestore) { 
    
  }

  ngOnInit() {
    this.GetLinkListDb();
    this.dateToday = new Date();
  }

  submitScraperRequest() {
    var url = $("#url-input").val();
    var selector = $("#selector-input").val();

    if(url && selector){
      this.getScraperResponse(url, selector);
    }else{
      alert("Please add a url and a selector")
    }
  }

  async getLink(){
    var url = $("#url-input").val();
    var selector = $("#selector-input").val();

    if(this.isUrlValid(url) && selector){
      var urlString = "https://web.scraper.workers.dev/?url="+url+"&selector="+selector+"&pretty=true";
      this.bitlyLink = await this.postLinkToDb();
      await console.log(this.bitlyLink);
      await $("#link-input").val(this.bitlyLink);
    }else{
      alert("Please add a url and a selector")
    }
  }

  getScraperResponse(url, selector){
    var urlSting = "https://web.scraper.workers.dev/?url="+url+"&selector="+selector+"&pretty=true";
    $.ajax({
      type: "get", url: urlSting,
      success: function (data, text) {
        this.responsePreview = data.result;
        
        $("#codeSample").text(JSON.stringify(this.responsePreview, null, 2));
      },
      error: function (request, status, error) {
        alert(request.responseText);
      }
    });
  }

  async postLinkToDb(){
    var url = $("#url-input").val();
    var selector = $("#selector-input").val();

    if(url && selector){
      return await this._firebaseService.postLinkToDb(url, selector);
    }else{
      alert("Please add a url and a selector")
    }
    
  }

  async GetLinkListDb(){
    this.afs.collection('Links').valueChanges({ idField: 'id' }).subscribe(val => {
      this.linkList = val;
      //console.log(val);
      for(let link of this.linkList){
        this.compareDates(link.ExpiryDate)
      }
    });

    
  }

  deleteLink(id){
    this.afs.collection('Links').doc(id).delete().then(() => {
      console.log("Document successfully deleted!");
    }).catch((error) => {
        console.error("Error removing document: ", error);
    });
  }

  renewLink(id){
    let expDate = this._firebaseService.add_months(new Date(), 1).toString();
    this.afs.collection('Links').doc(id).update({ ExpiryDate: expDate }).then(() => {
      console.log("Document successfully deleted!");
    }).catch((error) => {
        console.error("Error removing document: ", error);
    });
  }

  compareDates(d){
    let dt1 = new Date(Date.now()); //today
    let dt2 = new Date(d); //exp

    let comparedDates = Math.floor((Date.UTC(dt2.getFullYear(), dt2.getMonth(), dt2.getDate()) - Date.UTC(dt1.getFullYear(), dt1.getMonth(), dt1.getDate()) ) /(1000 * 60 * 60 * 24));

    //console.log("Compared Dates: " + comparedDates.toString());
  }

  isUrlValid(userInput) {
    var res = userInput.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
    if(res == null)
        return false;
    else
        return true;
  }
}
