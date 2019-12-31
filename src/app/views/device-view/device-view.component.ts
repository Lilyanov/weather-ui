import { Component, OnInit } from '@angular/core';
import { DevicesService } from 'src/app/services/devices.service';

@Component({
  selector: 'app-device-view',
  templateUrl: './device-view.component.html',
  styleUrls: ['./device-view.component.scss']
})
export class DeviceViewComponent implements OnInit {

  public devices: any[] = [];
  public dataLoaded: boolean;

  constructor(private deviceService: DevicesService) { }

  ngOnInit() {
    this.dataLoaded = false;
    this.deviceService.getAllDevices().subscribe(devices => {
      this.devices = devices;
      this.dataLoaded = true;
    });
  }

  public deviceSwitch(deviceId: string, status: number) {
    this.dataLoaded = false;
    this.deviceService.deviceSwitch(deviceId, status).subscribe(response => {
      const device = this.devices.find(d => d.deviceId === deviceId);
      device.status = response.lampStatus;
      this.dataLoaded = true;
    });
  }
}
