import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

import {tileLayer , latLng, circleMarker, circle, geoJSON, icon } from 'leaflet';

@Component({
  selector: 'app-leaflet',
  templateUrl: './leaflet.component.html',
  styleUrls: ['./leaflet.component.scss']
})
export class LeafletComponent implements OnInit {

  urlData: any;
  constructor(private http: HttpClient) {}

  map!: L.Map;
  json:any;

  //Basic Map
  options1 = {
    layers: [
      tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: ""
      })
    ],
    zoom: 5,
    center: latLng(20.5937, 78.9629)
  };

   //Popup map
   options2 = {
    layers: [
      tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: ""
      }),
      circleMarker([20.5937, 78.9629]).bindPopup("<b>Hello world!<\/b><br />I am a popup.").openPopup()
    ],
    zoom: 5,
    center: latLng(20.5937, 78.9629)
  };
 
   //Circle map
  options3 = {
    layers: [
      tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: ""
      }),
      circle([20.5937, 78.9629], {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.5,
        radius: 100
      })
    ],
    zoom: 5,
    center: latLng(20.5937, 78.9629)
  }; 

  onMapReady(map: L.Map) {
    this.http.get("assets/maps/leafletmap.json").subscribe((json: any) => {
      console.log(json);
      this.json = json;
      geoJSON(this.json).addTo(map);
    });
  }
  markerIcon = {
    icon: icon({
      iconSize: [25, 41],
      iconAnchor: [10, 41],
      popupAnchor: [2, -40],
      // specify the path here
      iconUrl: "assets/img/marker-icon.png",
      shadowUrl: "assets/img/marker-shadow.png"
    })
  };

  ngOnInit(): void {
  }
}
