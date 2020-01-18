import { Component, OnInit } from '@angular/core';
import { DevicesService } from 'src/app/services/devices.service';
import { ToastrService } from 'ngx-toastr';
import { RealTimeService } from 'src/app/services/real-time.service';

@Component({
  selector: 'app-device-view',
  templateUrl: './device-view.component.html',
  styleUrls: ['./device-view.component.scss']
})
export class DeviceViewComponent implements OnInit {
  public readonly typeOptions: string[] = ['REPEATED', 'NON_REPEATED', 'DISABLED'];
  public readonly statusOptions: any[] = [{ name: 'Turn on', value: 1 }, { name: 'Turn off', value: 0 }];

  public devices: any[] = [];
  public dataLoaded: boolean;

  constructor(private deviceService: DevicesService, private toastr: ToastrService, private realtimeService: RealTimeService) { }

  ngOnInit() {
    this.dataLoaded = false;
    this.deviceService.getAllDevices().subscribe(devices => {
      this.devices = devices.map(dev => {
        dev.schedules = this.parseSchedules(dev.schedules);
        return dev;
      });
      this.dataLoaded = true;
    });
    this.realtimeService.getDeviceStatus().subscribe(status => {
      const response = JSON.parse(status.body).body;
      let device = this.devices.find(d => d.deviceId === response.deviceId);
      if (device) {
        device.lastStatusChange = response.lastStatusChange;
        device.schedules = this.parseSchedules(response.schedules);
        if (device.status != response.status) {
          this.toastr.success(
            `Lamp ${response.deviceId} was switched ${response.status ? 'ON' : 'OFF'} successully`,
            'Success'
          );
        }
        device.status = response.status;
      }
    });
  }

  public deviceSwitch(deviceId: string, status: number) {
    this.dataLoaded = false;
    this.deviceService.deviceSwitch(deviceId, status).subscribe(
      response => {
        const device = this.devices.find(d => d.deviceId === deviceId);
        device.status = response.lampStatus;
        this.dataLoaded = true;
      },
      errorRes => {
        this.dataLoaded = true;
        this.toastr.error(`Lamp couldn't be switched: ${errorRes.error.message}`, 'Error');
      });
  }

  public removeSchedule(device, schedule) {
    const index = device.schedules.findIndex(s => s.id === schedule.id);
    if (index > -1) {
      device.schedules.splice(index, 1);
    }
  }

  public addSchedule(device: any) {
    device.schedules.push({
      type: 'REPEATED',
      scheduledFor: new Date(),
      createdAt: null,
      desiredStatus: 1
    });
  }

  public saveSchedules(device: any) {
    this.dataLoaded = false;
    this.deviceService.scheduleSwitches(device.deviceId, device.schedules).subscribe(
      schedules => {
        device.schedules = this.parseSchedules(schedules);
        this.dataLoaded = true;
        this.toastr.success('Schedules were saved successully', 'Success');
      },
      errorRes => {
        this.dataLoaded = true;
        this.toastr.error(`Schedules couldn't be saved: ${errorRes.error.message}`, 'Error');
      });
  }

  private parseSchedules(schedules: any[]): any[] {
    return schedules.map(s => {
      s.scheduledFor = new Date(s.scheduledFor);
      return s;
    });
  }
}
