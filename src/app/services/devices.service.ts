import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class DevicesService {

    constructor(private http: HttpClient) {

    }

    public getAllDevices(): Observable<any> {
      return this.http.get<any>(environment.apiHost + '/devices');
    }

    public deviceSwitch(deviceId: string, status: number): Observable<any> {
        const body = {
            lampStatus: status
        }
        return this.http.post<any>(`${environment.apiHost}/devices/${deviceId}/switch`, body);
    }

    public scheduleSwitches(deviceId: string, schedules: any[]): Observable<any> {
      return this.http.post<any>(`${environment.apiHost}/devices/${deviceId}/schedule`, schedules);
  }
}
