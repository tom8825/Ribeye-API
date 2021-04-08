import { Component, OnInit } from '@angular/core';
import $ from 'jquery';
import { FirebaseService } from "../firebase.service";
import {
  AngularFirestore,
  AngularFirestoreDocument,
} from "@angular/fire/firestore";
import { AuthService } from "../auth.service";
import { DefaultUrlSerializer, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { User } from "../user.model";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})

export class HomeComponent implements OnInit {
  linkList: any;
  responsePreview: any;
  dateToday: Date;
  bitlyLink: string;
  currentUserId: any;
  userData: User;

  displayedColumns = ['Created', 'URL', 'CSS Selector', 'Link', 'Expired', 'Options', 'Schedule'];
  //dataSource = new HomeComponent();

  isExpansionDetailRow = (i: number, row: Object) => row.hasOwnProperty('detailRow');
  expandedElement: any;

  constructor(private _firebaseService: FirebaseService, private afs: AngularFirestore, public auth: AuthService) { 
    
  }

  ngOnInit() { 
    this.dateToday = new Date();
    //this.checkUserLogin();
    this.auth.user$.subscribe(val => {
      //console.log(val)
      this.userData = val;
      this.GetLinkListDb(this.userData.uid)
    });

    $('.collapse').on('show.bs.collapse', function () {
      $('.collapse.in').collapse('hide');
    });
  }

  logIn(userdetails) {
    this.auth.googleSignin().then((res) => {
      console.log(this.auth.currentUser);

      // this.auth.currentUser$.subscribe(val => {
      //   this.GetLinkListDb(val.uid);
      //   this.currentUserId = val.uid;
      //   this.userData = val;
      // });

      // if(this.auth.currentUserData["uid"] != null && this.auth.currentUserData["uid"] != ""){
      //   this.GetLinkListDb();
      // }
    });
  }

  checkUserLogin() {
    let user = this.auth.user$.subscribe((res) => {
      if (res != null) {
        console.log("yes: " + res.email);
        this.GetLinkListDb(res.uid);
      }else{
        console.log("no user logged in");
        localStorage.removeItem("u");
        //$("#loginModal").modal("toggle");
      }
    })
  }

  submitScraperRequest() {
    var url = $("#url-input").val();
    var selector = $("#selector-input").val().replace('#', '%23');
    var attribute = $("#attribute-input").val();
    
    if(url && selector){
      this.getScraperResponse(url, selector, attribute);
    }else{
      alert("Please add a url and a selector")
    }
  }

  async getLink(){
    var url = $("#url-input").val();
    var selector = $("#selector-input").val();
    var attribute = $("#attribute-input").val();

    if(this.isUrlValid(url) && selector){
      var urlString = "https://web.tlparker1988.workers.dev/?url="+url+"&selector="+selector+"&attr="+attribute+"&pretty=true";
      this.bitlyLink = await this.postLinkToDb();
      await console.log(this.bitlyLink);
      await $("#link-input").val(this.bitlyLink);
    }else{
      alert("Please add a url and a selector")
    }
  }

  getScraperResponse(url, selector, attribute){
    var urlSting = "https://web.tlparker1988.workers.dev/?url="+url+"&selector="+selector+"&attr="+attribute+"&pretty=true";
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
    var selector = $("#selector-input").val().replace('#', '%23');
    var attribute = $("#attribute-input").val();

    if(url && selector){
      let link = await this._firebaseService.postLinkToDb(url, selector, attribute, this.userData.uid);
      this.GetLinkListDb(this.userData.uid);
      return link;
    }else{
      alert("Please add a url and a selector")
    }
    
  }

  async GetLinkListDb(uid){
    this.afs.collection('Links', ref => ref.where('Uid', '==', uid)).valueChanges({ idField: 'id' }).subscribe(val => {
      this.linkList = val;
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

  clearInputs(){
    $("#url-input").val("");
    $("#selector-input").val("");
    $("#attribute-input").val("");
    $("#link-input").val("");
    $("#codeSample").text("Preview");
  }

  isUrlValid(userInput) {
    var res = userInput.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
    if(res == null)
        return false;
    else
        return true;
  }

  showHideRenewBtn(expires){
    let dateNow = new Date(Date.now());
    let expiresDate = new Date(expires);
    expiresDate = new Date(expiresDate.setDate(expiresDate.getDate()-7));
    if(dateNow >= expiresDate){
      return true;
    }else{
      return false;
    }
  }

  hasExpired(expires){
    let dateNow = new Date(Date.now());
    let expiresDate = new Date(expires);
    
    if(dateNow >= expiresDate){
      return true;
    }else{
      return false;
    }
  }

  getFavicon(linkUrl){
    var pattern = /^((http|https|ftp):\/\/)/;

    if(!pattern.test(linkUrl)) {
      linkUrl = "http://" + linkUrl;
    }
    var l = document.createElement("a");
    l.href = linkUrl;
    
    return l.protocol + "//" + l.hostname + "/favicon.ico";
  }

  onImgError(event, linkUrl){
    let baseUrl = "https://eu.ui-avatars.com/api/?background=random&size=32&rounded=true&name="

    var pattern = /^((http|https|ftp):\/\/)/;
    if(!pattern.test(linkUrl)) {
      linkUrl = "http://" + linkUrl;
    }
    var l = document.createElement("a");
    l.href = linkUrl;

    event.target.src = baseUrl + l.hostname;
  }
}
