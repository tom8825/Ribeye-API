import { Component, OnInit } from '@angular/core';
import $ from 'jquery';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  responsePreview: any;

  constructor() { }

  ngOnInit() {
    
  }

  submitScraperRequest() {
    var url = $("#url-input").val();
    var selector = $("#selector-input").val();
    this.getScraperResponse(url, selector);    
  }

  getLink(){
    var url = $("#url-input").val();
    var selector = $("#selector-input").val();
    var urlString = "https://web.scraper.workers.dev/?url="+url+"&selector="+selector+"&pretty=true";
    $("#link-input").val(urlString);
  }

  getScraperResponse(url, selector){
    var urlSting = "https://web.scraper.workers.dev/?url="+url+"&selector="+selector+"&pretty=true"
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
}
