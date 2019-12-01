import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class TimeseriesService {

    constructor(private http: HttpClient) {

    }

    public getTimeseries(type: string, from: Date, to: Date) {
      const url = "/timeseries?type=" + type + "&from=" + from.toISOString() + "&to=" + to.toISOString();
      return this.http.get<any>(environment.apiHost + url);
    }
}
