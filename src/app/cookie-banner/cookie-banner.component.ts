import { Component, OnInit } from '@angular/core';
import $ from 'jquery';

@Component({
  selector: 'app-cookie-banner',
  templateUrl: './cookie-banner.component.html',
  styleUrls: ['./cookie-banner.component.scss']
})
export class CookieBannerComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    let cookie = this.getCookie("cookie-consent")
    if(cookie == null){
      $(".cookie-banner-container").removeClass("d-none");
    }
  }

  consentAccept(){
    console.log("test");
    $(".cookie-banner-container").hide();
    document.cookie = "cookie-consent=analytics, marketing";
  }

  consentDecline(){
    console.log("test");
    $(".cookie-banner-container").hide();
    document.cookie = "cookie-consent=false, false";
  }

  getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  }
}
