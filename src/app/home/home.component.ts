import { Component, OnInit } from '@angular/core'
import * as camera from "@nativescript/camera";
import { DataService, DataItem } from '../shared/data.service'

@Component({
  selector: 'Home',
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  items: Array<DataItem>

  constructor(private _itemService: DataService) {}

  cameraIsAvailable(): void {
    console.log('camera is available = ' + camera.isAvailable());
  }

  ngOnInit(): void {
    this.items = this._itemService.getItems();
    this.cameraIsAvailable();
  }
}
